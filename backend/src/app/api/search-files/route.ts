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

    // Limit the number of files to prevent overly large prompts
    const limitedTargetFiles = targetFiles.slice(0, 300);
    const filePaths = limitedTargetFiles.map((file) => file.path);
    const filePathsForPrompt = filePaths.join("\n");

    // Generate the prompt
    const prompt = generateSearchPrompt(
      owner,
      repo,
      question,
      filePathsForPrompt
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

function generateSearchPrompt(
  owner: string,
  repo: string,
  question: string,
  filePaths: string
): string {
  return `You are provided with the following list of file paths from the ${owner}/${repo} GitHub repository. Your task is to determine the most relevant file paths that may contain core implementation logic related to the question: "${question}". Do not generate new paths, only select from the provided list.

Guidelines:
1. Only include core implementation files, and exclude any files that are related to testing, types, documentation, design, or configuration.
2. Provide only the top 5 most relevant file paths.
3. Ensure the response contains only file paths from the given list

Here is the list of file paths:
${filePaths}
`;
}
