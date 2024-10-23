import { Octokit } from "octokit";

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GitHub token is missing in environment variables");
  }
  return new Octokit({ auth: token });
}

// https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28
// https://octokit.github.io/rest.js/v20#repos-get-content
export const fetchGithubRefPathContent = async (
  owner: string,
  repo: string,
  ref: string,
  path: string | null
) => {
  const octokit = getOctokit();

  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: path ? path : "",
    ref,
  });

  return response.data;
};

export const fetchGithubRefPathFileContent = async (
  owner: string,
  repo: string,
  ref: string,
  path: string
) => {
  const octokit = getOctokit();

  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref,
    mediaType: {
      format: "raw",
    },
  });

  return response.data;
};

export async function fetchGithubBranch(
  owner: string,
  repo: string,
  branch: string
) {
  const octokit = getOctokit();
  const branchResponse = await octokit.request(
    `/repos/{owner}/{repo}/branches/{branch}`,
    {
      method: "GET",
      owner: owner,
      repo: repo,
      branch: branch,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        accept: "application/vnd.github+json",
      },
    }
  );
  return branchResponse.data;
}

export async function fetchCommitTrees(
  owner: string,
  repo: string,
  commitSHA: string
) {
  const octokit = getOctokit();
  const commitResponse = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: commitSHA,
  });
  return commitResponse.data;
}

export const fetchCommitInfo = async (
  owner: string,
  repo: string,
  ref: string
) => {
  const octokit = getOctokit();
  const commitResponse = await octokit.request(
    `/repos/{owner}/{repo}/commits/{ref}`,
    {
      method: "GET",
      owner: owner,
      repo: repo,
      ref: ref,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        accept: "application/vnd.github+json",
      },
    }
  );
  return commitResponse;
};

export async function fetchGithubRepo(owner: string, repo: string) {
  const octokit = getOctokit();
  const repoResponse = await octokit.rest.repos.get({ owner, repo });
  return repoResponse.data;
}

export async function fetchFileLatestCommit(
  owner: string,
  repo: string,
  path: string,
  ref: string
) {
  const octokit = getOctokit();
  const fileCommitsResponse = await octokit.request(
    `/repos/{owner}/{repo}/commits?path={path}&page=1&per_page=1&sha={ref}`,
    {
      method: "GET",
      owner: owner,
      repo: repo,
      path: path,
      ref: ref,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        accept: "application/vnd.github+json",
      },
    }
  );
  return fileCommitsResponse.data[0];
}

export async function fetchGithubUrl(githubUrl: string) {
  const octokit = getOctokit();
  const response = await octokit.request(githubUrl, {
    method: "GET",
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
      accept: "application/vnd.github+json",
    },
  });
  return response.data;
}

export async function fetchRepoLanguages(owner: string, repo: string) {
  const octokit = getOctokit();
  const response = await octokit.rest.repos.listLanguages({ owner, repo });
  return response.data;
}

// The limit for the tree array is 100,000 entries with a maximum size of 7 MB when using the recursive parameter.
// https://docs.github.com/en/rest/git/trees?apiVersion=2022-11-28
export async function fetchRepoFiles(
  owner: string,
  repo: string,
  treeSHA: string
) {
  const octokit = getOctokit();
  const response = await octokit.rest.git.getTree({
    owner,
    repo,
    recursive: "true",
    tree_sha: treeSHA,
  });
  return response.data;
}
