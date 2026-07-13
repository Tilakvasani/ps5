const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { signAccess } = require("../utils/jwt");
const { authUser } = require("../middleware/auth");
const { sendSMS } = require("../utils/sms");

const JWT_SECRET = process.env.JWT_SECRET;
const PASSWORD_MIN_LENGTH = 8;

// ── Helpers ──────────────────────────────────────────────────────────

function cleanPhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

function isEmailLike(identifier) {
  return typeof identifier === "string" && identifier.includes("@");
}

// Never leak internal error details to the client.
function fail(res, status, message) {
  return res.status(status).json({ error: message });
}

async function throttleOtp(phone) {
  const recentCount = await prisma.otpCode.count({
    where: { phone, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  return recentCount >= 3;
}

async function createAndSendOtp(phone, label = "verification code") {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await prisma.otpCode.create({ data: { phone, codeHash, expiresAt } });
  await sendSMS(phone, `Your Zupwell ${label} is ${otp}. Valid for 5 minutes.`);
  console.log(`\n🔑 [OTP] For mobile: +91 ${phone} => Code is: ${otp}\n`);
}

/** Validates + consumes an OTP for a phone. Returns {ok, error, status} */
async function consumeOtp(phone, otp) {
  const record = await prisma.otpCode.findFirst({
    where: { phone, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { ok: false, status: 400, error: "OTP expired or not found. Request a new one." };
  if (record.attempts >= 5) return { ok: false, status: 429, error: "Too many incorrect attempts. Request a new OTP." };

  const isValid = await bcrypt.compare(otp, record.codeHash);
  if (!isValid) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, status: 400, error: "Invalid OTP code" };
  }

  await prisma.otpCode.delete({ where: { id: record.id } });
  return { ok: true };
}

function signShortToken(payload, scope, expiresIn) {
  return jwt.sign({ ...payload, scope }, JWT_SECRET, { expiresIn });
}

function verifyShortToken(token, expectedScope) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (payload.scope !== expectedScope) throw new Error("Invalid token scope");
  return payload;
}

function validatePasswordPair(password, confirmPassword) {
  if (!password || !confirmPassword) return "Password and confirmation are required";
  if (password !== confirmPassword) return "Passwords do not match";
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  return null;
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email || "", phone: user.phone || "" };
}

// ── STEP 1: Identify — single entry point for everyone ───────────────
// Given a phone number, decide the next step without revealing whether
// the number belongs to an admin: admin numbers and brand-new numbers
// both simply receive an OTP, so the response can't be used to enumerate
// admin accounts.
router.post("/identify", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    if (phone.length !== 10) return fail(res, 400, "Please enter a valid 10-digit mobile number");

    if (await throttleOtp(phone)) {
      return fail(res, 429, "Too many requests for this number. Try again in an hour.");
    }

    const admin = await prisma.admin.findFirst({ where: { number: { contains: phone } } });
    if (admin && admin.isActive) {
      await createAndSendOtp(phone, "access code");
      return res.json({ step: "otp" });
    }

    const user = await prisma.user.findFirst({ where: { phone: { endsWith: phone } } });
    if (user && user.passwordHash) {
      return res.json({ step: "password" });
    }

    // Either a brand-new number, or an existing legacy (OTP-only) user
    // who has never set a password yet — both need OTP verification next.
    await createAndSendOtp(phone);
    return res.json({ step: "otp" });
  } catch (err) {
    console.error("identify error:", err);
    fail(res, 500, "Something went wrong. Please try again.");
  }
});

// ── STEP 2a (existing user w/ password): direct login, no OTP ────────
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return fail(res, 400, "Please enter your credentials");

    // Admins are never allowed to authenticate through this endpoint —
    // they must always go through the phone + OTP gate.
    const admin = isEmailLike(identifier)
      ? await prisma.admin.findFirst({ where: { email: { equals: identifier.toLowerCase().trim(), mode: "insensitive" } } })
      : await prisma.admin.findFirst({ where: { number: { contains: cleanPhone(identifier) } } });
    if (admin) return fail(res, 401, "Invalid credentials");

    const user = isEmailLike(identifier)
      ? await prisma.user.findUnique({ where: { email: identifier.toLowerCase().trim() } })
      : await prisma.user.findFirst({ where: { phone: { endsWith: cleanPhone(identifier) } } });

    if (!user || !user.passwordHash || !user.isActive) return fail(res, 401, "Invalid credentials");

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return fail(res, 423, `Account temporarily locked. Try again in ${mins} minute(s).`);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      let lockedUntil = null;
      if (attempts >= 5) lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      else if (attempts >= 3) lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: attempts, lockedUntil } });
      if (attempts >= 5) return fail(res, 423, "Account temporarily locked. Try again in 30 minutes.");
      if (attempts >= 3) return fail(res, 429, "Too many failed attempts. Try again in 5 minutes.");
      return fail(res, 401, "Invalid credentials");
    }

    await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() } });

    const token = signAccess({ id: user.id, role: "user" });
    res.json({ accessToken: token, user: publicUser(user) });
  } catch (err) {
    console.error("login error:", err);
    fail(res, 500, "Login failed. Please try again.");
  }
});

