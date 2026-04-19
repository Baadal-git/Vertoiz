import assert from "node:assert/strict";
import test from "node:test";
import { parseAnalysisResponse } from "../analysis";

const expected = {
  architectureSummary: "Architecture summary",
  securitySummary: "Security summary",
  scalingSummary: "Scaling summary",
  violations: [
    {
      category: "architecture",
      severity: "high",
      title: "Missing service layer",
      description: "Routes talk directly to the database.",
      location: "src/routes/users.ts",
      currentCode: null,
      fixDescription: "Introduce a service layer.",
      fixCode: "export async function getUsers() { return []; }",
    },
  ],
  proposedFileStructure: {
    description: "Proposed structure",
    structure: "src/services\nsrc/routes",
  },
  mermaidDiagram: "graph TD\nA[Client] --> B[API]",
  scalingPlan: {
    currentBottlenecks: ["No cache"],
    plan100Users: {
      changes: ["Add request validation"],
      rationale: "Stabilize inputs",
    },
    plan10kUsers: {
      changes: ["Add Redis"],
      rationale: "Reduce repeated load",
    },
    plan100kUsers: {
      changes: ["Shard writes"],
      rationale: "Scale throughput",
    },
  },
} as const;

const cleanJson = JSON.stringify(expected);

test("parseAnalysisResponse parses clean JSON", () => {
  assert.deepEqual(parseAnalysisResponse(cleanJson), expected);
});

test("parseAnalysisResponse parses JSON wrapped in ```json fences", () => {
  const wrapped = `\`\`\`json
${cleanJson}
\`\`\``;

  assert.deepEqual(parseAnalysisResponse(wrapped), expected);
});

test("parseAnalysisResponse parses JSON wrapped in plain ``` fences", () => {
  const wrapped = `\`\`\`
${cleanJson}
\`\`\``;

  assert.deepEqual(parseAnalysisResponse(wrapped), expected);
});
