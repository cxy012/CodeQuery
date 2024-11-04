import { NextRequest, NextResponse } from "next/server";
import { getOctokit } from "@/lib/github-api-client";

export async function fetchGithubRepo(owner: string, repo: string) {
  const octokit = getOctokit();
  const repoResponse = await octokit.rest.repos.get({ owner, repo });
  return repoResponse.data;
}

export async function fetchRepoLanguages(owner: string, repo: string) {
  const octokit = getOctokit();
  const response = await octokit.rest.repos.listLanguages({ owner, repo });
  return response.data;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { headers, status: 204 });
  }

  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          error: {
            message: "GitHub token is missing in environment variables",
          },
        },
        { status: 500, headers }
      );
    }

    const [githubRepoData, languages] = await Promise.all([
      fetchGithubRepo(params.owner, params.repo),
      fetchRepoLanguages(params.owner, params.repo),
    ]);

    if (!githubRepoData) {
      return NextResponse.json(
        { error: { message: "No repo found in Github." } },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { repo: githubRepoData, languages },
      { status: 200, headers }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error getting GitHub repo metadata: ", error.message);
      const message = error.message || "Something went wrong";
      return NextResponse.json(
        { error: { message } },
        { status: 500, headers }
      );
    } else {
      console.error("Unexpected error: ", error);
      return NextResponse.json(
        { error: { message: "Something went wrong" } },
        { status: 500, headers }
      );
    }
  }
}
