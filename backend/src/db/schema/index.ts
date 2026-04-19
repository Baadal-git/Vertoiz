import { pgTable, text, timestamp, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const scanStatusEnum = pgEnum("scan_status", [
  "pending",
  "scanning",
  "analyzing",
  "complete",
  "failed",
]);

export const violationSeverityEnum = pgEnum("violation_severity", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const violationCategoryEnum = pgEnum("violation_category", [
  "security",
  "architecture",
  "file_structure",
  "scaling",
  "data_layer",
]);

export const violationStatusEnum = pgEnum("violation_status", [
  "open",
  "approved",
  "rejected",
  "fixed",
]);

// Projects — one per codebase a user connects
export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),           // Clerk user ID
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Long-lived extension tokens generated from a valid Clerk session
export const userTokens = pgTable("user_tokens", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").default("api").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const githubOAuthStates = pgTable("github_oauth_states", {
  state: text("state").primaryKey(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Scans — each time a user runs a full analysis
export const scans = pgTable("scans", {
  id: text("id").primaryKey(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  status: scanStatusEnum("status").default("pending").notNull(),
  totalFiles: integer("total_files").default(0),
  errorMessage: text("error_message"),
  fixPrUrl: text("fix_pr_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// The full blueprint JSON — stored separately to keep scans table lean
export const blueprints = pgTable("blueprints", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" })
    .unique(),
  architectureSummary: text("architecture_summary").notNull(),
  securitySummary: text("security_summary").notNull(),
  scalingSummary: text("scaling_summary").notNull(),
  proposedStructure: jsonb("proposed_structure"),   // what it SHOULD look like
  mermaidDiagram: text("mermaid_diagram").notNull(),
  rawBlueprint: jsonb("raw_blueprint").notNull(),    // full Claude output
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Violations — individual issues found per scan
export const violations = pgTable("violations", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull(),
  category: violationCategoryEnum("category").notNull(),
  severity: violationSeverityEnum("severity").notNull(),
  status: violationStatusEnum("status").default("open").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),   // what's wrong and why
  location: text("location"),                   // file path or service name
  currentCode: text("current_code"),            // what it looks like now
  fixDescription: text("fix_description").notNull(), // what the fix is
  fixCode: text("fix_code"),                    // actual code change if applicable
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// Scaling plans — generated alongside the blueprint
export const scalingPlans = pgTable("scaling_plans", {
  id: text("id").primaryKey(),
  scanId: text("scan_id")
    .notNull()
    .references(() => scans.id, { onDelete: "cascade" })
    .unique(),
  currentBottlenecks: jsonb("current_bottlenecks").notNull(),
  plan100Users: jsonb("plan_100_users").notNull(),
  plan10kUsers: jsonb("plan_10k_users").notNull(),
  plan100kUsers: jsonb("plan_100k_users").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
