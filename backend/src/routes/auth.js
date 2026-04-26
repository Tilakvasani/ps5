const router = require("express").Router();
const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { signAccess, signRefresh } = require("../utils/jwt");
const { authUser } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone: phone || undefined }] } });
  if (existing) return res.status(409).json({ error: "Email or phone already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, phone: phone || null, passwordHash } });

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

  const user = await prisma.user.findUnique({ where: { email } });
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
