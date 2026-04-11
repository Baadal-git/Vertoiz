import { getAuth, clerkMiddleware } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { userTokens } from "../db/schema";

export const clerk = clerkMiddleware();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // First try standard Clerk auth attached by clerkMiddleware.
    const { userId } = getAuth(req);

    if (userId) {
      (req as any).userId = userId;
      next();
      return;
    }

    // Fall back to a long-lived Vertoiz extension token.
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer vtz_")) {
      const token = authHeader.replace("Bearer ", "").trim();

      const [storedToken] = await db
        .select({ userId: userTokens.userId })
        .from(userTokens)
        .where(eq(userTokens.token, token))
        .limit(1);

      if (storedToken) {
        (req as any).userId = storedToken.userId;
        next();
        return;
      }
    }

    res.status(401).json({ error: "Unauthorized" });
  } catch (err) {
    next(err);
  }
}

export function getUserId(req: Request): string {
  const userId = (req as any).userId || getAuth(req).userId;
  if (!userId) throw new Error("getUserId called without requireAuth");
  return userId;
}
