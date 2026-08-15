/**
 * Auth routes – Shiprocket Login & Address Vault edition
 *
 * User flow  → phone → Shiprocket OTP → verify → JWT issued by us
 * Admin flow → same login page but detects admin phone → WhatsApp OTP
 *              → admin email+password second factor (unchanged from before)
 *
 * Removed (replaced by Shiprocket):
 *   POST /identify          – old OTP/password branch gate
 *   POST /login             – password-based login
 *   POST /verify-identify-otp
 *   POST /complete-registration
 *   POST /complete-password-setup
 *   POST /forgot-password-request
 *   POST /forgot-password-verify
 *
 * Added:
 *   POST /sr-send-otp       – proxy: send OTP via Shiprocket
 *   POST /sr-verify-otp     – proxy: verify OTP, sync user, issue JWT
 */

const router  = require("express").Router();
const jwt     = require("jsonwebtoken");
const prisma  = require("../utils/prisma");
const { signAccess }                      = require("../utils/jwt");
const { authUser }                        = require("../middleware/auth");
const { sendWhatsAppOtp }                 = require("../utils/whatsapp");
const { sendOtp, verifyOtp }              = require("../utils/shiprocket");
const { cleanPhone }                      = require("../utils/phone");

const JWT_SECRET = process.env.JWT_SECRET;

function fail(res, status, message) {
  return res.status(status).json({ error: message });
}

function publicUser(user) {
  return {
    id    : user.id,
    name  : user.name,
    email : user.email || "",
    phone : user.phone || "",
  };
}

function isEmailLike(v) {
  return typeof v === "string" && v.includes("@");
}

function signShortToken(payload, scope, expiresIn) {
  return jwt.sign({ ...payload, scope }, JWT_SECRET, { expiresIn });
}

function verifyShortToken(token, expectedScope) {
  const payload = jwt.verify(token, JWT_SECRET);
  if (payload.scope !== expectedScope) throw new Error("Invalid token scope");
  return payload;
}


// ── OTP helpers (still used for admin flow) ──────────────────────────────────
async function createAndSendAdminOtp(phone) {
  const code      = Math.floor(100_000 + Math.random() * 900_000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpCode.deleteMany({ where: { phone } });
  await prisma.otpCode.create({ data: { phone, codeHash: code, expiresAt } });
  console.log(`🔑 [Admin OTP] +91 ${phone} — Code: ${code}`);
  await sendWhatsAppOtp(phone, code);
}

async function consumeOtp(phone, otpCode) {
  if (!otpCode) return { ok: false, status: 400, error: "OTP code is required." };

  const record = await prisma.otpCode.findFirst({
    where    : { phone },
    orderBy  : { createdAt: "desc" },
  });

  if (!record || record.codeHash !== String(otpCode).trim())
    return { ok: false, status: 400, error: "Invalid OTP verification code." };

  if (record.expiresAt < new Date()) {
    await prisma.otpCode.deleteMany({ where: { phone } }).catch(() => {});
    return { ok: false, status: 400, error: "OTP verification code has expired." };
  }

  await prisma.otpCode.deleteMany({ where: { phone } }).catch(() => {});
  return { ok: true };
}


// ── ① Shiprocket: Send OTP to buyer phone ────────────────────────────────────
// POST /api/auth/sr-send-otp
// Body: { phone: "9876543210" }
//
// For admin phone numbers we fall back to our own WhatsApp OTP so the admin
// flow continues to work without a Shiprocket account.
router.post("/sr-send-otp", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    if (phone.length !== 10)
      return fail(res, 400, "Please enter a valid 10-digit mobile number");

    // Admin gate: use our own OTP so admin flow is unchanged
    const admin = await prisma.admin.findFirst({
      where: { number: { contains: phone } },
    });
    if (admin && admin.isActive) {
      await createAndSendAdminOtp(phone);
      return res.json({ step: "admin-otp", message: "OTP sent" });
    }

    // Regular buyer: delegate to Shiprocket
    await sendOtp(phone);
    res.json({ step: "otp", message: "OTP sent via Shiprocket" });
  } catch (err) {
    console.error("sr-send-otp error:", err.message);
    fail(res, 500, err.message || "Failed to send OTP. Please try again.");
  }
});


