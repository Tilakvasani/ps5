/**
 * Auth routes – Shiprocket Login Iframe (HeadlessCheckout) edition
 *
 * Exact API from Shiprocket docs:
 *
 *  Step 1 – Frontend asks us for a popup token
 *    GET  /api/auth/sr-get-token
 *    → We call Shiprocket POST /api/v1/access-token/login (HMAC-signed)
 *    → Return { token } to frontend
 *
 *  Step 2 – User completes login inside the Shiprocket popup
 *    Popup callback gives frontend: authorised_customer_token + phone + addresses
 *
 *  Step 3 – Frontend sends us the authorised token
 *    POST /api/auth/sr-buyer-login  { authorisedToken, phone, addresses }
 *    → We call Shiprocket POST /api/v1/customer-data/ to verify
 *    → Sync user to our DB → return our JWT
 */

const router = require("express").Router();
const jwt    = require("jsonwebtoken");
const axios  = require("axios");
const crypto = require("crypto");
const prisma = require("../utils/prisma");
const { signAccess }      = require("../utils/jwt");
const { authUser }        = require("../middleware/auth");
const { sendWhatsAppOtp } = require("../utils/whatsapp");
const { cleanPhone }      = require("../utils/phone");

const JWT_SECRET = process.env.JWT_SECRET;

// ── Shiprocket config (from Render env vars) ──────────────────────────────────
const SR_API_KEY    = process.env.SR_API_KEY;     // Yojsc5YuyI5LqqTg
const SR_SECRET_KEY = process.env.SR_SECRET_KEY;  // VKpVgF9JbciyZjo6n2fyMo4We3KnJ7rN
const SR_API_BASE   = process.env.SR_API_BASE_URL || "https://checkout-api.shiprocket.com";


// ── HMAC-SHA256 helper (required by Shiprocket access-token API) ──────────────
function makeHmac(body) {
  return crypto
    .createHmac("sha256", SR_SECRET_KEY)
    .update(JSON.stringify(body))
    .digest("base64");
}


// ── Step 1: GET /api/auth/sr-get-token ───────────────────────────────────────
// Frontend calls this right when user clicks Login.
// We hit Shiprocket's access-token/login and return the token to the frontend.
// The frontend then passes it to HeadlessCheckout.buyNow().
router.get("/sr-get-token", async (req, res) => {
  try {
    if (!SR_API_KEY || !SR_SECRET_KEY) {
      return res.status(500).json({ error: "Shiprocket API credentials not configured" });
    }

    const body = {
      address  : true,
      timestamp: new Date().toISOString(),
    };

    const { data } = await axios.post(
      `${SR_API_BASE}/api/v1/access-token/login`,
      body,
      {
        headers: {
          "Content-Type"      : "application/json",
          "X-Api-Key"         : SR_API_KEY,
          "X-Api-HMAC-SHA256" : makeHmac(body),
        },
      }
    );

    if (!data?.ok || !data?.result?.token) {
      console.error("Shiprocket token error:", data);
      return res.status(502).json({ error: "Could not get Shiprocket token" });
    }

    res.json({ token: data.result.token });
  } catch (err) {
    console.error("sr-get-token error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to initialise login. Please try again." });
  }
});


