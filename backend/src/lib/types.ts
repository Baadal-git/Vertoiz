// ScanContext — what the VS Code extension sends to the backend
export interface ScanContext {
  projectName: string;
  fileTree: string[];
  importGraph: Record<string, string[]>;
  detectedPatterns: {
    hasExpressRoutes: boolean;
    hasFastifyRoutes: boolean;
    hasNextJs: boolean;
    hasNestJs: boolean;
    hasPrisma: boolean;
    hasMongoose: boolean;
    hasDrizzle: boolean;
    hasRedis: boolean;
    hasJWT: boolean;
    hasPassport: boolean;
    hasBullQueue: boolean;
    hasDockerfile: boolean;
    hasWebSockets: boolean;
    hasTRPC: boolean;
    hasSupabase: boolean;
    hasFirebase: boolean;
    packageJson: Record<string, string>;
  };
  routeFiles: string[];
  modelFiles: string[];
  configFiles: string[];
  entryPoints: string[];
  routeHandlers: string[];       // extracted route signatures e.g. "GET /api/users"
  envFileKeys: string[];         // keys from .env.example (never values)
  sensitivePatterns: SensitivePattern[];
  totalFiles: number;
}

export interface SensitivePattern {
  file: string;
  pattern: string; // e.g. "hardcoded API key", "secret in frontend bundle"
}

// What comes back from a scan
export interface ScanResponse {
  scanId: string;
  projectId: string;
  status: "pending" | "scanning" | "analyzing" | "complete" | "failed";
}

// Full report returned to the dashboard
export interface ScanReport {
  scan: {
    id: string;
    status: string;
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
  violations: {
    id: string;
    category: string;
    severity: string;
    status: string;
    title: string;
    description: string;
    location: string | null;
    fixDescription: string;
    fixCode: string | null;
  }[];
  scalingPlan: unknown | null;
}
