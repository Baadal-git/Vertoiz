import { randomBytes } from "crypto";
import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { db } from "../db";
import { userTokens } from "../db/schema";

export const authRouter = Router();

// POST /api/auth/token — exchange a valid Clerk session JWT for a static extension token.
authRouter.post("/token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = createVertoizToken();

    await db.insert(userTokens).values({
      token,
      userId,
      createdAt: new Date(),
    });

    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
});

function createVertoizToken() {
  return `vtz_${randomBytes(24).toString("base64url").slice(0, 32)}`;
}