// ── Step 3: POST /api/auth/sr-buyer-login ─────────────────────────────────────
// Called after the popup closes successfully.
// Body: { authorisedToken, phone, addresses }
//   authorisedToken = response.result.authorised_customer_token from popup
//   phone           = response.data.phone from popup
//   addresses       = response.data.addresses from popup (already have them!)
router.post("/sr-buyer-login", async (req, res) => {
  try {
    const { authorisedToken, phone: rawPhone, addresses: popupAddresses } = req.body;

    if (!authorisedToken) {
      return res.status(400).json({ error: "authorisedToken is required" });
    }

    // Call Shiprocket to verify the authorised token and get customer data
    let srPhone = cleanPhone(rawPhone || "");
    let srName  = "";
    let srEmail = "";
    let srAddressesRaw = popupAddresses || [];

    try {
      const { data } = await axios.post(
        `${SR_API_BASE}/api/v1/customer-data/`,
        { token: authorisedToken },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data?.ok && data?.result) {
        const r = data.result;
        srPhone = cleanPhone(r.phone || rawPhone || "");
        srName  = [r.address?.firstName, r.address?.lastName].filter(Boolean).join(" ").trim();
        srEmail = r.address?.email || "";
        // Use address from customer-data response as it's verified
        if (r.address) srAddressesRaw = [r.address];
      }
    } catch (err) {
      console.warn("Shiprocket customer-data fetch failed, using popup data:", err.message);
      // Fall through — we already have phone + addresses from popup callback
    }

    if (!srPhone || srPhone.length !== 10) {
      return res.status(400).json({ error: "Could not determine buyer phone number" });
    }

    // Normalise addresses (Shiprocket uses line1/line2/firstName/lastName)
    const srAddresses = srAddressesRaw.map((a, i) => ({
      id          : `sr_${a.address_id || i}`,
      source      : "shiprocket",
      fullName    : [a.first_name || a.firstName, a.last_name || a.lastName].filter(Boolean).join(" ").trim() || srName,
      phone       : cleanPhone(a.phone || srPhone),
      addressLine1: a.line1    || "",
      addressLine2: a.line2    || a.landmark || "",
      city        : a.city     || "",
      state       : a.state    || "",
      pincode     : a.pincode  || "",
      label       : "home",
      isDefault   : i === 0,
    }));

    // Sync user into our DB (upsert by phone)
    let user = await prisma.user.findFirst({ where: { phone: { endsWith: srPhone } } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone      : srPhone,
          name       : srName || "Zupwell Customer",
          email      : srEmail || null,
          isVerified : true,
          isActive   : true,
          lastLoginAt: new Date(),
        },
      });
    } else {
      const updates = { lastLoginAt: new Date() };
      if (srName  && (!user.name  || user.name  === "Zupwell Customer")) updates.name  = srName;
      if (srEmail && !user.email)                                         updates.email = srEmail;
      user = await prisma.user.update({ where: { id: user.id }, data: updates });
    }

    const accessToken = signAccess({ id: user.id, role: "user" });

    res.json({
      accessToken,
      user       : { id: user.id, name: user.name, email: user.email || "", phone: user.phone || "" },
      srAddresses,
    });
  } catch (err) {
    console.error("sr-buyer-login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});


// ── Admin OTP (kept — admin login uses our own WhatsApp OTP) ──────────────────
function signShortToken(payload, scope, expiresIn) {
  return jwt.sign({ ...payload, scope }, JWT_SECRET, { expiresIn });
}

async function createAndSendAdminOtp(phone) {
  const code      = Math.floor(100_000 + Math.random() * 900_000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otpCode.deleteMany({ where: { phone } });
  await prisma.otpCode.create({ data: { phone, codeHash: code, expiresAt } });
  await sendWhatsAppOtp(phone, code);
}

async function consumeOtp(phone, otpCode) {
  if (!otpCode) return { ok: false, status: 400, error: "OTP is required." };
  const record = await prisma.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } });
  if (!record || record.codeHash !== String(otpCode).trim())
    return { ok: false, status: 400, error: "Invalid OTP." };
  if (record.expiresAt < new Date()) {
    await prisma.otpCode.deleteMany({ where: { phone } }).catch(() => {});
    return { ok: false, status: 400, error: "OTP has expired." };
  }
  await prisma.otpCode.deleteMany({ where: { phone } }).catch(() => {});
  return { ok: true };
}

router.post("/admin-send-otp", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    if (phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
    const admin = await prisma.admin.findFirst({ where: { number: { contains: phone } } });
    if (!admin || !admin.isActive) return res.status(404).json({ error: "Admin not found" });
    await createAndSendAdminOtp(phone);
    res.json({ message: "OTP sent" });
  } catch (err) { res.status(500).json({ error: "Failed to send OTP" }); }
});

router.post("/admin-verify-otp", async (req, res) => {
  try {
    const phone = cleanPhone(req.body.phone);
    const otp   = String(req.body.otp || "").trim();
    const admin = await prisma.admin.findFirst({ where: { number: { contains: phone } } });
    if (!admin || !admin.isActive) return res.status(404).json({ error: "Admin not found" });
    const result = await consumeOtp(phone, otp);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ gateToken: signShortToken({ adminId: admin.id }, "admin-gate", "5m") });
  } catch (err) { res.status(500).json({ error: "Verification failed" }); }
});


// ── Razorpay sync (kept for payment compatibility) ────────────────────────────
router.post("/razorpay-sync", async (req, res) => {
  try {
    const { phone: rawPhone, email: rawEmail, name: rawName } = req.body;
    const phone = cleanPhone(rawPhone);
    if (!phone || phone.length !== 10)
      return res.status(400).json({ error: "Valid 10-digit phone required" });

    const cleanEmail = rawEmail && rawEmail.includes("@") ? rawEmail.toLowerCase().trim() : null;
    let user = await prisma.user.findFirst({
      where: { OR: [{ phone: { endsWith: phone } }, cleanEmail ? { email: cleanEmail } : undefined].filter(Boolean) },
    });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, name: rawName?.trim() || "Zupwell Customer", email: cleanEmail, isVerified: true, isActive: true },
      });
    }
    const token = signAccess({ id: user.id, role: "user" });
    res.json({ token, accessToken: token, role: "USER", user: { id: user.id, name: user.name, email: user.email || "", phone: user.phone || "" } });
  } catch (err) {
    res.status(500).json({ error: "Failed to sync user" });
  }
});


// ── Session ───────────────────────────────────────────────────────────────────
router.get("/me",      authUser, (req, res) => res.json({ id: req.user.id, name: req.user.name, email: req.user.email || "", phone: req.user.phone || "" }));
router.post("/logout", (req, res) => res.json({ message: "Logged out" }));

module.exports = router;
