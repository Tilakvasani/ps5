/**
 * Account routes – Login & Address Vault edition
 *
 * Removed: PUT /change-password  (no more passwords – Shiprocket OTP handles auth)
 *
 * Address endpoints are kept:
 *   - Shiprocket vault addresses are shown at checkout/login from SR API (in srAddresses)
 *   - These local DB addresses serve as a manual-entry fallback and persist for order records
 *   - Any address selected at checkout is saved here so orders always have a DB address record
 */

const router = require("express").Router();
const prisma  = require("../utils/prisma");
const { authUser } = require("../middleware/auth");

// ── GET saved addresses ───────────────────────────────────────────────────────
router.get("/addresses", authUser, async (req, res) => {
  try {
    const addresses = await prisma.userAddress.findMany({
      where  : { userId: req.user.id, NOT: { label: "deleted" } },
      orderBy: { isDefault: "desc" },
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: "Failed to load addresses" });
  }
});

// ── POST: save a new address (used at checkout or manually) ──────────────────
router.post("/addresses", authUser, async (req, res) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, pincode, gstin, label, customLabel, buildingType } = req.body;
    if (!fullName || !phone || !addressLine1 || !city || !pincode)
      return res.status(400).json({ error: "Required fields missing" });

    const address = await prisma.userAddress.create({
      data: {
        userId       : req.user.id,
        fullName,
        phone,
        addressLine1,
        addressLine2 : addressLine2 || null,
        city,
        state        : state || "Gujarat",
        pincode,
        gstin        : gstin        || null,
        label        : label        || "home",
        customLabel  : customLabel  || null,
        buildingType : buildingType || null,
      },
    });
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: "Failed to save address" });
  }
});

// ── PUT: update an existing address ──────────────────────────────────────────
router.put("/addresses/:id", authUser, async (req, res) => {
  try {
    const id       = Number(req.params.id);
    const existing = await prisma.userAddress.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: "Address not found" });

    const address = await prisma.userAddress.update({ where: { id }, data: req.body });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: "Failed to update address" });
  }
});

// ── DELETE: soft-delete if address has orders, hard-delete otherwise ──────────
router.delete("/addresses/:id", authUser, async (req, res) => {
  try {
    const id       = Number(req.params.id);
    const existing = await prisma.userAddress.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: "Address not found" });

    const linked = await prisma.order.count({ where: { addressId: id } });
    if (linked > 0) {
      await prisma.userAddress.update({ where: { id }, data: { label: "deleted", isDefault: false } });
    } else {
      await prisma.userAddress.delete({ where: { id } });
    }
    res.json({ message: "Address deleted" });
  } catch (err) {
    if (err.code === "P2003") {
      await prisma.userAddress
        .update({ where: { id: Number(req.params.id) }, data: { label: "deleted", isDefault: false } })
        .catch(() => {});
      return res.json({ message: "Address deleted" });
    }
    res.status(500).json({ error: "Failed to delete address" });
  }
});

// ── PUT: update profile (name / email only — phone is set by Shiprocket) ─────
router.put("/profile", authUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updated = await prisma.user.update({
      where : { id: req.user.id },
      data  : {
        ...(name  ? { name  } : {}),
        ...(email ? { email } : {}),
      },
      select: { id: true, name: true, email: true, phone: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;
