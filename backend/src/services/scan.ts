import { v4 as uuid } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  projects,
  scans,
  blueprints,
  violations,
  scalingPlans,
} from "../db/schema";
import { analyzeCodebase } from "./analysis";
import type { ScanContext } from "../lib/types";

export async function getOrCreateProject(userId: string, projectName: string) {
  // Check if project already exists for this user
  const existing = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .limit(20);

  const found = existing.find((p) => p.name === projectName);
  if (found) return found;

  const project = {
    id: uuid(),
    userId,
    name: projectName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(projects).values(project);
  return project;
}

export async function createScan(projectId: string, userId: string) {
  const scan = {
    id: uuid(),
    projectId,
    userId,
    status: "pending" as const,
    totalFiles: 0,
    createdAt: new Date(),
  };

  await db.insert(scans).values(scan);
  return scan;
}

export async function runAnalysis(scanId: string, context: ScanContext) {
  // Mark as analyzing
  await db
    .update(scans)
    .set({ status: "analyzing", totalFiles: context.totalFiles })
    .where(eq(scans.id, scanId));

  try {
    const result = await analyzeCodebase(context);

    // Store blueprint
    await db.insert(blueprints).values({
      id: uuid(),
      scanId,
      architectureSummary: result.architectureSummary,
      securitySummary: result.securitySummary,
      scalingSummary: result.scalingSummary,
      proposedStructure: result.proposedFileStructure,
      mermaidDiagram: result.mermaidDiagram,
      rawBlueprint: result as unknown as Record<string, unknown>,
      createdAt: new Date(),
    });

    // Store violations
    if (result.violations.length > 0) {
      const scan = await db
        .select()
        .from(scans)
        .where(eq(scans.id, scanId))
        .limit(1);

      await db.insert(violations).values(
        result.violations.map((v) => ({
          id: uuid(),
          scanId,
          projectId: scan[0].projectId,
          category: v.category,
          severity: v.severity,
          status: "open" as const,
          title: v.title,
          description: v.description,
          location: v.location || null,
          currentCode: v.currentCode || null,
          fixDescription: v.fixDescription,
          fixCode: v.fixCode || null,
          createdAt: new Date(),
        }))
      );
    }

    // Store scaling plan
    await db.insert(scalingPlans).values({
      id: uuid(),
      scanId,
      currentBottlenecks: result.scalingPlan.currentBottlenecks,
      plan100Users: result.scalingPlan.plan100Users,
      plan10kUsers: result.scalingPlan.plan10kUsers,
      plan100kUsers: result.scalingPlan.plan100kUsers,
      createdAt: new Date(),
    });

    // Mark complete
    await db
      .update(scans)
      .set({ status: "complete", completedAt: new Date() })
      .where(eq(scans.id, scanId));

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(scans)
      .set({ status: "failed", errorMessage: message })
      .where(eq(scans.id, scanId));
    throw err;
  }
}

export async function getScanReport(scanId: string, userId: string) {
  // Auth check — user must own this scan
  const scan = await db
    .select()
    .from(scans)
    .where(eq(scans.id, scanId))
    .limit(1);

  if (!scan[0] || scan[0].userId !== userId) return null;

  const [blueprint] = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.scanId, scanId))
    .limit(1);

  const violationList = await db
    .select()
    .from(violations)
    .where(eq(violations.scanId, scanId));

  const [scalingPlan] = await db
    .select()
    .from(scalingPlans)
    .where(eq(scalingPlans.scanId, scanId))
    .limit(1);

  return {
    scan: {
      id: scan[0].id,
      status: scan[0].status,
      totalFiles: scan[0].totalFiles,
      createdAt: scan[0].createdAt.toISOString(),
      completedAt: scan[0].completedAt?.toISOString() ?? null,
    },
    blueprint: blueprint
      ? {
          architectureSummary: blueprint.architectureSummary,
          securitySummary: blueprint.securitySummary,
          scalingSummary: blueprint.scalingSummary,
          mermaidDiagram: blueprint.mermaidDiagram,
          proposedStructure: blueprint.proposedStructure,
        }
      : null,
    violations: violationList.map((v) => ({
      id: v.id,
      category: v.category,
      severity: v.severity,
      status: v.status,
      title: v.title,
      description: v.description,
      location: v.location,
      fixDescription: v.fixDescription,
      fixCode: v.fixCode,
    })),
    scalingPlan: scalingPlan ?? null,
  };
}

export async function updateViolationStatus(
  violationId: string,
  userId: string,
  status: "approved" | "rejected" | "fixed"
) {
  // Verify ownership through scan -> project
  const violation = await db
    .select()
    .from(violations)
    .where(eq(violations.id, violationId))
    .limit(1);

  if (!violation[0]) return null;

  const scan = await db
    .select()
    .from(scans)
    .where(eq(scans.id, violation[0].scanId))
    .limit(1);

  if (!scan[0] || scan[0].userId !== userId) return null;

  await db
    .update(violations)
    .set({
      status,
      resolvedAt: new Date(),
    })
    .where(eq(violations.id, violationId));

  return { id: violationId, status };
}
