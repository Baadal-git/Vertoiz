import { clerkMiddleware, getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

// Clerk middleware — attaches auth to every request
export const clerk = clerkMiddleware();

// requireAuth — use on any route that needs a logged-in user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

// getUserId — helper to get userId after requireAuth has run
export function getUserId(req: Request): string {
  const { userId } = getAuth(req);
  if (!userId) throw new Error("getUserId called without requireAuth");
  return userId;
}
