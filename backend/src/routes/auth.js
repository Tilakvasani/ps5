const router = require("express").Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const prisma = require("../utils/prisma");
const { signAccess } = require("../utils/jwt");
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

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ── Google OAuth Setup ───────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || "https://ps5-hhvf.vercel.app";

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  `${process.env.BACKEND_URL || "https://ps5-ufm2.onrender.com"}/api/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    const name  = profile.displayName;
    if (!email) return done(new Error("No email from Google"));

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
          googleId: profile.id,
          isActive: true,
        },
      });
    } else if (!user.googleId) {
      // Link Google to existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id },
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

router.use(passport.initialize());

// ── Google OAuth Routes ──────────────────────────────
router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const token = signAccess({ id: req.user.id, role: "user" });
    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}`);
  }
);

// ── Register ─────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password are required" });
  if (name.trim().length < 2) return res.status(400).json({ error: "Name must be at least 2 characters" });
  if (!isValidEmail(email)) return res.status(400).json({ error: "Invalid email address" });

  const pwdError = isStrongPassword(password);
  if (pwdError) return res.status(400).json({ error: pwdError });

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone: phone || undefined }] } });
  if (existing) return res.status(409).json({ error: "Email or phone already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.toLowerCase().trim(), phone: phone || null, passwordHash }
  });

  const accessToken = signAccess({ id: user.id, role: "user" });
  res.status(201).json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
});

// ── Login ─────────────────────────────────────────────
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

// ── Logout ────────────────────────────────────────────
router.post("/logout", (req, res) => res.json({ message: "Logged out" }));

// ── Me ────────────────────────────────────────────────
router.get("/me", authUser, (req, res) => {
  const { id, name, email, phone } = req.user;
  res.json({ id, name, email, phone });
});

module.exports = router;