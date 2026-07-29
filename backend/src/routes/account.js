const router = require("express").Router();
const prisma = require("../utils/prisma");
const { authUser } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// GET /api/account/addresses
router.get("/addresses", authUser, async (req, res) => {
  const addresses = await prisma.userAddress.findMany({
    where: { userId: req.user.id, NOT: { label: "deleted" } },
    orderBy: { isDefault: "desc" },
  });
  res.json(addresses);
});

// POST /api/account/addresses
router.post("/addresses", authUser, async (req, res) => {
  const { fullName, phone, addressLine1, addressLine2, city, state, pincode, gstin, label, customLabel, buildingType } = req.body;
  if (!fullName || !phone || !addressLine1 || !city || !pincode) {
    return res.status(400).json({ error: "Required fields missing" });
  }
  const address = await prisma.userAddress.create({
    data: { userId: req.user.id, fullName, phone, addressLine1, addressLine2, city, state: state || "Gujarat", pincode, gstin, label: label || "home", customLabel: customLabel || null, buildingType: buildingType || null },
  });
  res.status(201).json(address);
});

// PUT /api/account/addresses/:id
router.put("/addresses/:id", authUser, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.userAddress.findFirst({ where: { id, userId: req.user.id } });
  if (!existing) return res.status(404).json({ error: "Address not found" });
  const address = await prisma.userAddress.update({ where: { id }, data: req.body });
  res.json(address);
});

// DELETE /api/account/addresses/:id
router.delete("/addresses/:id", authUser, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.userAddress.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ error: "Address not found" });

    const linkedOrders = await prisma.order.count({ where: { addressId: id } });
    if (linkedOrders > 0) {
      await prisma.userAddress.update({
        where: { id },
        data: { label: "deleted", isDefault: false },
      });
      return res.json({ message: "Address deleted" });
    }

    await prisma.userAddress.delete({ where: { id } });
    res.json({ message: "Address deleted" });
  } catch (err) {
    if (err.code === "P2003") {
      await prisma.userAddress.update({
        where: { id: Number(req.params.id) },
        data: { label: "deleted", isDefault: false },
      }).catch(() => {});
      return res.json({ message: "Address deleted" });
    }
    res.status(500).json({ error: "Failed to delete address" });
  }
});

// PUT /api/account/profile
router.put("/profile", authUser, async (req, res) => {
  const { name, phone } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data:  { name, phone },
    select: { id: true, name: true, email: true, phone: true },
  });
  res.json(updated);
});

// PUT /api/account/change-password
router.put("/change-password", authUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both passwords required" });
  if (newPassword.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  if (!req.user.passwordHash) {
    return res.status(400).json({ error: "Password changes are not supported for phone-only OTP accounts." });
  }

  const valid = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
  res.json({ message: "Password updated" });
});

module.exports = router;