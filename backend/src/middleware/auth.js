const { verifyAccess } = require("../utils/jwt");
const prisma = require("../utils/prisma");

// ── User Auth ────────────────────────────────────────
const authUser = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = verifyAccess(header.slice(7));
    if (payload.role !== "user") return res.status(403).json({ error: "Forbidden" });
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) return res.status(401).json({ error: "Account inactive or not found" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ── Admin Auth ───────────────────────────────────────
const authAdmin = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = verifyAccess(header.slice(7));
    if (!["admin", "staff", "super_admin"].includes(payload.role)) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin || !admin.isActive) return res.status(401).json({ error: "Admin account inactive" });
    
    // Check token version to support session revocation
    if (payload.tokenVersion !== undefined && admin.tokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ error: "Session has been revoked or logged out" });
    }

    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ── Optional User Auth (guest-friendly) ─────────────
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccess(header.slice(7));
      if (payload.role === "user") {
        req.user = await prisma.user.findUnique({ where: { id: payload.id } });
      }
    } catch {}
  }
  next();
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.admin || !allowedRoles.includes(req.admin.role)) {
    return res.status(403).json({ error: "You don't have permission to perform this action" });
  }
  next();
};

module.exports = { authUser, authAdmin, optionalAuth, requireRole };
