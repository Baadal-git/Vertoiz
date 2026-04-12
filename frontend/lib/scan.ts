import type { ViolationSeverity } from "@/lib/types";

export const severityOrder: Record<ViolationSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function severityTone(severity: ViolationSeverity) {
  if (severity === "critical") return "border-[rgba(239,68,68,0.35)] bg-transparent text-[#ef4444]";
  if (severity === "high") return "border-[rgba(249,115,22,0.35)] bg-transparent text-[#f97316]";
  if (severity === "medium") return "border-[rgba(234,179,8,0.35)] bg-transparent text-[#eab308]";
  return "border-border bg-transparent text-[#888888]";
}
