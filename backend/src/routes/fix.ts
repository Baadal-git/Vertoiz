import { Router } from "express";
import { z } from "zod";
import { requireAuth, getUserId } from "../middleware/auth";
import { db } from "../db";
import { violations, scans } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { generateSurgicalFix } from "../services/fixGenerator";

export const fixRouter = Router();

const FixRequestSchema = z.object({
  violationId: z.string(),
  fileContent: z.string().max(500000), // 500kb max
  filePath: z.string(),
});

const ApprovedFixesQuerySchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
});

// POST /api/fixes/generate
// Called by the extension when user has approved a violation
// Extension sends the actual file content, backend generates surgical fix
fixRouter.post("/generate", requireAuth, async (req, res) => {
  const parsed = FixRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const userId = getUserId(req);
  const { violationId, fileContent, filePath } = parsed.data;

  try {
    // Get the violation and verify ownership
    const violation = await db
      .select()
      .from(violations)
      .where(eq(violations.id, violationId))
      .limit(1);

    if (!violation[0]) {
      res.status(404).json({ error: "Violation not found" });
      return;
    }

    // Verify user owns this violation through scan
    const scan = await db
      .select()
      .from(scans)
      .where(eq(scans.id, violation[0].scanId))
      .limit(1);

    if (!scan[0] || scan[0].userId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Only generate fixes for approved violations
    if (violation[0].status !== "approved") {
      res.status(400).json({ error: "Violation must be approved before generating fix" });
      return;
    }

    const fix = await generateSurgicalFix(
      fileContent,
      filePath,
      violation[0].title,
      violation[0].description,
      violation[0].location ?? filePath,
      violation[0].fixDescription
    );

    res.json({
      violationId,
      strategy: fix.strategy,
      reasoning: fix.reasoning,
      functionName: fix.functionName,
      originalCode: fix.originalCode,
      fixedCode: fix.fixedCode,
      explanation: fix.explanation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Fix generation error:", message);
    res.status(500).json({ error: `Fix generation failed: ${message}` });
  }
});

// GET /api/fixes/approved?projectId=...
// Called by extension polling — returns approved violations for the current project only
fixRouter.get("/approved", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const parsedQuery = ApprovedFixesQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    res.status(400).json({
      error: "Invalid request",
      details: parsedQuery.error.flatten(),
    });
    return;
  }

  const { projectId } = parsedQuery.data;

  try {
    const projectScans = await db
      .select({ id: scans.id })
      .from(scans)
      .where(and(eq(scans.userId, userId), eq(scans.projectId, projectId)));

    if (projectScans.length === 0) {
      res.json({ violations: [] });
      return;
    }

    const scanIds = new Set(projectScans.map((scan) => scan.id));

    const approvedViolations = await db
      .select()
      .from(violations)
      .where(
        and(
          eq(violations.status, "approved"),
          eq(violations.projectId, projectId)
        )
      );

    const projectViolations = approvedViolations.filter((violation) =>
      scanIds.has(violation.scanId)
    );

    res.json({
      violations: projectViolations.map((v) => ({
        id: v.id,
        scanId: v.scanId,
        title: v.title,
        description: v.description,
        location: v.location,
        category: v.category,
        severity: v.severity,
        fixDescription: v.fixDescription,
      })),
    });
  } catch (err) {
    console.error("Approved fixes error:", err);
    res.status(500).json({ error: "Failed to get approved fixes" });
  }
});
