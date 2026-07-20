const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes("?") ? "&" : "?"}connection_limit=5&connect_timeout=30&pool_timeout=30`
        : undefined,
    },
  },
});

module.exports = prisma;

