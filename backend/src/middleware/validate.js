/**
 * validate.js — Input Validation Middleware
 * ==========================================
 * SECURITY FIX: Sanitizes and validates all incoming request body data
 * to prevent injection attacks and unexpected input types.
 * 
 * Usage in routes:
 *   router.post("/products", validate.product, handler);
 *   router.post("/orders",   validate.order,   handler);
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Strip HTML/script tags from a string to prevent stored XSS */
function stripTags(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "").trim();
}

/** Ensure value is a positive number */
function positiveNum(val, fallback = 0) {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? fallback : n;
}

/** Ensure value is a valid integer ID */
function safeId(val) {
  const n = parseInt(val, 10);
  return isNaN(n) || n < 1 ? null : n;
}

// ── Sanitizers ────────────────────────────────────────────────────────────────

function sanitizeString(val, maxLen = 500) {
  if (val === undefined || val === null) return undefined;
  return stripTags(String(val)).slice(0, maxLen);
}

// ── Middleware Factories ──────────────────────────────────────────────────────

/**
 * sanitizeBody — Generic middleware that strips HTML tags from all string fields.
 * Apply to any route that accepts user-submitted text.
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = stripTags(req.body[key]).trim();
      }
    }
  }
  next();
}

/**
 * validatePagination — Ensures skip/take query params are safe integers.
 * Prevents crafted pagination params from causing DB performance issues.
 */
function validatePagination(req, res, next) {
  const page = parseInt(req.query.page, 10);
  const perPage = parseInt(req.query.perPage, 10);

  req.query.page = (!isNaN(page) && page > 0) ? Math.min(page, 1000) : 1;
  req.query.perPage = (!isNaN(perPage) && perPage > 0) ? Math.min(perPage, 100) : 20;
  next();
}

/**
 * validateProductBody — Validates product create/update payloads.
 */
function validateProductBody(req, res, next) {
  const { name, basePrice, sellingPrice, sku } = req.body;

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    return res.status(400).json({ error: "Product name must be at least 2 characters" });
  }

  if (basePrice !== undefined && positiveNum(basePrice) === 0 && basePrice !== 0) {
    return res.status(400).json({ error: "basePrice must be a positive number" });
  }

  if (sellingPrice !== undefined && positiveNum(sellingPrice) === 0 && sellingPrice !== 0) {
    return res.status(400).json({ error: "sellingPrice must be a positive number" });
  }

  // Sanitize text fields
  sanitizeBody(req, res, () => {});
  next();
}

/**
 * validateOrderStatus — Ensures only valid status values are accepted.
 */
const VALID_ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function validateOrderStatus(req, res, next) {
  const { status } = req.body;
  if (status && !VALID_ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}` });
  }
  next();
}

/**
 * validateIdParam — Ensures :id route params are valid positive integers.
 */
function validateIdParam(req, res, next) {
  const id = safeId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid ID parameter" });
  req.params.id = id;
  next();
}

module.exports = {
  sanitizeBody,
  validatePagination,
  validateProductBody,
  validateOrderStatus,
  validateIdParam,
  stripTags,
  safeId,
};
