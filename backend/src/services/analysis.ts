import Anthropic from "@anthropic-ai/sdk";
import type { ScanContext } from "../lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a senior backend architect with 15+ years of experience at companies like Google, Stripe, and Cloudflare. You have reviewed hundreds of codebases and you think in production systems, not prototypes.

You are analyzing a codebase that was likely built with AI coding tools (Cursor, Copilot, etc). These codebases share common problems:
- Business logic in the wrong layer (frontend calling DB directly, API routes doing everything)
- No service layer between routes and database
- Missing auth checks on protected routes  
- API keys and secrets in frontend code
- No input validation before database writes
- Flat file structures that don't reflect domain boundaries
- God files doing too many things
- No error boundaries or proper error handling
- Missing rate limiting
- Supabase/Firebase RLS disabled or misconfigured
- WebSocket logic missing when it's clearly needed (multiplayer, real-time)
- No caching layer even when reads are heavily repeated
- N+1 query problems
- Sensitive data leaked in API responses

Your job is to analyze the scan context and produce a comprehensive architectural report.

You MUST respond with a single valid JSON object. No markdown, no explanation, no code fences. Raw JSON only.

The JSON must match this exact shape:

{
  "architectureSummary": string,
  "securitySummary": string,
  "scalingSummary": string,
  "violations": [
    {
      "category": "security" | "architecture" | "file_structure" | "scaling" | "data_layer",
      "severity": "critical" | "high" | "medium" | "low",
      "title": string,
      "description": string,
      "location": string,
      "currentCode": string | null,
      "fixDescription": string,
      "fixCode": string | null
    }
  ],
  "proposedFileStructure": {
    "description": string,
    "structure": string
  },
  "mermaidDiagram": string,
  "scalingPlan": {
    "currentBottlenecks": string[],
    "plan100Users": {
      "changes": string[],
      "rationale": string
    },
    "plan10kUsers": {
      "changes": string[],
      "rationale": string
    },
    "plan100kUsers": {
      "changes": string[],
      "rationale": string
    }
  }
}

Rules for violations:
- Be specific. Name the exact file, the exact pattern that's wrong, the exact fix.
- critical = security hole that exposes user data or allows unauthorized access
- high = architectural problem that will cause data corruption or major bugs at scale
- medium = pattern that will hurt maintainability or performance
- low = best practice violations that should be fixed but aren't urgent
- fixCode should be real, working code — not pseudocode. If the fix is a new file, write the full file. If it's a change to an existing file, write the corrected section.
- Do not invent violations. Only flag what the evidence in the scan actually supports.

