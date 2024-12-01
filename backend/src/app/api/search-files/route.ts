import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchRepoFiles } from "@/lib/github-api-client";
import {
  getExtensionByLanguage,
  getFileExtension,
} from "@/lib/programming-languages";

const schema = z.object({
  languages: z.array(z.string()),
  owner: z.string(),
  repo: z.string(),
  treeSHA: z.string(),
  question: z.string(),
});

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const requestBody = await req.json();
    const response = schema.safeParse(requestBody);
    if (!response.success) {
      const { errors } = response.error;
      return NextResponse.json(
        {
          error: { message: "Invalid request params", errors: errors },
        },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const { languages, owner, repo, treeSHA, question } = response.data;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      return NextResponse.json(
        {
          error: {
            message: "GitHub token is missing in environment variables",
          },
        },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const { tree: files } = await fetchRepoFiles(owner, repo, treeSHA);
    const extensions = languages.flatMap((language) =>
      getExtensionByLanguage(language)
    );
    const targetFileExtensions = new Set(extensions);

    const targetFiles = files.filter((file) => {
      if (!file.path || (file.type && file.type === "tree")) {
        return false;
      }

      const ext = getFileExtension(file.path);
      return ext !== undefined && targetFileExtensions.has(ext);
    });

    const filePaths = targetFiles.map((file) => file.path).join("\n");

    const prompt = generateSearchPrompt(
      owner,
      repo,
      question,
      filePaths,
      15000
    );

    return NextResponse.json(prompt, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

function generatePrompt(
  owner: string,
  repo: string,
  question: string,
  filePaths: string
): string {
  return `You are provided with the following list of file paths from the ${owner}/${repo} GitHub repository. Your task is to determine the most relevant file paths that may contain core implementation logic related to the question: "${question}". Do not generate new paths, only select from the provided list.

Guidelines:
1. Only include core implementation files, do not include any files that are related to testing, types, documentation, design, or configuration.
2. Provide only the top 5 most relevant file paths.
3. Ensure the response contains only the file paths from the given list, formatted as follows:
   - Return each file path with a number at the beginning, followed by a dot and a space (e.g., "1. path/to/file").
   - The response should contain **only** the numbered file paths, and no additional explanation or commentary.

Here is the list of file paths:
${filePaths}
`;
}

function generateSearchPrompt(
  owner: string,
  repo: string,
  question: string,
  filePaths: string,
  maxPromptLength: number
): string {
  const filePathArray = filePaths.split("\n");

  let prompt = generatePrompt(owner, repo, question, filePathArray.join("\n"));

  while (prompt.length > maxPromptLength && filePathArray.length > 0) {
    filePathArray.pop();
    prompt = generatePrompt(owner, repo, question, filePathArray.join("\n"));
  }

  return prompt;
}
