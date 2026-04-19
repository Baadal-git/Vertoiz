export type ScanStatus = "pending" | "scanning" | "analyzing" | "complete" | "failed";
export type ViolationSeverity = "critical" | "high" | "medium" | "low";
export type ViolationStatus = "open" | "approved" | "rejected" | "fixed";

export interface ScanListItem {
  id: string;
  projectId: string;
  projectName: string;
  status: ScanStatus;
  totalFiles: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Violation {
  id: string;
  category: "security" | "architecture" | "file_structure" | "data_layer" | "scaling" | string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  title: string;
  description: string;
  location: string | null;
  fixDescription: string;
  fixCode: string | null;
}

export interface ScanReport {
  scan: {
    id: string;
    status: ScanStatus;
    totalFiles: number;
    createdAt: string;
    completedAt: string | null;
  };
  blueprint: {
    architectureSummary: string;
    securitySummary: string;
    scalingSummary: string;
    mermaidDiagram: string;
    proposedStructure: unknown;
  } | null;
  violations: Violation[];
  scalingPlan: {
    id: string;
    scanId: string;
    currentBottlenecks: unknown;
    plan100Users: unknown;
    plan10kUsers: unknown;
    plan100kUsers: unknown;
    createdAt: string;
  } | null;
}

export interface GitHubRepoSummary {
  id: number;
  fullName: string;
  defaultBranch: string;
  private: boolean;
}

export interface ScanJobResponse {
  jobId: string;
  scanId: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: string;
  progress: number | Record<string, unknown>;
  result: unknown;
  failReason: string | null;
}
