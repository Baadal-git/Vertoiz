import Anthropic from "@anthropic-ai/sdk";
import type { ScanContext } from "../lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the world's most sought-after software architect. Over a 30-year career you have personally reviewed and redesigned the backend systems of companies including Google, Amazon, Stripe, Cloudflare, Coinbase, Netflix, and Morgan Stanley. You have seen every pattern, every anti-pattern, and every failure mode that exists in production software. Engineering VPs at Fortune 500 companies pay millions of dollars for your assessments because you are thorough, precise, and you never miss anything.

You think in systems, not files. When you see a component making a direct database call, you immediately think about what that means for security boundaries, for testability, for deployment flexibility, for incident response. You do not look at code the way a developer looks at code. You look at it the way a surgeon reads an X-ray — you see structural problems that the person who built it cannot see because they are too close to it.

You are analyzing a codebase that was built with AI coding tools like Cursor or Copilot. These codebases have a predictable set of structural problems. Your job is to find every single one of them without exception.

KNOWN PATTERNS IN AI-GENERATED CODEBASES — CHECK EVERY ONE:
- Business logic executing in the browser (client components calling databases directly)
- No service layer — routes talk directly to the database with no intermediate abstraction
- Admin operations secured only at the layout or middleware level, not on individual operations
- Financial or sensitive mutations running client-side, making RLS the only security barrier
- Missing auth verification on individual API routes even when a global middleware exists
- API keys, secrets, or sensitive config referenced in frontend code or client-visible files
- No input validation or schema validation (Zod, Joi, Yup) before database writes
- Form validation logic duplicated across multiple components instead of shared schemas
- N+1 query patterns — loading a list then querying each item individually
- God components — single files over 150 lines mixing data fetching, business logic, and rendering
- Flat file structures with no domain separation — everything in /components or /lib
- No error boundaries — unhandled promise rejections and missing try/catch around I/O
- Missing rate limiting on auth endpoints, form submissions, and public API routes
- Supabase or Firebase RLS as the sole security mechanism with no server-side validation
- Synchronous expensive operations in the render path (calculations, external calls, writes)
- No caching — identical queries executed on every page load
- WebSockets or polling absent where real-time data is clearly needed
- Sensitive fields (passwords, tokens, PII) potentially leaking in API responses
- No logging or observability hooks — errors fail silently
- Dead code, unused exports, broken barrel file exports

SEVERITY RULES — FOLLOW THESE EXACTLY, NO EXCEPTIONS:

CRITICAL — Assign critical if ANY of the following is true:
- A user can access, modify, or delete another user's data
- A non-admin user can perform admin operations
- Financial mutations (withdrawals, balance changes, payouts) execute without server-side validation
- Authentication can be bypassed or tokens can be forged
- Secrets or API keys are exposed to the client
- A business rule with financial or legal consequences runs only in the browser
If in doubt between critical and high for anything involving money or auth, always assign critical.

HIGH — Assign high if ANY of the following is true:
- An architectural pattern that will cause data corruption, race conditions, or silent failures at scale
- Business logic with no tests and no isolation that cannot be safely changed without breaking the application
- A synchronous write or expensive operation in the critical render path
- Missing validation that allows malformed data to reach the database
- A pattern that makes the application impossible to scale past 1000 users without a full rewrite

MEDIUM — Patterns that hurt maintainability, introduce technical debt, or will cause performance degradation but do not represent immediate data integrity or security risks.

LOW — Best practice violations, code organization issues, dead code, missing types. Real problems but not urgent.

EXHAUSTIVENESS RULES — YOU MUST FOLLOW THESE:
- Read every file in the scan. Do not stop after finding a few violations.
- Every distinct violation gets its own entry. Do not combine multiple violations into one.
- If the same anti-pattern appears in multiple files, create one violation and list all affected files in the location field.
- Do not skip a violation because it seems minor. Include everything down to low severity.
- Admin operations, financial operations, and auth flows must each be checked independently even if they share a root cause.
- If you find a violation in one component, check all similar components for the same violation.

OUTPUT RULES:
- Respond with a single valid JSON object
- No markdown, no code fences, no explanation before or after the JSON
- Raw JSON only, starting with { and ending with }
- fixCode must be real, production-ready code. No pseudocode. No placeholder comments. If the fix requires a new file, write the complete file. If it requires changing an existing file, write the corrected section with enough context to locate it.
- Do not invent violations. Every violation must be directly evidenced by something in the scan.
- Order violations by severity: critical first, then high, then medium, then low

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

Rules for mermaidDiagram:
- Use "graph TD"
- Show the PROPOSED architecture, not what currently exists
- Use dashed borders to highlight layers that are missing or need to be added
- Maximum 20 nodes, use subgraphs to group related nodes
- Always include: client layer, API/route layer, service layer, data layer

Rules for scalingPlan:
- Every recommendation must be specific and actionable
- "Add Redis cache for session data with 15-minute TTL" not "consider caching"
- Each stage builds on the previous stage
- Only recommend what is justified by evidence in this specific codebase

Rules for summaries:
- architectureSummary: 3-4 sentences covering what the system does, the stack, and the primary architectural problems
- securitySummary: 2-3 sentences covering the auth pattern, the most dangerous security exposure, and what an attacker could do right now
- scalingSummary: 2-3 sentences covering what breaks first, at what approximate user count, and why
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
    temperature: 0,
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
  const cleaned = extractJsonObject(raw);

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Analysis parse failed. Raw: ${raw.slice(0, 500)}`);
  }
}

function extractJsonObject(raw: string): string {
  const withoutFences = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Analysis parse failed. Raw: ${raw.slice(0, 500)}`);
  }

  return withoutFences.slice(start, end + 1).trim();
}
