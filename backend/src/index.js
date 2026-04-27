require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const app = express();

// ── Security ────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://ps5-hhvf.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { error: "Too many requests" } });
app.use("/api/", limiter);
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: "Too many auth attempts" } });
app.use("/api/auth/", authLimiter);

// ── Routes ──────────────────────────────────────────
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/account",  require("./routes/account"));
app.use("/api/admin",    require("./routes/admin"));

// Public settings endpoint (no auth) — used by storefront footer etc.
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

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  if (err.name === "ZodError") {
    return res.status(400).json({ error: "Validation error", details: err.errors });
  }
  if (err.code === "P2002") {
    return res.status(409).json({ error: "Record already exists (duplicate)" });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "Record not found" });
  }
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  console.log(`🚀 Zupwell API running on http://localhost:${PORT}`);

  // Auto-seed default settings if not present
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
});