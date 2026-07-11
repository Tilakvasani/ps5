const router = require("express").Router();
const prisma = require("../utils/prisma");
const { signAccess } = require("../utils/jwt");
const { authUser } = require("../middleware/auth");

// In-memory store for OTPs
const otpStore = new Map();

const signUserOrAdminToken = async (user) => {
  if (user.email) {
    const admin = await prisma.admin.findFirst({ where: { email: { equals: user.email.toLowerCase().trim(), mode: "insensitive" } } });
    if (admin && admin.isActive) {
      return {
        token: signAccess({ id: admin.id, role: admin.role }),
        isAdmin: true,
        adminName: admin.name
      };
    }
  }
  return {
    token: signAccess({ id: user.id, role: "user" }),
    isAdmin: false,
    adminName: null
  };
};

// POST: /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Sanitize and validate 10-digit mobile number
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: "Invalid mobile number. Please enter a 10-digit number." });
    }

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

    // Store in-memory
    otpStore.set(cleanPhone, { otp, expiresAt });

    // Print to server console for simulation/QA
    console.log(`\n🔑 [OTP Verification Code] For mobile: +91 ${cleanPhone} => Code is: ${otp}\n`);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST: /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp, notified } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone number and OTP code are required" });
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: "Invalid mobile number" });
    }

    // Verify OTP (allow wildcard "123456" for testing/QA)
    const stored = otpStore.get(cleanPhone);
    const isValidWildcard = otp === "123456";
    const isValidStored = stored && stored.otp === otp && Date.now() < stored.expiresAt;

    if (!isValidWildcard && !isValidStored) {
      return res.status(400).json({ error: "Invalid or expired OTP code" });
    }

    // Clear OTP from memory after successful verification
    otpStore.delete(cleanPhone);

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        phone: {
          endsWith: cleanPhone
        }
      }
    });

    const isNotified = notified === true || notified === "true";

    if (!user) {
      // Automatic signup
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: `User ${cleanPhone.slice(-4)}`,
          notified: isNotified,
          isVerified: true
        }
      });
      console.log(`🆕 [User Signup] Auto-created user for phone +91 ${cleanPhone}. Notified: ${isNotified}`);
    } else {
      // Update notified status
      user = await prisma.user.update({
        where: { id: user.id },
        data: { notified: isNotified }
      });
      console.log(`👤 [User Login] Logged in user for phone +91 ${cleanPhone}. Notified updated: ${isNotified}`);
    }

    const { token, isAdmin, adminName } = await signUserOrAdminToken(user);

    res.json({
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email || "",
        phone: user.phone || ""
      },
      isAdmin,
      adminName
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// GET: /api/auth/me
router.get("/me", authUser, (req, res) => {
  const { id, name, email, phone } = req.user;
  res.json({ id, name, email: email || "", phone: phone || "" });
});

// POST: /api/auth/logout
router.post("/logout", (req, res) => res.json({ message: "Logged out" }));

module.exports = router;