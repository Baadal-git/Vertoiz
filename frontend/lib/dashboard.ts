import type { ScanListItem, ScanReport } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  security: "Security",
  architecture: "Architecture",
  file_structure: "File Structure",
  data_layer: "Data Layer",
  scaling: "Scaling",
};

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function summarizeDashboard(
  scans: ScanListItem[],
  reports: Record<string, ScanReport>,
) {
  let criticalViolations = 0;
  let highViolations = 0;
  let pendingApprovals = 0;
  const projects = new Set<string>();
  const categoryTotals = new Map<string, number>();
  const fixProgressMap = new Map<string, number>([
    ["Approved", 0],
    ["Pending", 0],
    ["Rejected", 0],
  ]);

  scans.forEach((scan) => {
    projects.add(scan.projectId);
    const report = reports[scan.id];

    if (!report) {
      return;
    }

    report.violations.forEach((violation) => {
      if (violation.severity === "critical") criticalViolations += 1;
      if (violation.severity === "high") highViolations += 1;
      if (violation.status === "open") pendingApprovals += 1;

      const categoryName = categoryLabels[violation.category] ?? violation.category;
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) ?? 0) + 1);

      if (violation.status === "approved") {
        fixProgressMap.set("Approved", (fixProgressMap.get("Approved") ?? 0) + 1);
      } else if (violation.status === "rejected") {
        fixProgressMap.set("Rejected", (fixProgressMap.get("Rejected") ?? 0) + 1);
      } else {
        fixProgressMap.set("Pending", (fixProgressMap.get("Pending") ?? 0) + 1);
      }
    });
  });

  return {
    criticalViolations,
    highViolations,
    pendingApprovals,
    projectsScanned: projects.size,
    categoryCounts: [
      "Security",
      "Architecture",
      "File Structure",
      "Data Layer",
      "Scaling",
    ].map((name) => ({
      name,
      total: categoryTotals.get(name) ?? 0,
    })),
    fixProgress: Array.from(fixProgressMap.entries()).map(([name, value]) => ({
      name,
      value,
    })),
  };
}
