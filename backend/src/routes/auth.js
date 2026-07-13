const router = require("express").Router();
const prisma = require("../utils/prisma");
const { signAccess } = require("../utils/jwt");
const { authUser } = require("../middleware/auth");
const { sendSMS } = require("../utils/sms");


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

const bcrypt = require("bcryptjs");

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

    // Throttle: max 3 sends per phone per hour
    const recentCount = await prisma.otpCode.count({
      where: {
        phone: cleanPhone,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recentCount >= 3) {
      return res.status(429).json({ error: "Too many OTP requests for this number. Try again in an hour." });
    }

    // Check if user exists in database
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: {
          endsWith: cleanPhone
        }
      }
    });
    const exists = !!existingUser;

    // Generate a secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Store in DB
    await prisma.otpCode.create({
      data: { phone: cleanPhone, codeHash, expiresAt }
    });

    // Send SMS via Twilio (with console fallback inside sendSMS if credentials aren't set yet)
    const messageBody = `Your Zupwell verification code is ${otp}. Valid for 5 minutes.`;
    await sendSMS(cleanPhone, messageBody);

    // Print to server console for simulation/QA
    console.log(`\n🔑 [OTP Verification Code] For mobile: +91 ${cleanPhone} => Code is: ${otp}\n`);

    res.json({ message: "OTP sent successfully", exists });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST: /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp, notified, name, email } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone number and OTP code are required" });
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: "Invalid mobile number" });
    }

    // Fetch active OTP from database
    const record = await prisma.otpCode.findFirst({
      where: { phone: cleanPhone, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return res.status(400).json({ error: "OTP expired or not found. Request a new one." });
    }

    if (record.attempts >= 5) {
      return res.status(429).json({ error: "Too many incorrect attempts. Request a new OTP." });
    }

    const isValid = await bcrypt.compare(otp, record.codeHash);
    if (!isValid) {
      await prisma.otpCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ error: "Invalid OTP code" });
    }

    // Delete OTP record after successful validation
    await prisma.otpCode.delete({ where: { id: record.id } });

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
      // Validate that name is provided for new signups
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name is compulsory for registration." });
      }

      // Check if email already exists
      if (email && email.trim()) {
        const emailExists = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() }
        });
        if (emailExists) {
          return res.status(400).json({ error: "Email is already in use by another account." });
        }
      }

      // Sign up new user
      user = await prisma.user.create({
        data: {
          phone: cleanPhone,
          name: name.trim(),
          email: email ? email.toLowerCase().trim() : null,
          notified: isNotified,
          isVerified: true
        }
      });
      console.log(`🆕 [User Signup] Created user for phone +91 ${cleanPhone}. Name: ${name}, Email: ${email}, Notified: ${isNotified}`);
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

const crypto = require("crypto");
const { sendPasswordReset } = require("../utils/mailer");

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return res.json({ message: "If your email is registered, you will receive a reset link shortly." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { email: cleanEmail, tokenHash, isAdmin: false, expiresAt }
    });

    await sendPasswordReset(cleanEmail, token, false);

    res.json({ message: "If your email is registered, you will receive a reset link shortly." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await prisma.passwordResetToken.findFirst({
      where: { tokenHash, isAdmin: false, expiresAt: { gt: new Date() } }
    });

    if (!record) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const newPasswordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: record.email },
        data: { passwordHash: newPasswordHash }
      }),
      prisma.passwordResetToken.delete({ where: { id: record.id } })
    ]);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

module.exports = router;