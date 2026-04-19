ALTER TABLE "user_tokens" ADD COLUMN "type" text DEFAULT 'api' NOT NULL;--> statement-breakpoint
CREATE TABLE "github_oauth_states" (
	"state" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
