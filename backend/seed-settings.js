/**
 * Run this once to insert/update ALL store settings in DB:
 *   node seed-settings.js
 *
 * Uses update: {...} so it OVERWRITES existing values.
 * After running, go to Admin → Settings to change any value.
 */
const prisma = require("./src/utils/prisma");

const defaults = [
  // Store Info
  { key: "site_name",         value: "Zupwell",           group: "general" },
  { key: "site_email",        value: "info@zupwell.com",  group: "general" },
  { key: "site_phone",        value: "+91 6355466208",    group: "general" },
  { key: "site_address",      value: "A-102 Adarsh Lifestyle, Near Devashya International School, New India Colony, Nikol, 382350 Ahmedabad, Gujarat, India.", group: "general" },
  { key: "site_gstin",        value: "24XXXXXXXXXXXXX",   group: "general" },
  { key: "site_state_code",   value: "24 (Gujarat)",      group: "general" },
  // Social
  { key: "social_instagram",  value: "https://instagram.com", group: "social" },
  { key: "social_facebook",   value: "https://facebook.com",  group: "social" },
  { key: "social_youtube",    value: "https://youtube.com",   group: "social" },
  { key: "social_linkedin",   value: "https://linkedin.com",  group: "social" },
];

async function seed() {
  console.log("Seeding store settings...\n");
  for (const s of defaults) {
    await prisma.setting.upsert({
      where:  { key: s.key },
      update: { value: s.value, group: s.group },  // always overwrite
      create: { key: s.key, value: s.value, group: s.group },
    });
    console.log(`  ✓ ${s.key} = "${s.value}"`);
  }
  console.log("\nDone! Now go to Admin → Settings to update your real GSTIN.");
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
