const router = require("express").Router();
const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { signAccess, signRefresh } = require("../utils/jwt");
const { authUser } = require("../middleware/auth");

// ── Password strength validator ──────────────────────
const isStrongPassword = (pwd) => {
  if (pwd.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
  if (!/[^A-Za-z0-9]/.test(pwd)) return "Password must contain at least one special character";
  return null;
};

// ── Email validator ──────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Input validation
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
  if (name.trim().length < 2) return res.status(400).json({ error: "Name must be at least 2 characters" });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email address" });

  // Strong password check
  const pwdError = isStrongPassword(password);
  if (pwdError) return res.status(400).json({ error: pwdError });

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone: phone || undefined }] } });
  if (existing) return res.status(409).json({ error: "Email or phone already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name: name.trim(), email: email.toLowerCase().trim(), phone: phone || null, passwordHash } });

  const accessToken = signAccess({ id: user.id, role: "user" });
  res.status(201).json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !user.isActive) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccess({ id: user.id, role: "user" });
  res.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => res.json({ message: "Logged out" }));

// GET /api/auth/me
router.get("/me", authUser, (req, res) => {
  const { id, name, email, phone } = req.user;
  res.json({ id, name, email, phone });
});

module.exports = router;
