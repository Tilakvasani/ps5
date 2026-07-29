const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

const { PrismaClient } = require("@prisma/client");

/**
 * Ensures PostgreSQL connection URL contains parameters required for
 * cloud databases (Supabase, Neon, Render) & PgBouncer to prevent
 * "Error in PostgreSQL connection: Error { kind: Closed, cause: None }" errors.
 */
function buildDatabaseUrl(rawUrl) {
  if (!rawUrl) return undefined;
  let url = rawUrl.trim();

  const hasParams = url.includes("?");
  const paramsToAdd = [];

  if (!url.includes("connection_limit=")) {
    paramsToAdd.push("connection_limit=10");
  }
  if (!url.includes("pool_timeout=")) {
    paramsToAdd.push("pool_timeout=30");
  }
  if (!url.includes("connect_timeout=")) {
    paramsToAdd.push("connect_timeout=30");
  }

  // Disable prepared statements for PgBouncer / pooled PostgreSQL connections
  if ((url.includes("6543") || url.includes("pooler") || url.includes("supabase") || url.includes("neon")) && !url.includes("pgbouncer=")) {
    paramsToAdd.push("pgbouncer=true");
  }

  if (paramsToAdd.length > 0) {
    url += (hasParams ? "&" : "?") + paramsToAdd.join("&");
  }

  return url;
}

const dbUrl = buildDatabaseUrl(process.env.DATABASE_URL);

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
});

// Middleware for handling connection drops and auto-reconnecting gracefully
prisma.$use(async (params, next) => {
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      return await next(params);
    } catch (error) {
      const errMsg = String(error?.message || error || "");
      const isConnectionClosed =
        errMsg.includes("kind: Closed") ||
        errMsg.includes("connection closed") ||
        errMsg.includes("Closed") ||
        errMsg.includes("P1001") ||
        errMsg.includes("P1017") ||
        errMsg.includes("EngineState");

      if (isConnectionClosed && retries < maxRetries - 1) {
        retries++;
        console.warn(`⚠️ [Prisma Connection Warning] Database socket closed. Reconnecting & retrying query (${retries}/${maxRetries})...`);
        try {
          await prisma.$connect();
        } catch (cErr) {
          // Ignore reconnect error and retry in loop
        }
        await new Promise((resolve) => setTimeout(resolve, 300 * retries));
      } else {
        throw error;
      }
    }
  }
});

module.exports = prisma;
