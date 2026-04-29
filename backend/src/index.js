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
      { key: "site_fssai",       value: "",                           group: "general" },
      { key: "social_instagram", value: "",                           group: "social" },
      { key: "social_facebook",  value: "",                           group: "social" },
      { key: "social_youtube",   value: "",                           group: "social" },
      { key: "social_linkedin",  value: "",                           group: "social" },
      { key: "contact_whatsapp",      value: "",                      group: "contact" },
      { key: "contact_support_email", value: "support@zupwell.com",   group: "contact" },
      { key: "contact_info_email",    value: "info@zupwell.com",      group: "contact" },
      { key: "contact_instagram",     value: "",                      group: "contact" },
      { key: "contact_facebook",      value: "",                      group: "contact" },
      { key: "hero_badge",       value: "Ahmedabad\'s #1 Health Supplement Store", group: "home" },
      { key: "hero_title",       value: "A True Companion to Your Health",          group: "home" },
      { key: "hero_tagline",     value: "\u0aa4\u0aae\u0abe\u0ab0\u0abe \u0ab8\u0acd\u0ab5\u0abe\u0ab8\u0acd\u0aa5\u0acd\u0aaf \u0ab8\u0abe\u0aa5\u0ac7 \u0a9a\u0abe\u0ab2\u0acb \u2014 \u0a9d\u0ac1\u0aaa\u0ab5\u0ac7\u0ab2!", group: "home" },
      { key: "hero_subtext",     value: "Science-backed supplements. Quality is our mantra.", group: "home" },
      { key: "hero_stat1_value", value: "200+",            group: "home" },
      { key: "hero_stat1_label", value: "Products",        group: "home" },
      { key: "hero_stat2_value", value: "50K+",            group: "home" },
      { key: "hero_stat2_label", value: "Happy Customers", group: "home" },
      { key: "hero_stat3_value", value: "100%",            group: "home" },
      { key: "hero_stat3_label", value: "Authentic",       group: "home" },
      { key: "feature1_title", value: "Science-Backed",    group: "home" },
      { key: "feature1_desc",  value: "Clinically studied ingredients for maximum effectiveness.", group: "home" },
      { key: "feature2_title", value: "Sugar-Free",        group: "home" },
      { key: "feature2_desc",  value: "Great taste without the sugar load.",                      group: "home" },
      { key: "feature3_title", value: "Instant Energy",    group: "home" },
      { key: "feature3_desc",  value: "Drop, fizz, drink, go.",                                   group: "home" },
      { key: "feature4_title", value: "Best Flavour",      group: "home" },
      { key: "feature4_desc",  value: "Health that actually tastes good.",                         group: "home" },
      { key: "cert_fssai_logo", value: "", group: "home" },
      { key: "cert_iso_logo",   value: "", group: "home" },
      { key: "cert_gmp_logo",   value: "", group: "home" },
      { key: "founder_name",    value: "Parag Hirpara", group: "about" },
      { key: "founder_title",   value: "Founder & CEO", group: "about" },
      { key: "founder_photo",   value: "",              group: "about" },
      { key: "founder_message", value: "At Zupwell, I started with a simple observation: traditional supplements often feel like a chore. I founded Zupwell to bridge the gap between clinical effectiveness and modern convenience.", group: "about" },
      { key: "about_punchline",   value: "We don\'t just sell supplements; we fuel your hustle.", group: "about" },
      { key: "about_description", value: "Zupwell was born with the aim of maintaining health and strength in the modern lifestyle. Quality is our mantra.", group: "about" },
      { key: "about_brand_story", value: "In today\'s fast-paced life, fatigue, dehydration, and lack of energy hold us back. That\'s exactly what Zupwell was started to solve.", group: "about" },
      { key: "about_mission",     value: "Health, which is not boring! We believe health supplements should be both effective and delicious.", group: "about" },
      { key: "about_vision",      value: "To be India\'s leading name in Health Supplements, recognized for quality, scientific integrity and commitment to well-being.", group: "about" },
      { key: "about_future",      value: "Our electrolyte formula is just the beginning. Innovation is in our DNA.", group: "about" },
      { key: "about_why1_title",  value: "Science-Backed",   group: "about" },
      { key: "about_why1_desc",   value: "Formulas grounded in clinical research.",                group: "about" },
      { key: "about_why2_title",  value: "Quality First",    group: "about" },
      { key: "about_why2_desc",   value: "High quality ingredients and best manufacturing standards.", group: "about" },
      { key: "about_why3_title",  value: "Consumer Centric", group: "about" },
      { key: "about_why3_desc",   value: "Customer convenience and choice are our top priorities.", group: "about" },
      { key: "free_shipping_threshold", value: "500", group: "orders" },
      { key: "default_shipping_charge", value: "50",  group: "orders" },
      { key: "order_prefix",            value: "ZW",  group: "orders" },
    ];
    // Only create if key doesnt exist — never overwrite user-saved values
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

// One-time fix: update shipping settings that were seeded as 0
(async () => {
  try {
    const prisma = require("./utils/prisma");
    const threshold = await prisma.setting.findUnique({ where: { key: "free_shipping_threshold" } });
    if (threshold && (threshold.value === "0" || threshold.value === "")) {
      await prisma.setting.update({ where: { key: "free_shipping_threshold" }, data: { value: "500" } });
    }
    const charge = await prisma.setting.findUnique({ where: { key: "default_shipping_charge" } });
    if (charge && (charge.value === "0" || charge.value === "")) {
      await prisma.setting.update({ where: { key: "default_shipping_charge" }, data: { value: "50" } });
    }
  } catch {}
})();