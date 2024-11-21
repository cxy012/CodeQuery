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

    const { languages, owner, repo, treeSHA } = response.data;
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

    const limitedTargetFiles = targetFiles.slice(0, 100);
    const filePaths = limitedTargetFiles.map((file) => file.path);
    const filePathsForPrompt = filePaths.join("\n");

    return NextResponse.json(filePathsForPrompt, {
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