Rules for proposedFileStructure:
- Show what this project's folder structure SHOULD look like
- Use a tree format with indentation
- Group by domain/feature not by type (not /models /controllers /routes — that's 2010)
- Separate concerns properly: API layer, service layer, data layer, shared utilities

Rules for mermaidDiagram:
- Use "graph TD"
- Show what the architecture SHOULD be, not just what exists
- Highlight missing layers with dashed borders or comments
- Max 20 nodes, use subgraphs

Rules for scalingPlan:
- Be concrete. "Add Redis cache for session storage" not "consider caching"
- Each stage builds on the previous
- Only recommend what's actually justified by the codebase

Rules for summaries:
- architectureSummary: 3-4 sentences. What the system does, what stack, what the main architectural problems are.
- securitySummary: 2-3 sentences. What auth pattern is used, what the main security risks are right now.
- scalingSummary: 2-3 sentences. What breaks first and at what scale.
`;

export interface AnalysisResult {
  architectureSummary: string;
  securitySummary: string;
  scalingSummary: string;
  violations: Violation[];
  proposedFileStructure: {
    description: string;
    structure: string;
  };
  mermaidDiagram: string;
  scalingPlan: ScalingPlan;
}

export interface Violation {
  category: "security" | "architecture" | "file_structure" | "scaling" | "data_layer";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  location: string;
  currentCode: string | null;
  fixDescription: string;
  fixCode: string | null;
}

export interface ScalingPlan {
  currentBottlenecks: string[];
  plan100Users: { changes: string[]; rationale: string };
  plan10kUsers: { changes: string[]; rationale: string };
  plan100kUsers: { changes: string[]; rationale: string };
}

export async function analyzeCodebase(context: ScanContext): Promise<AnalysisResult> {
  const userMessage = buildPrompt(context);

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  return parseAnalysis(raw);
}

function buildPrompt(ctx: ScanContext): string {
  return `Analyze this codebase and produce a full architectural report.

PROJECT: ${ctx.projectName}
TOTAL CODE FILES: ${ctx.totalFiles}

FILE TREE:
${ctx.fileTree.join("\n")}

ENTRY POINTS:
${ctx.entryPoints.join("\n") || "none detected"}

ROUTE / API FILES:
${ctx.routeFiles.join("\n") || "none detected"}

MODEL / SCHEMA FILES:
${ctx.modelFiles.join("\n") || "none detected"}

CONFIG FILES:
${ctx.configFiles.join("\n") || "none detected"}

DETECTED PATTERNS:
- Express: ${ctx.detectedPatterns.hasExpressRoutes}
- Fastify: ${ctx.detectedPatterns.hasFastifyRoutes}
- Next.js: ${ctx.detectedPatterns.hasNextJs}
- NestJS: ${ctx.detectedPatterns.hasNestJs}
- Prisma: ${ctx.detectedPatterns.hasPrisma}
- Mongoose: ${ctx.detectedPatterns.hasMongoose}
- Drizzle: ${ctx.detectedPatterns.hasDrizzle}
- Redis: ${ctx.detectedPatterns.hasRedis}
- JWT auth: ${ctx.detectedPatterns.hasJWT}
- Passport: ${ctx.detectedPatterns.hasPassport}
- Bull/BullMQ queues: ${ctx.detectedPatterns.hasBullQueue}
- Dockerfile: ${ctx.detectedPatterns.hasDockerfile}
- WebSockets: ${ctx.detectedPatterns.hasWebSockets}
- tRPC: ${ctx.detectedPatterns.hasTRPC}
- Supabase: ${ctx.detectedPatterns.hasSupabase}
- Firebase: ${ctx.detectedPatterns.hasFirebase}

ENVIRONMENT FILES PRESENT:
${ctx.envFileKeys.join(", ") || "none"}

KEY DEPENDENCIES:
${Object.keys(ctx.detectedPatterns.packageJson)
  .filter((k) => !k.startsWith("@types/"))
  .slice(0, 50)
  .join(", ")}

IMPORT GRAPH (sample):
${JSON.stringify(
  Object.fromEntries(Object.entries(ctx.importGraph).slice(0, 40)),
  null,
  2
)}

SENSITIVE PATTERN SCAN:
${ctx.sensitivePatterns.length > 0
  ? ctx.sensitivePatterns.map((p) => `- ${p.file}: ${p.pattern}`).join("\n")
  : "No obvious sensitive patterns detected in surface scan"}

API ROUTE HANDLERS (sample):
${ctx.routeHandlers.slice(0, 20).join("\n") || "none detected"}

SOURCE FILES (sample):
${formatSourceFiles(ctx.files ?? [])}`;
}

function formatSourceFiles(files: NonNullable<ScanContext["files"]>): string {
  if (files.length === 0) {
    return "No source file contents provided.";
  }

  let totalChars = 0;
  const maxTotalChars = 60000;
  const maxFileChars = 4000;
  const chunks: string[] = [];

  for (const file of files) {
    if (totalChars >= maxTotalChars) {
      break;
    }

    const content = file.content.slice(0, maxFileChars);
    const chunk = `--- ${file.path} ---\n${content}`;
    totalChars += chunk.length;
    chunks.push(chunk);
  }

  return chunks.join("\n\n");
}

function parseAnalysis(raw: string): AnalysisResult {
  const cleaned = raw
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Analysis parse failed. Raw: ${raw.slice(0, 500)}`);
  }
}
