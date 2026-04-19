import { Router } from "express";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { scans, violations } from "../db/schema";
import { getUserId, requireAuth } from "../middleware/auth";

export const violationRouter = Router();

const ApprovedViolationsQuerySchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
});

// GET /api/violations/approved?projectId=...
// Returns approved violations for the authenticated user's current project only.
violationRouter.get("/approved", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const parsedQuery = ApprovedViolationsQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json({
      error: "Invalid request",
      details: parsedQuery.error.flatten(),
    });
    return;
  }

  const { projectId } = parsedQuery.data;

  try {
    const approvedViolations = await db
      .select({
        id: violations.id,
        scanId: violations.scanId,
        title: violations.title,
        description: violations.description,
        location: violations.location,
        category: violations.category,
        severity: violations.severity,
        fixDescription: violations.fixDescription,
      })
      .from(violations)
      .innerJoin(scans, eq(violations.scanId, scans.id))
      .where(
        and(
          eq(scans.userId, userId),
          eq(scans.projectId, projectId),
          eq(violations.projectId, projectId),
          eq(violations.status, "approved")
        )
      );

    res.json({ violations: approvedViolations });
  } catch (err) {
    console.error("Approved violations error:", err);
    res.status(500).json({ error: "Failed to get approved violations" });
  }
});
