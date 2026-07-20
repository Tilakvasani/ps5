const router = require("express").Router();
const prisma = require("../utils/prisma");

// POST /api/cart/apply-coupon
router.post("/apply-coupon", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required" });

  try {
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true }
    });

    if (!coupon) {
      return res.status(400).json({ error: "Invalid or inactive coupon code" });
    }

    // Return coupon details in the format expected by the frontend
    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountPercent: coupon.discountType === "percent" ? Number(coupon.discountValue) : 0,
      discountAmount: coupon.discountType === "flat" ? Number(coupon.discountValue) : 0,
      minOrderValue: Number(coupon.minOrderValue),
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

module.exports = router;