// ── ② Shiprocket: Verify OTP, sync user, issue JWT ───────────────────────────
// POST /api/auth/sr-verify-otp
// Body: { phone: "9876543210", otp: "123456" }
// Response: { accessToken, user, srAddresses }
router.post("/sr-verify-otp", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    const otp   = String(req.body.otp || "").trim();

    if (phone.length !== 10 || !otp)
      return fail(res, 400, "Phone number and OTP are required");

    // ─ Admin path: verify with our own OTP store ─────────────────────────────
    const admin = await prisma.admin.findFirst({
      where: { number: { contains: phone } },
    });
    if (admin && admin.isActive) {
      const result = await consumeOtp(phone, otp);
      if (!result.ok) return fail(res, result.status, result.error);

      // Issue a short-lived gate token; admin must still enter email+password
      const gateToken = signShortToken({ adminId: admin.id }, "admin-gate", "5m");
      return res.json({ step: "admin-credentials", gateToken });
    }

    // ─ Customer path: verify via Shiprocket ──────────────────────────────────
    let srBuyer;
    try {
      srBuyer = await verifyOtp(phone, otp);
    } catch (err) {
      return fail(res, 400, err.message || "Invalid or expired OTP");
    }

    // Sync buyer into our User table (upsert by phone)
    let user = await prisma.user.findFirst({
      where: { phone: { endsWith: phone } },
    });

    if (!user) {
      // New buyer – create a minimal user record
      user = await prisma.user.create({
        data: {
          phone      : phone,
          name       : srBuyer.name?.trim()  || "Zupwell Customer",
          email      : srBuyer.email?.trim() || null,
          isVerified : true,
          isActive   : true,
          lastLoginAt: new Date(),
        },
      });
    } else {
      // Existing buyer – update name/email if Shiprocket returned richer data
      const updates = { lastLoginAt: new Date() };
      if (srBuyer.name?.trim()  && (!user.name  || user.name  === "Zupwell Customer" || user.name === "User"))
        updates.name  = srBuyer.name.trim();
      if (srBuyer.email?.trim() && !user.email)
        updates.email = srBuyer.email.trim();

      user = await prisma.user.update({
        where: { id: user.id },
        data : updates,
      });
    }

    const token = signAccess({ id: user.id, role: "user" });
    res.json({
      step         : "logged-in",
      accessToken  : token,
      user         : publicUser(user),
      srAddresses  : srBuyer.addresses || [],   // Shiprocket vault addresses
    });
  } catch (err) {
    console.error("sr-verify-otp error:", err);
    fail(res, 500, "Something went wrong. Please try again.");
  }
});


// ── Admin second-factor: email + password ────────────────────────────────────
// (unchanged — still wired to /api/admin/auth/login in routes/admin.js)
// This route just exists so the frontend can reach the admin login path.


// ── Razorpay phone sync (kept for compatibility) ─────────────────────────────
router.post("/razorpay-sync", async (req, res) => {
  try {
    const { phone: rawPhone, email: rawEmail, name: rawName } = req.body;
    const phone = cleanPhone(rawPhone);
    if (!phone || phone.length !== 10)
      return res.status(400).json({ error: "Valid 10-digit phone number required" });

    // Check if admin
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { number: { contains: phone } },
          rawEmail
            ? { email: { equals: rawEmail.toLowerCase().trim(), mode: "insensitive" } }
            : undefined,
        ].filter(Boolean),
      },
    });

    if (admin && admin.isActive) {
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role || "super_admin", tokenVersion: admin.tokenVersion || 0 },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({
        token,
        role: "ADMIN",
        user: { id: admin.id, name: admin.name, email: admin.email, phone: admin.number || phone, isAdmin: true },
      });
    }

    const cleanEmail = rawEmail && isEmailLike(rawEmail) ? rawEmail.toLowerCase().trim() : null;
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: { endsWith: phone } },
          cleanEmail ? { email: cleanEmail } : undefined,
        ].filter(Boolean),
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone, name: rawName?.trim() || "Zupwell Customer", email: cleanEmail, isVerified: true, isActive: true },
      });
    } else {
      const up = {};
      if (!user.email && cleanEmail) up.email = cleanEmail;
      if ((!user.name || user.name === "User" || user.name === "Zupwell Customer") && rawName?.trim())
        up.name = rawName.trim();
      if (Object.keys(up).length > 0)
        user = await prisma.user.update({ where: { id: user.id }, data: up });
    }

    const token = signAccess({ id: user.id, role: "user" });
    return res.json({ token, accessToken: token, role: "USER", user: publicUser(user) });
  } catch (err) {
    console.error("Razorpay sync error:", err);
    res.status(500).json({ error: "Failed to authenticate via Razorpay" });
  }
});


// ── Session / logout ─────────────────────────────────────────────────────────
router.get("/me", authUser, (req, res) => res.json(publicUser(req.user)));

router.post("/logout", (req, res) => res.json({ message: "Logged out" }));


module.exports = router;
