import { Router } from "express";
import { z } from "zod";
import { getUserId, requireAuth } from "../middleware/auth";
import {
  consumeGitHubOAuthState,
  handleGitHubCallback,
  initiateGitHubOAuth,
} from "../github/auth";
import { GitHubNotConnectedError, listUserRepos } from "../github/repos";

export const githubRouter = Router();

const CallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

githubRouter.get("/connect", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const authorizationUrl = await initiateGitHubOAuth(userId);

    if (req.accepts(["json", "html"]) === "json") {
      res.json({ url: authorizationUrl });
      return;
    }

    res.redirect(authorizationUrl);
  } catch (err) {
    console.error("GitHub connect error:", err);
    res.status(500).json({ error: "Failed to start GitHub connection" });
  }
});

githubRouter.get("/callback", async (req, res) => {
  const parsed = CallbackQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid GitHub callback" });
    return;
  }

  const { code, state } = parsed.data;

  try {
    const userId = await consumeGitHubOAuthState(state);

    if (!userId) {
      res.status(400).json({ error: "Invalid or expired GitHub state" });
      return;
    }

    await handleGitHubCallback(code, userId);

    const redirectUrl = new URL(
      "/dashboard",
      process.env.FRONTEND_URL ?? "https://vertoiz.com"
    );
    redirectUrl.searchParams.set("github", "connected");

    res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("GitHub callback error:", err);
    res.status(500).json({ error: "Failed to connect GitHub" });
  }
});

githubRouter.get("/repos", requireAuth, async (req, res) => {
  try {
    const userId = getUserId(req);
    console.log("GET /api/github/repos:", { userId });
    const repos = await listUserRepos(userId);

    res.json({ repos });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = err instanceof GitHubNotConnectedError ? 404 : 500;

    console.error("GitHub repos handler error:", {
      status,
      message,
    });

    res.status(status).json({ error: message });
  }
});
