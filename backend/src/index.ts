import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { clerk } from "./middleware/auth";
import { scanRouter } from "./routes/scan";
import { authRouter } from "./routes/auth";
import { fixRouter } from "./routes/fix";
import { jobRouter } from "./routes/job";
import { violationRouter } from "./routes/violation";
import { startWorkers } from "./workers";

const app = express();
const PORT = process.env.PORT || 3001;

console.log("Clerk key loaded:", !!process.env.CLERK_SECRET_KEY);

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = new Set(
  [
    "https://vertoiz.com",
    "https://www.vertoiz.com",
    ...(process.env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ],
);

const allowedOriginPatterns = [
  /^https:\/\/vertoiz\.vercel\.app$/,
  /^https:\/\/vertoiz-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/[a-z0-9-]+-baadal-gits-projects\.vercel\.app$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      if (allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
        return callback(null, true);
      }

      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Parse JSON
app.use(express.json({ limit: "2mb" }));

// Clerk auth — before everything else
app.use(clerk);

// Global rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
  })
);

// Stricter limit only for starting new scans.
app.post(
  "/api/scans",
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Scan rate limit exceeded. Max 5 scans per minute." },
  })
);

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/fixes", fixRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/violations", violationRouter);
app.use("/api/scans", scanRouter);

// 404
app.use((_, res) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Vertoiz backend running on port ${PORT}`);
  startWorkers();
});

export default app;
