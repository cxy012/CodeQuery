import { NextRequest, NextResponse } from "next/server";
import { getOctokit } from "@/lib/github-api-client";
import { z } from "zod";

const RepoMetadataSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  treeSHA: z.string(),
  ref_type: z.enum(["branch", "commit", "tag"]),
});

type TreeSHAType = "branch" | "commit" | "tag";

async function resolveTreeSHA(
  octokit: ReturnType<typeof getOctokit>,
  owner: string,
  repo: string,
  treeSHA: string,
  ref_type: TreeSHAType
): Promise<string | null> {
  try {
    if (ref_type === "branch") {
      const { data: branchData } = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: treeSHA,
      });
      return branchData.commit.sha;
    } else if (ref_type === "commit") {
      const { data: commitData } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: treeSHA,
      });
      return commitData.sha;
    } else if (ref_type === "tag") {
      const { data: tagData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `tags/${treeSHA}`,
      });
      return tagData.object.sha;
    }
  } catch (error) {
    console.error(`Error resolving ${ref_type}:`, error);
    return null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const treeSHA = searchParams.get("treeSHA");
  const ref_type = searchParams.get("ref_type");

  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { headers, status: 204 });
  }

  // Validate parameters
  if (
    !owner ||
    !repo ||
    !treeSHA ||
    !ref_type ||
    !["branch", "commit", "tag"].includes(ref_type)
  ) {
    return NextResponse.json(
      {
        error:
          "Owner, repo, treeSHA, and ref_type parameters are required and ref_type must be one of 'branch', 'commit', or 'tag'",
      },
      { status: 400, headers }
    );
  }

  const octokit = getOctokit();

  try {
    // Fetch repository information to determine if it is private
    const response = await octokit.rest.repos.get({ owner, repo });
    const repoData = response.data;

    const resolvedTreeSHA = await resolveTreeSHA(
      octokit,
      owner,
      repo,
      treeSHA,
      ref_type as TreeSHAType
    );

    if (!resolvedTreeSHA) {
      return NextResponse.json(
        { error: "Unable to resolve treeSHA" },
        { status: 404, headers }
      );
    }

    RepoMetadataSchema.parse({
      owner,
      repo,
      treeSHA: resolvedTreeSHA,
      ref_type,
    });

    return NextResponse.json(
      { owner, repo, treeSHA: resolvedTreeSHA, isPrivate: repoData.private },
      { status: 200, headers }
    );
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      console.error("Repository not found or access denied:", error);
      return NextResponse.json(
        {
          error: "Repository not found or access denied",
          details: error.message,
        },
        { status: 404, headers }
      );
    }

    console.error("Error fetching GitHub repository metadata:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Error retrieving repository metadata", details: message },
      { status: 500, headers }
    );
  }
}
