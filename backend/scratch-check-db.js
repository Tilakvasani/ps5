const prisma = require("./src/utils/prisma");

async function check() {
  try {
    const coupons = await prisma.coupon.findMany();
    console.log("Coupons in DB:", coupons);
    const settings = await prisma.setting.findMany();
    console.log("Settings in DB:", settings);
    const products = await prisma.product.findMany({ include: { variants: true } });
    console.log("Products in DB:", products);
  } catch (err) {
    console.error("DB check failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
