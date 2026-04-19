import { randomBytes } from "crypto";
import { and, eq, lt } from "drizzle-orm";
import { db } from "../db";
import { githubOAuthStates, userTokens } from "../db/schema";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
const STATE_TTL_MS = 10 * 60 * 1000;

type GitHubTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export async function initiateGitHubOAuth(userId: string): Promise<string> {
  const clientId = getRequiredEnv("GITHUB_APP_CLIENT_ID");
  const state = randomBytes(24).toString("hex");
  const now = new Date();

  await db
    .delete(githubOAuthStates)
    .where(lt(githubOAuthStates.expiresAt, now));

  await db.insert(githubOAuthStates).values({
    state,
    userId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + STATE_TTL_MS),
  });

  const url = new URL(GITHUB_AUTHORIZE_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("state", state);

  return url.toString();
}

export async function consumeGitHubOAuthState(
  state: string
): Promise<string | null> {
  const [storedState] = await db
    .select({
      state: githubOAuthStates.state,
      userId: githubOAuthStates.userId,
      expiresAt: githubOAuthStates.expiresAt,
    })
    .from(githubOAuthStates)
    .where(eq(githubOAuthStates.state, state))
    .limit(1);

  if (!storedState) {
    return null;
  }

  await db
    .delete(githubOAuthStates)
    .where(eq(githubOAuthStates.state, state));

  if (storedState.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return storedState.userId;
}

export async function handleGitHubCallback(
  code: string,
  userId: string
): Promise<string> {
  const clientId = getRequiredEnv("GITHUB_APP_CLIENT_ID");
  const clientSecret = getRequiredEnv("GITHUB_APP_CLIENT_SECRET");

  const response = await fetch(GITHUB_ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = (await response.json()) as GitHubTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ??
        data.error ??
        "GitHub did not return an access token"
    );
  }

  await db
    .delete(userTokens)
    .where(and(eq(userTokens.userId, userId), eq(userTokens.type, "github")));

  await db.insert(userTokens).values({
    token: data.access_token,
    userId,
    type: "github",
    createdAt: new Date(),
  });

  return data.access_token;
}
