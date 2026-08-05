/**
 * Phone Number Utilities
 * =======================
 * Shared single source of truth for phone number cleaning and formatting.
 */

/**
 * Strips all non-digit characters and extracts the last 10 digits of a phone number.
 */
function cleanPhone(raw) {
  return String(raw || "").replace(/\D/g, "").slice(-10);
}

/**
 * Formats a 10-digit phone number with India country code 91 for WhatsApp / MSG91.
 */
function formatWhatsAppNumber(raw) {
  const cleaned = cleanPhone(raw);
  return cleaned.length === 10 ? `91${cleaned}` : cleaned;
}

module.exports = {
  cleanPhone,
  formatWhatsAppNumber,
};
