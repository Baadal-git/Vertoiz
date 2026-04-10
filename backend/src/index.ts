import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { clerk } from "./middleware/auth";
import { scanRouter } from "./routes/scan";

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS — only allow your dashboard origin
const allowedOrigins = [
  "https://vertoiz.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (VS Code extension, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Parse JSON — cap body size to prevent abuse
app.use(express.json({ limit: "2mb" }));

// Global rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests" },
  })
);

// Stricter limit on scan endpoint — Claude calls are expensive
app.use(
  "/api/scans",
  rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Scan rate limit exceeded. Max 5 scans per minute." },
  })
);

// Clerk auth middleware — attaches auth to all requests
app.use(clerk);

// Health check — Railway uses this
app.get("/health", (_, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// Routes
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
});

export default app;
