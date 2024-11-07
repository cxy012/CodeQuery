import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
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
  modelType: z.enum(["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"]),
});

function pathGeneratePrompt(
  owner: string,
  repo: string,
  question: string,
  filePathsForPrompt: string
): string {
  return `For answering ${owner}/${repo} github repo source code lookup question "${question}", provide me file paths may contains related code to the question from following github repository file paths. Don't include any test, type, design or doc files, only include core implementation logic files, and only show top 5 results. Provide the response in the same format as following file paths format without markdown format.\n\n\n${filePathsForPrompt}`;
}
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

    const { languages, owner, repo, treeSHA, question, modelType } =
      response.data;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!apiKey || !modelType || !githubToken) {
      return NextResponse.json(
        {
          error: {
            message:
              "API key, model ID, or GitHub token is missing in environment variables",
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

    const filePaths = targetFiles.map((file) => file.path);
    const filePathsForPrompt = filePaths.join("\n");
    const prompt = pathGeneratePrompt(
      owner,
      repo,
      question,
      filePathsForPrompt
    );

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });
    const model = google(`models/${modelType}`, {
      topK: 1,
    });

    const { text } = await generateText({
      model,
      prompt,
    });

    const pathSet = new Set(filePaths);
    const paths = text.split(/\r?\n/).filter((path) => pathSet.has(path));

    return NextResponse.json(paths, {
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
