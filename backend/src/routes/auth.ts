import { randomBytes } from "crypto";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { userTokens } from "../db/schema";

export const authRouter = Router();

// GET /api/auth/token — read the user's current extension token, if one exists.
authRouter.get("/token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const [existingToken] = await db
      .select({
        token: userTokens.token,
        createdAt: userTokens.createdAt,
      })
      .from(userTokens)
      .where(eq(userTokens.userId, userId))
      .orderBy(desc(userTokens.createdAt))
      .limit(1);

    if (!existingToken) {
      const token = createVertoizToken();
      const createdAt = new Date();

      await db.insert(userTokens).values({
        token,
        userId,
        createdAt,
      });

      res.json({
        token,
        createdAt: createdAt.toISOString(),
      });
      return;
    }

    res.json({
      token: existingToken.token,
      createdAt: existingToken.createdAt?.toISOString() ?? null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/token — regenerate the user's static extension token.
authRouter.post("/token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    await db.delete(userTokens).where(eq(userTokens.userId, userId));

    const token = createVertoizToken();
    const createdAt = new Date();

    await db.insert(userTokens).values({
      token,
      userId,
      createdAt,
    });

    res.status(201).json({ token, createdAt: createdAt.toISOString() });
  } catch (err) {
    next(err);
  }
});

function createVertoizToken() {
  return `vtz_${randomBytes(16).toString("hex")}`;
}