// ── STEP 2b: Verify the identify OTP, branch into the right next step ─
router.post("/verify-identify-otp", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    const { otp } = req.body;
    if (phone.length !== 10 || !otp) return fail(res, 400, "Phone number and OTP code are required");

    const result = await consumeOtp(phone, otp);
    if (!result.ok) return fail(res, result.status, result.error);

    const admin = await prisma.admin.findFirst({ where: { number: { contains: phone } } });
    if (admin && admin.isActive) {
      const gateToken = signShortToken({ adminId: admin.id }, "admin-gate", "5m");
      return res.json({ step: "admin-credentials", gateToken });
    }

    const user = await prisma.user.findFirst({ where: { phone: { endsWith: phone } } });
    if (user && !user.passwordHash) {
      const setupToken = signShortToken({ phone }, "otp-setup", "10m");
      return res.json({ step: "set-password", setupToken });
    }
    if (user && user.passwordHash) {
      // Edge case: password already set between identify() and here — just log them in.
      const token = signAccess({ id: user.id, role: "user" });
      return res.json({ step: "logged-in", accessToken: token, user: publicUser(user) });
    }

    const setupToken = signShortToken({ phone }, "otp-register", "10m");
    res.json({ step: "register", setupToken });
  } catch (err) {
    console.error("verify-identify-otp error:", err);
    fail(res, 500, "Something went wrong. Please try again.");
  }
});

// ── STEP 3a: Brand-new user completes registration ────────────────────
router.post("/complete-registration", async (req, res) => {
  try {
    const { setupToken, name, email, password, confirmPassword, notified } = req.body;
    if (!setupToken) return fail(res, 400, "Session expired. Please start again.");

    let payload;
    try {
      payload = verifyShortToken(setupToken, "otp-register");
    } catch {
      return fail(res, 400, "Session expired. Please verify your number again.");
    }

    if (!name || !name.trim()) return fail(res, 400, "Full name is required");
    const pwError = validatePasswordPair(password, confirmPassword);
    if (pwError) return fail(res, 400, pwError);

    const phone = payload.phone;
    const existing = await prisma.user.findFirst({ where: { phone: { endsWith: phone } } });
    if (existing) return fail(res, 409, "An account with this number already exists. Please log in instead.");

    const cleanEmail = email && email.trim() ? email.toLowerCase().trim() : null;
    if (cleanEmail) {
      const emailExists = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (emailExists) return fail(res, 400, "Email is already in use by another account.");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        phone,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        notified: notified === true || notified === "true",
        isVerified: true,
        lastLoginAt: new Date(),
      },
    });

    const token = signAccess({ id: user.id, role: "user" });
    res.json({ accessToken: token, user: publicUser(user) });
  } catch (err) {
    console.error("complete-registration error:", err);
    fail(res, 500, "Registration failed. Please try again.");
  }
});

// ── STEP 3b: Legacy (OTP-only) user sets their first password ─────────
router.post("/complete-password-setup", async (req, res) => {
  try {
    const { setupToken, password, confirmPassword } = req.body;
    if (!setupToken) return fail(res, 400, "Session expired. Please start again.");

    let payload;
    try {
      payload = verifyShortToken(setupToken, "otp-setup");
    } catch {
      return fail(res, 400, "Session expired. Please verify your number again.");
    }

    const pwError = validatePasswordPair(password, confirmPassword);
    if (pwError) return fail(res, 400, pwError);

    const user = await prisma.user.findFirst({ where: { phone: { endsWith: payload.phone } } });
    if (!user) return fail(res, 404, "Account not found");

    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const token = signAccess({ id: updated.id, role: "user" });
    res.json({ accessToken: token, user: publicUser(updated) });
  } catch (err) {
    console.error("complete-password-setup error:", err);
    fail(res, 500, "Something went wrong. Please try again.");
  }
});

// ── Forgot password (OTP-based) ────────────────────────────────────────
router.post("/forgot-password-request", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    if (phone.length !== 10) return fail(res, 400, "Please enter a valid 10-digit mobile number");

    if (await throttleOtp(phone)) {
      return fail(res, 429, "Too many requests for this number. Try again in an hour.");
    }

    const user = await prisma.user.findFirst({ where: { phone: { endsWith: phone } } });
    // Always respond identically whether or not the number is registered,
    // to avoid leaking account existence — only actually send an OTP if found.
    if (user && user.isActive) {
      await createAndSendOtp(phone, "password reset code");
    }
    res.json({ message: "If this number is registered, an OTP has been sent." });
  } catch (err) {
    console.error("forgot-password-request error:", err);
    fail(res, 500, "Something went wrong. Please try again.");
  }
});

router.post("/forgot-password-verify", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    const { otp, password, confirmPassword } = req.body;
    if (phone.length !== 10 || !otp) return fail(res, 400, "Phone number and OTP code are required");

    const pwError = validatePasswordPair(password, confirmPassword);
    if (pwError) return fail(res, 400, pwError);

    const result = await consumeOtp(phone, otp);
    if (!result.ok) return fail(res, result.status, result.error);

    const user = await prisma.user.findFirst({ where: { phone: { endsWith: phone } } });
    if (!user) return fail(res, 400, "Invalid request");

    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const token = signAccess({ id: updated.id, role: "user" });
    res.json({ accessToken: token, user: publicUser(updated) });
  } catch (err) {
    console.error("forgot-password-verify error:", err);
    fail(res, 500, "Something went wrong. Please try again.");
  }
});

// ── Session ─────────────────────────────────────────────────────────
router.get("/me", authUser, (req, res) => {
  res.json(publicUser(req.user));
});

router.post("/logout", (req, res) => res.json({ message: "Logged out" }));

module.exports = router;
