require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { startCleanupJobs } = require("./utils/cleanupJobs");

const app = express();

// ── Security Headers ─────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// ── CORS ─────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ps5-hhvf.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));

// ── Block Direct Browser Access to API ───────────────
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const isApiRoute = req.path.startsWith("/api/");
  const isHealthCheck = req.path === "/health";
  if (isApiRoute && !isHealthCheck && !origin && !referer) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
});

// ── Body Parsers ─────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Rate Limiting ────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: { error: "Too many requests" } });
app.use("/api/", limiter);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: "Too many auth attempts. Try again later." } });
app.use("/api/auth/", authLimiter);

const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: { error: "Too many admin requests" } });
app.use("/api/admin/", adminLimiter);

// ── Routes ───────────────────────────────────────────
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/products",   require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/orders",     require("./routes/orders"));
app.use("/api/payments",   require("./routes/payments"));
app.use("/api/invoices",   require("./routes/invoices"));
app.use("/api/account",    require("./routes/account"));
app.use("/api/admin",      require("./routes/admin"));

// ── Public Settings ──────────────────────────────────
app.get("/api/settings", async (req, res) => {
  try {
    const prisma = require("./utils/prisma");
    const rows = await prisma.setting.findMany();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// ── Health Check ─────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ── 404 — Nice HTML for browser, JSON for API ────────
app.use((req, res) => {
  const acceptsHtml = req.headers.accept?.includes("text/html");
  if (acceptsHtml) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>404 - Not Found | Zupwell</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #F4F6FA; }
            .box { text-align: center; padding: 2rem; }
            h1 { font-size: 8rem; font-weight: 900; background: linear-gradient(90deg, #F47C41, #0B2C6F); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
            h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 1rem 0 0.5rem; }
            p { color: #6B7280; font-size: 1rem; margin-bottom: 2rem; }
            a { background: #F47C41; color: white; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: opacity 0.2s; }
            a:hover { opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>404</h1>
            <h2>Page not found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="https://ps5-hhvf.vercel.app">Go to Zupwell ↗</a>
          </div>
        </body>
      </html>
    `);
  }
  res.status(404).json({ error: "Not found" });
});

// ── Global Error Handler ─────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  const isProd = process.env.NODE_ENV === "production";
  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Validation error", details: err.errors });
  }
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Record already exists (duplicate)" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }
  res.status(err.status || 500).json({
    error: isProd ? "Something went wrong. Please try again." : err.message,
  });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  console.log(`🚀 Zupwell API running on http://localhost:${PORT}`);
  try {
    const prisma = require("./utils/prisma");
    const defaultSettings = [
      { key: "site_name",        value: "Zupwell",                    group: "general" },
      { key: "site_email",       value: "info@zupwell.com",           group: "general" },
      { key: "site_phone",       value: "+91 6355466208",             group: "general" },
      { key: "site_address",     value: "A-102 Adarsh Lifestyle, New India Colony, Ahmedabad, Gujarat - 382350", group: "general" },
      { key: "site_gstin",       value: "24XXXXXXXXXXXXX",            group: "general" },
      { key: "site_state_code",  value: "24 (Gujarat)",               group: "general" },
      { key: "social_instagram", value: "https://instagram.com",      group: "social" },
      { key: "social_facebook",  value: "https://facebook.com",       group: "social" },
      { key: "social_youtube",   value: "https://youtube.com",        group: "social" },
      { key: "social_linkedin",  value: "https://linkedin.com",       group: "social" },
    ];
    for (const s of defaultSettings) {
      await prisma.setting.upsert({
        where:  { key: s.key },
        update: {},
        create: { key: s.key, value: s.value, group: s.group },
      });
    }
    console.log("✅ Settings initialized");
  } catch (e) {
    console.error("⚠️  Settings seed failed:", e.message);
  }

  // Start background cleanup — auto-cancels stale pending Razorpay orders
  startCleanupJobs();
});