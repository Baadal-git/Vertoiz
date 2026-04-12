import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FIX_SYSTEM_PROMPT = `You are a senior software engineer applying a precise code fix.

You will be given:
1. The FULL content of a file
2. A violation description — what is wrong and why
3. The location of the violation

Your job is to generate the minimal fix. Rules:

ALWAYS try to fix at the function level first — replace only the function that contains the issue.

Return a JSON object with this exact shape:
{
  "strategy": "function" | "file",
  "reasoning": string,
  "functionName": string | null,
  "originalCode": string,
  "fixedCode": string,
  "explanation": string
}

- strategy "function": you are replacing a single function
- strategy "file": the entire file needs to be replaced (only use this if the violation spans multiple functions or the file structure itself is wrong)
- originalCode: the exact current code being replaced (must match exactly what's in the file)
- fixedCode: the corrected replacement code
- explanation: one sentence explaining what changed and why
- functionName: the name of the function being changed, or null if strategy is "file"

CRITICAL RULES:
- originalCode must be an EXACT substring of the file content provided. Copy it character for character.
- fixedCode must be a drop-in replacement for originalCode
- Do not change anything outside the target function
- Do not add imports unless absolutely necessary for the fix
- Do not reformat or restyle code outside the fix
- If you cannot make a surgical fix without replacing the whole file, set strategy to "file"
- Never return partial functions — always return complete, syntactically valid code
- Respond with raw JSON only. No markdown, no explanation outside the JSON.`;

export interface SurgicalFix {
  strategy: "function" | "file";
  reasoning: string;
  functionName: string | null;
  originalCode: string;
  fixedCode: string;
  explanation: string;
}

export async function generateSurgicalFix(
  fileContent: string,
  filePath: string,
  violationTitle: string,
  violationDescription: string,
  violationLocation: string,
  fixDescription: string
): Promise<SurgicalFix> {
  const userMessage = `FILE PATH: ${filePath}

FILE CONTENT:
\`\`\`
${fileContent}
\`\`\`

VIOLATION:
Title: ${violationTitle}
Location: ${violationLocation}
What is wrong: ${violationDescription}
What the fix should do: ${fixDescription}

Generate the minimal surgical fix for this violation.`;

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: FIX_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const raw = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const cleaned = raw
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();

  const fix: SurgicalFix = JSON.parse(cleaned);

  // Validate that originalCode actually exists in the file
  if (!fileContent.includes(fix.originalCode)) {
    throw new Error(
      `Fix validation failed: originalCode not found in file. Claude may have hallucinated the original code.`
    );
  }

  return fix;
}
