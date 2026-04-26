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
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
app.listen(PORT, () => {
  console.log(`🚀 Zupwell API running on http://localhost:${PORT}`);
});
