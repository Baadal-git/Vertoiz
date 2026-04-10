# Vertoiz Backend

The analysis engine and API for Vertoiz.

## Stack
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Clerk auth
- Anthropic Claude API
- Deployed on Railway

## Local Setup

```bash
npm install
cp .env.example .env
# Fill in .env with your keys

# Generate and run migrations
npm run db:generate
npm run db:migrate

# Start dev server
npm run dev
```

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Create a new Railway project
3. Add a PostgreSQL service
4. Connect your repo
5. Set environment variables (copy from .env.example)
6. Railway auto-deploys on push

## API

### POST /api/scans
Start a new scan. Called by the VS Code extension.
- Auth: Clerk JWT in Authorization header
- Body: `{ projectName, context: ScanContext }`
- Returns: `{ scanId, projectId, status: "analyzing" }`

### GET /api/scans/:scanId
Poll scan status and get the full report.
- Auth: Clerk JWT
- Returns: `ScanReport`

### GET /api/scans
List all scans for the authenticated user.

### PATCH /api/scans/violations/:violationId
Approve or reject a fix from the dashboard.
- Body: `{ status: "approved" | "rejected" }`

## Architecture

```
src/
  index.ts              — Express app, middleware, routes
  middleware/
    auth.ts             — Clerk auth middleware
  routes/
    scan.ts             — Scan endpoints
  services/
    analysis.ts         — Claude analysis engine (the brain)
    scan.ts             — Scan orchestration and DB operations
  db/
    index.ts            — Drizzle DB connection
    migrate.ts          — Migration runner
    schema/
      index.ts          — All table definitions
  lib/
    types.ts            — Shared TypeScript interfaces
```
