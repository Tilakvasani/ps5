const fs = require("fs");
const path = require("path");

// Load .env
try {
  const dotenvFile = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  dotenvFile.split("\n").forEach(line => {
    const parts = line.split("=");
    if (parts.length > 1) {
      process.env[parts[0].trim()] = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
} catch (e) {
  console.log("Could not load .env file", e.message);
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const settings = await prisma.setting.findMany();
  console.log(JSON.stringify(settings, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
