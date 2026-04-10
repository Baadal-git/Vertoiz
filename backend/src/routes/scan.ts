import { Router } from "express";
import { z } from "zod";
import { requireAuth, getUserId } from "../middleware/auth";
import {
  getOrCreateProject,
  createScan,
  runAnalysis,
  getScanReport,
  updateViolationStatus,
} from "../services/scan";
import { db } from "../db";
import { scans, projects } from "../db/schema";
import { eq } from "drizzle-orm";

export const scanRouter = Router();

// POST /api/scans — start a new scan
// Called by the VS Code extension
const ScanRequestSchema = z.object({
  projectName: z.string().min(1).max(200),
  context: z.object({
    projectName: z.string(),
    fileTree: z.array(z.string()),
    importGraph: z.record(z.array(z.string())),
    detectedPatterns: z.object({
      hasExpressRoutes: z.boolean(),
      hasFastifyRoutes: z.boolean(),
      hasNextJs: z.boolean(),
      hasNestJs: z.boolean(),
      hasPrisma: z.boolean(),
      hasMongoose: z.boolean(),
      hasDrizzle: z.boolean(),
      hasRedis: z.boolean(),
      hasJWT: z.boolean(),
      hasPassport: z.boolean(),
      hasBullQueue: z.boolean(),
      hasDockerfile: z.boolean(),
      hasWebSockets: z.boolean(),
      hasTRPC: z.boolean(),
      hasSupabase: z.boolean(),
      hasFirebase: z.boolean(),
      packageJson: z.record(z.string()),
    }),
    routeFiles: z.array(z.string()),
    modelFiles: z.array(z.string()),
    configFiles: z.array(z.string()),
    entryPoints: z.array(z.string()),
    routeHandlers: z.array(z.string()),
    envFileKeys: z.array(z.string()),
    sensitivePatterns: z.array(
      z.object({ file: z.string(), pattern: z.string() })
    ),
    totalFiles: z.number(),
  }),
});

scanRouter.post("/", requireAuth, async (req, res) => {
  const parsed = ScanRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }

  const userId = getUserId(req);
  const { projectName, context } = parsed.data;

  try {
    const project = await getOrCreateProject(userId, projectName);
    const scan = await createScan(project.id, userId);

    // Fire analysis in background — don't await
    runAnalysis(scan.id, context).catch((err) => {
      console.error(`Scan ${scan.id} failed:`, err);
    });

    res.status(202).json({
      scanId: scan.id,
      projectId: project.id,
      status: "analyzing",
    });
  } catch (err) {
    console.error("Scan creation error:", err);
    res.status(500).json({ error: "Failed to start scan" });
  }
});

// GET /api/scans/:scanId — poll scan status and get report
scanRouter.get("/:scanId", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { scanId } = req.params;

  try {
    const report = await getScanReport(scanId, userId);
    if (!report) {
      res.status(404).json({ error: "Scan not found" });
      return;
    }

    res.json(report);
  } catch (err) {
    console.error("Get scan error:", err);
    res.status(500).json({ error: "Failed to get scan" });
  }
});

// GET /api/scans — list all scans for the user
scanRouter.get("/", requireAuth, async (req, res) => {
  const userId = getUserId(req);

  try {
    const userScans = await db
      .select({
        id: scans.id,
        projectId: scans.projectId,
        status: scans.status,
        totalFiles: scans.totalFiles,
        createdAt: scans.createdAt,
        completedAt: scans.completedAt,
        projectName: projects.name,
      })
      .from(scans)
      .innerJoin(projects, eq(scans.projectId, projects.id))
      .where(eq(scans.userId, userId))
      .orderBy(scans.createdAt);

    res.json(userScans);
  } catch (err) {
    console.error("List scans error:", err);
    res.status(500).json({ error: "Failed to list scans" });
  }
});

// PATCH /api/scans/violations/:violationId — approve or reject a fix
scanRouter.patch("/violations/:violationId", requireAuth, async (req, res) => {
  const userId = getUserId(req);
  const { violationId } = req.params;

  const schema = z.object({
    status: z.enum(["approved", "rejected"]),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    return;
  }

  try {
    const result = await updateViolationStatus(
      violationId,
      userId,
      parsed.data.status
    );

    if (!result) {
      res.status(404).json({ error: "Violation not found" });
      return;
    }

    res.json(result);
  } catch (err) {
    console.error("Update violation error:", err);
    res.status(500).json({ error: "Failed to update violation" });
  }
});
