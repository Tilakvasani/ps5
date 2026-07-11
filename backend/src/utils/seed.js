require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Zupwell database...");

  // ── Admin ────────────────────────────────────────
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.admin.upsert({
    where:  { email: "admin@zupwell.in" },
    update: {},
    create: { name: "Super Admin", email: "admin@zupwell.in", number: "9999999999", passwordHash: adminHash, role: "super_admin" },
  });
  console.log("✅ Admin:", admin.email);

  // ── Settings ─────────────────────────────────────
  const defaultSettings = [
    { key: "site_name",                value: "Zupwell",                           group: "general"  },
    { key: "site_email",               value: "support@zupwell.com",               group: "general"  },
    { key: "site_phone",               value: "+91 9999999999",                    group: "general"  },
    { key: "site_address",             value: "A-102, Adarsh Lifestyle, Ahmedabad, Gujarat 382350", group: "general" },
    { key: "gstin",                    value: "24XXXXXXXXXXXXX",                   group: "tax"      },
    { key: "state_code",               value: "24",                                group: "tax"      },
    { key: "state_name",               value: "Gujarat",                           group: "tax"      },
    { key: "free_shipping_threshold",  value: "500",                               group: "shipping" },
    { key: "default_shipping_charge",  value: "50",                                group: "shipping" },
    { key: "order_prefix",             value: "ZW",                                group: "orders"   },
  ];
  for (const s of defaultSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log("✅ Settings seeded");

  // ── GST Rates ─────────────────────────────────────
  const gstRates = [
    { hsnCode: "2106", description: "Food Supplements / Effervescent Tablets", cgstRate: 9, sgstRate: 9, igstRate: 18 },
    { hsnCode: "3004", description: "Medicaments / Vitamins",                  cgstRate: 6, sgstRate: 6, igstRate: 12 },
    { hsnCode: "2202", description: "Hydration & Energy Drinks",                cgstRate: 9, sgstRate: 9, igstRate: 18 },
  ];
  for (const r of gstRates) {
    await prisma.gstRate.upsert({ where: { hsnCode: r.hsnCode }, update: {}, create: { ...r, cgstRate: r.cgstRate, sgstRate: r.sgstRate, igstRate: r.igstRate } });
  }
  console.log("✅ GST rates seeded");

  // ── Categories ────────────────────────────────────
  // Deactivate all old categories
  await prisma.category.updateMany({ data: { isActive: false } });

  const catData = [
    { name: "Effervescent", slug: "effervescent", sortOrder: 1, isActive: true },
  ];
  const categories = {};
  for (const c of catData) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: { isActive: true }, create: c });
    categories[c.slug] = cat;
  }
  console.log("✅ Categories seeded");

  // ── Sample Products ───────────────────────────────
  // Deactivate ALL existing products first
  await prisma.product.updateMany({ data: { isActive: false } });

  const products = [
    { name: "Zupwell Electrolyte Effervescent Tablet - Orange Flavour (15 Tablets)", sku: "ZW-ELEC-ORG-15", hsnCode: "2106", categorySlug: "effervescent", basePrice: 199, sellingPrice: 149, discountPercent: 25, unit: "TUBE", brand: "Zupwell", description: "Zupwell Electrolyte Effervescent Tablet in refreshing Orange Flavour. Fast dissolving formula supports hydration, stamina, electrolyte balance, and nerve function. Helps reduce fatigue. 15 tablets per tube. Health Supplement — suitable for active lifestyles." },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const cat  = categories[p.categorySlug];
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    let product;
    if (existing) {
      product = await prisma.product.update({
        where: { sku: p.sku },
        data: {
          name: p.name, slug, hsnCode: p.hsnCode,
          categoryId:      cat?.id || null,
          basePrice:       p.basePrice,
          sellingPrice:    p.sellingPrice,
          discountPercent: p.discountPercent,
          unit:            p.unit,
          brand:           p.brand,
          description:     p.description,
          shortDescription: p.description.slice(0, 80),
          isActive:   true,
          isFeatured: true,
        },
      });
    } else {
      product = await prisma.product.create({
        data: {
          name: p.name, slug, sku: p.sku, hsnCode: p.hsnCode,
          categoryId:      cat?.id || null,
          basePrice:       p.basePrice,
          sellingPrice:    p.sellingPrice,
          discountPercent: p.discountPercent,
          unit:            p.unit,
          brand:           p.brand,
          description:     p.description,
          shortDescription: p.description.slice(0, 80),
          isActive:   true,
          isFeatured: true,
        },
      });
      await prisma.inventory.create({ data: { productId: product.id, qtyInStock: 500, lowStockThreshold: 20 } });
      await prisma.productImage.create({ data: { productId: product.id, imageUrl: "/products/zupwell-electrolyte-orange.jpg", altText: "Zupwell Electrolyte Effervescent Tablet Orange Flavour", isPrimary: true, sortOrder: 0 } });
    }
  }
  console.log("✅ Products seeded");

  // ── Sample Coupons ────────────────────────────────
  await prisma.coupon.upsert({
    where:  { code: "ZUPWELL10" },
    update: {},
    create: { code: "ZUPWELL10", description: "10% off on all orders", discountType: "percent", discountValue: 10, minOrderValue: 100, maxDiscount: 500, isActive: true },
  });
  await prisma.coupon.upsert({
    where:  { code: "FLAT50" },
    update: {},
    create: { code: "FLAT50", description: "₹50 flat off above ₹500", discountType: "flat", discountValue: 50, minOrderValue: 500, isActive: true },
  });
  console.log("✅ Coupons seeded");

  // ── Sample Reviews ────────────────────────────────
  console.log("🌱 Seeding sample reviews...");
  const sampleReviews = [
    { name: "Rohan Mehta", email: "rohan@gmail.com", rating: 5, title: "Great energy boost", body: "Dissolves fast and tastes great. I feel more hydrated after workouts." },
    { name: "Priya Sharma", email: "priya@gmail.com", rating: 5, title: "Perfect for summer", body: "Keeps me going through Ahmedabad heat. No sugar crash, just steady energy." },
    { name: "Arjun Patel", email: "arjun@gmail.com", rating: 4, title: "Good taste, works well", body: "Orange flavour is refreshing and not too sweet. Repeat customer now." },
    { name: "Sneha Iyer", email: "sneha@gmail.com", rating: 5, title: "Helped with fatigue", body: "Used it during a work trip and it really helped with tiredness and cramps." },
    { name: "Vikram Nair", email: "vikram@gmail.com", rating: 4, title: "Solid daily supplement", body: "Easy to carry the tube around. Fizzes up nicely in cold water." },
    { name: "Ananya Reddy", email: "ananya@gmail.com", rating: 5, title: "My gym essential now", body: "Take it post workout every day. Noticeably less soreness the next day." }
  ];

  const dbProduct = await prisma.product.findFirst({ where: { sku: "ZW-ELEC-ORG-15" } });
  if (dbProduct) {
    const userPass = await bcrypt.hash("User@123", 10);
    for (const r of sampleReviews) {
      const user = await prisma.user.upsert({
        where: { email: r.email },
        update: {},
        create: { name: r.name, email: r.email, passwordHash: userPass, isActive: true, isVerified: true }
      });
      await prisma.review.upsert({
        where: { productId_userId: { productId: dbProduct.id, userId: user.id } },
        update: { rating: r.rating, title: r.title, body: r.body, isApproved: true },
        create: { productId: dbProduct.id, userId: user.id, rating: r.rating, title: r.title, body: r.body, isApproved: true }
      });
    }
    console.log("✅ Sample reviews seeded");
  }

  console.log("\n🎉 Seed complete!");
  console.log("   Admin email:    admin@zupwell.in");
  console.log("   Admin password: Admin@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
