import { Octokit } from "@octokit/rest";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { userTokens } from "../db/schema";

export type GitHubRepoSummary = {
  id: number;
  fullName: string;
  defaultBranch: string;
  private: boolean;
};

export class GitHubNotConnectedError extends Error {
  constructor() {
    super("GitHub is not connected for this user");
    this.name = "GitHubNotConnectedError";
  }
}

export async function listUserRepos(
  userId: string
): Promise<GitHubRepoSummary[]> {
  const [githubToken] = await db
    .select({
      token: userTokens.token,
    })
    .from(userTokens)
    .where(and(eq(userTokens.userId, userId), eq(userTokens.type, "github")))
    .orderBy(desc(userTokens.createdAt))
    .limit(1);

  console.log("GitHub token lookup:", {
    userId,
    hasGitHubToken: Boolean(githubToken),
  });

  if (!githubToken) {
    throw new GitHubNotConnectedError();
  }

  const octokit = new Octokit({
    auth: githubToken.token,
  });

  try {
    const repos = await octokit.paginate(
      octokit.rest.repos.listForAuthenticatedUser,
      {
        affiliation: "owner,collaborator,organization_member",
        per_page: 100,
        sort: "updated",
      }
    );

    console.log("GitHub repo list succeeded:", {
      userId,
      repoCount: repos.length,
    });

    return repos.map((repo) => ({
      id: repo.id,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      private: repo.private,
    }));
  } catch (err) {
    console.error("GitHub repo list failed:", {
      userId,
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
