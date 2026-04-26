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
    create: { name: "Super Admin", email: "admin@zupwell.in", passwordHash: adminHash, role: "super_admin" },
  });
  console.log("✅ Admin:", admin.email);

  // ── Settings ─────────────────────────────────────
  const defaultSettings = [
    { key: "site_name",                value: "Zupwell",                           group: "general"  },
    { key: "site_email",               value: "info@zupwell.in",                   group: "general"  },
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
    { hsnCode: "3919", description: "Adhesive Tapes (BOPP / Packaging)", cgstRate: 9, sgstRate: 9, igstRate: 18 },
    { hsnCode: "3920", description: "Other Plastic Plates / Films",        cgstRate: 9, sgstRate: 9, igstRate: 18 },
    { hsnCode: "3923", description: "Polythene Bags / Courier Bags",       cgstRate: 9, sgstRate: 9, igstRate: 18 },
    { hsnCode: "4819", description: "Cartons / Boxes (Paper/Paperboard)",  cgstRate: 6, sgstRate: 6, igstRate: 12 },
    { hsnCode: "3921", description: "Bubble Wrap / PE Foam",              cgstRate: 9, sgstRate: 9, igstRate: 18 },
    { hsnCode: "5806", description: "Stretch Film / Wrapping Film",        cgstRate: 6, sgstRate: 6, igstRate: 12 },
  ];
  for (const r of gstRates) {
    await prisma.gstRate.upsert({ where: { hsnCode: r.hsnCode }, update: {}, create: { ...r, cgstRate: r.cgstRate, sgstRate: r.sgstRate, igstRate: r.igstRate } });
  }
  console.log("✅ GST rates seeded");

  // ── Categories ────────────────────────────────────
  const catData = [
    { name: "BOPP Tape",           slug: "bopp-tape",          sortOrder: 1 },
    { name: "Stretch Film",        slug: "stretch-film",       sortOrder: 2 },
    { name: "Bubble Wrap",         slug: "bubble-wrap",        sortOrder: 3 },
    { name: "Courier Bags",        slug: "courier-bags",       sortOrder: 4 },
    { name: "Carton Box",          slug: "carton-box",         sortOrder: 5 },
    { name: "Foam Rolls",          slug: "foam-rolls",         sortOrder: 6 },
    { name: "Packaging Tape",      slug: "packaging-tape",     sortOrder: 7 },
    { name: "Industrial Supplies", slug: "industrial-supplies",sortOrder: 8 },
  ];
  const categories = {};
  for (const c of catData) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    categories[c.slug] = cat;
  }
  console.log("✅ Categories seeded");

  // ── Sample Products ───────────────────────────────
  const products = [
    { name: "BOPP Tape 2 Inch 65m Brown", sku: "BOPP-BRN-2IN-65M", hsnCode: "3919", categorySlug: "bopp-tape",    basePrice: 35, sellingPrice: 28, discountPercent: 20, unit: "ROLL", brand: "Zupwell",  description: "Premium quality brown BOPP tape. Excellent adhesion. Ideal for carton sealing." },
    { name: "BOPP Tape 3 Inch 65m Brown", sku: "BOPP-BRN-3IN-65M", hsnCode: "3919", categorySlug: "bopp-tape",    basePrice: 50, sellingPrice: 42, discountPercent: 16, unit: "ROLL", brand: "Zupwell",  description: "Heavy duty 3 inch BOPP tape for large carton sealing." },
    { name: "BOPP Tape 2 Inch Transparent",sku:"BOPP-CLR-2IN-65M", hsnCode: "3919", categorySlug: "bopp-tape",    basePrice: 32, sellingPrice: 26, discountPercent: 18, unit: "ROLL", brand: "Zupwell",  description: "Crystal clear transparent BOPP tape. Invisible after application." },
    { name: "Stretch Film 500mm x 200m",  sku: "STRCH-500-200",    hsnCode: "3920", categorySlug: "stretch-film", basePrice: 280, sellingPrice: 220, discountPercent: 21, unit: "ROLL", brand: "Zupwell", description: "Machine grade stretch film. 17 micron thickness. High clarity and strength." },
    { name: "Bubble Wrap Roll 1m x 50m",  sku: "BWRAP-1M-50M",     hsnCode: "3921", categorySlug: "bubble-wrap",  basePrice: 950, sellingPrice: 780, discountPercent: 17, unit: "ROLL", brand: "Zupwell", description: "Standard 10mm bubble size. Ideal for fragile item protection during transit." },
    { name: "Courier Bag 12x16 inch 100pc",sku:"CBAG-12X16-100",   hsnCode: "3923", categorySlug: "courier-bags", basePrice: 220, sellingPrice: 180, discountPercent: 18, unit: "PACK", brand: "Zupwell", description: "Tamper-proof courier bags with POD sleeve. Matte finish with self-seal closure." },
    { name: "Courier Bag 14x20 inch 100pc",sku:"CBAG-14X20-100",   hsnCode: "3923", categorySlug: "courier-bags", basePrice: 320, sellingPrice: 260, discountPercent: 18, unit: "PACK", brand: "Zupwell", description: "Large courier bags for bulky ecommerce shipments." },
    { name: "Single Wall Carton Box 12x8x6",sku:"CTN-12X8X6-SW",   hsnCode: "4819", categorySlug: "carton-box",   basePrice: 22, sellingPrice: 18, discountPercent: 18, unit: "NOS",  brand: "Zupwell",  description: "3-ply single wall corrugated carton box. 150 GSM kraft. Strong and lightweight." },
    { name: "PE Foam Roll 1m x 100m 3mm", sku: "FOAM-1M-100M-3MM", hsnCode: "3921", categorySlug: "foam-rolls",   basePrice: 1400, sellingPrice: 1150, discountPercent: 17, unit: "ROLL", brand: "Zupwell", description: "Closed cell polyethylene foam roll. Excellent cushioning for fragile items." },
    { name: "Masking Tape 1 Inch 30m",    sku: "MASK-1IN-30M",     hsnCode: "3919", categorySlug: "packaging-tape",basePrice: 18, sellingPrice: 14, discountPercent: 22, unit: "ROLL", brand: "Zupwell",  description: "Crepe paper masking tape. Easy tear and clean removal. Painting grade." },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) continue;
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const cat  = categories[p.categorySlug];
    const product = await prisma.product.create({
      data: {
        name: p.name, slug, sku: p.sku, hsnCode: p.hsnCode,
        categoryId:     cat?.id || null,
        basePrice:      p.basePrice,
        sellingPrice:   p.sellingPrice,
        discountPercent: p.discountPercent,
        unit:           p.unit,
        brand:          p.brand,
        description:    p.description,
        shortDescription: p.description.slice(0, 80),
        isActive:   true,
        isFeatured: Math.random() > 0.6,
      },
    });
    await prisma.inventory.create({ data: { productId: product.id, qtyInStock: Math.floor(Math.random() * 200) + 20, lowStockThreshold: 10 } });
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

  console.log("\n🎉 Seed complete!");
  console.log("   Admin email:    admin@zupwell.in");
  console.log("   Admin password: Admin@123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
