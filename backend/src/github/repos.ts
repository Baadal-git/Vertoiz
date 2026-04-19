import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import { userTokens } from "../db/schema";

type OctokitClass = typeof import("@octokit/rest")["Octokit"];

// The backend is compiled as CommonJS, while @octokit/rest is ESM-only.
// Use a native dynamic import so Node 18 can load it without require().
const importOctokitRest = new Function(
  'return import("@octokit/rest")'
) as () => Promise<{ Octokit: OctokitClass }>;

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
  const token = await getGitHubTokenForUser(userId);
  const { Octokit } = await importOctokitRest();

  const octokit = new Octokit({
    auth: token,
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

export async function getGitHubTokenForUser(userId: string): Promise<string> {
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

  return githubToken.token;
}
