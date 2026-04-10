CREATE TYPE "public"."scan_status" AS ENUM('pending', 'scanning', 'analyzing', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."violation_category" AS ENUM('security', 'architecture', 'file_structure', 'scaling', 'data_layer');--> statement-breakpoint
CREATE TYPE "public"."violation_severity" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."violation_status" AS ENUM('open', 'approved', 'rejected', 'fixed');--> statement-breakpoint
CREATE TABLE "blueprints" (
	"id" text PRIMARY KEY NOT NULL,
	"scan_id" text NOT NULL,
	"architecture_summary" text NOT NULL,
	"security_summary" text NOT NULL,
	"scaling_summary" text NOT NULL,
	"proposed_structure" jsonb,
	"mermaid_diagram" text NOT NULL,
	"raw_blueprint" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blueprints_scan_id_unique" UNIQUE("scan_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scaling_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"scan_id" text NOT NULL,
	"current_bottlenecks" jsonb NOT NULL,
	"plan_100_users" jsonb NOT NULL,
	"plan_10k_users" jsonb NOT NULL,
	"plan_100k_users" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "scaling_plans_scan_id_unique" UNIQUE("scan_id")
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "scan_status" DEFAULT 'pending' NOT NULL,
	"total_files" integer DEFAULT 0,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "violations" (
	"id" text PRIMARY KEY NOT NULL,
	"scan_id" text NOT NULL,
	"project_id" text NOT NULL,
	"category" "violation_category" NOT NULL,
	"severity" "violation_severity" NOT NULL,
	"status" "violation_status" DEFAULT 'open' NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"location" text,
	"current_code" text,
	"fix_description" text NOT NULL,
	"fix_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "blueprints" ADD CONSTRAINT "blueprints_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scaling_plans" ADD CONSTRAINT "scaling_plans_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "violations" ADD CONSTRAINT "violations_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;