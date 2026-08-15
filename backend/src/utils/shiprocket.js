/**
 * Shiprocket Checkout – Login & Address Vault API Utility
 *
 * ─── HOW TO GET YOUR CREDENTIALS ────────────────────────────────────────────
 * 1. Go to checkout-dashboard.shiprocket.in → Settings → Platform → Custom-Built
 * 2. Click "Shiprocket Login & Address Vault"
 * 3. Find your API Key and the exact API Base URL in the "Backend API" docs tab
 * 4. Add them to your Render environment variables:
 *    SHIPROCKET_CHECKOUT_API_URL  (e.g. https://api.fastrr.com)
 *    SHIPROCKET_CHECKOUT_API_KEY  (your merchant API key)
 *    SHIPROCKET_CHECKOUT_CHANNEL_ID  (your store's channel/store ID)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * TODO: Verify/update the three endpoint paths below to match what your
 *       Shiprocket Checkout dashboard shows under "Backend API Integration".
 */

const axios = require("axios");

const SR_API_URL = process.env.SHIPROCKET_CHECKOUT_API_URL;   // e.g. https://api.fastrr.com
const SR_API_KEY = process.env.SHIPROCKET_CHECKOUT_API_KEY;   // Merchant API key
const SR_CHANNEL_ID = process.env.SHIPROCKET_CHECKOUT_CHANNEL_ID; // Store channel ID

// ── Endpoint paths – update these from your dashboard API docs ───────────────
// These match the standard Fastrr/Shiprocket Checkout backend API pattern.
// Check the "Backend API" tab in your dashboard to confirm or update.
const SEND_OTP_PATH    = "/api/checkout/v1/buyer/login/send-otp";
const VERIFY_OTP_PATH  = "/api/checkout/v1/buyer/login/verify-otp";
const ADDRESSES_PATH   = "/api/checkout/v1/buyer/address";
// ─────────────────────────────────────────────────────────────────────────────

function srHeaders(extraHeaders = {}) {
  if (!SR_API_URL || !SR_API_KEY) {
    throw new Error("Shiprocket Checkout env vars not set (SHIPROCKET_CHECKOUT_API_URL / SHIPROCKET_CHECKOUT_API_KEY)");
  }
  return {
    "Content-Type": "application/json",
    "x-api-key": SR_API_KEY,
    ...(SR_CHANNEL_ID ? { "x-channel-id": SR_CHANNEL_ID } : {}),
    ...extraHeaders,
  };
}

/**
 * Sends an OTP to the buyer's phone via Shiprocket.
 * @param {string} phone  10-digit Indian phone number (no country code)
 */
async function sendOtp(phone) {
  const url = `${SR_API_URL}${SEND_OTP_PATH}`;
  try {
    const { data } = await axios.post(url, { phone }, { headers: srHeaders() });
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    throw new Error(msg || "Failed to send OTP via Shiprocket");
  }
}

/**
 * Verifies the OTP and returns buyer profile + saved addresses.
 * @param {string} phone  10-digit Indian phone number
 * @param {string} otp    6-digit OTP
 * @returns {{ buyerToken: string, name: string, email: string, phone: string, addresses: Array }}
 */
async function verifyOtp(phone, otp) {
  const url = `${SR_API_URL}${VERIFY_OTP_PATH}`;
  try {
    const { data } = await axios.post(url, { phone, otp }, { headers: srHeaders() });

    // Normalise response — different Shiprocket API versions may wrap
    // the buyer info under different keys. Adjust if needed.
    const buyer = data?.data || data?.buyer || data || {};
    const addresses = buyer?.addresses || data?.addresses || [];

    return {
      buyerToken : data?.buyerToken || data?.token || data?.data?.token || "",
      name       : buyer?.name  || "",
      email      : buyer?.email || "",
      phone      : buyer?.phone || phone,
      addresses  : normaliseAddresses(addresses),
    };
  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error || err.message;
    throw new Error(msg || "OTP verification failed");
  }
}

/**
 * Fetches saved addresses for a buyer using their buyerToken.
 * @param {string} buyerToken  Token returned by verifyOtp
 * @returns {Array}
 */
async function getBuyerAddresses(buyerToken) {
  const url = `${SR_API_URL}${ADDRESSES_PATH}`;
  try {
    const { data } = await axios.get(url, {
      headers: srHeaders({ Authorization: `Bearer ${buyerToken}` }),
    });
    const addresses = data?.addresses || data?.data?.addresses || data || [];
    return normaliseAddresses(Array.isArray(addresses) ? addresses : []);
  } catch (err) {
    // Non-critical: return empty list rather than crashing checkout
    console.error("Shiprocket getBuyerAddresses error:", err.message);
    return [];
  }
}

/**
 * Normalises Shiprocket address objects to our internal shape so we can map
 * them directly to UserAddress fields.
 *
 * TODO: If Shiprocket returns address fields with different names, update the
 *       mapping below to match the actual response from your dashboard's API.
 */
function normaliseAddresses(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((a, i) => ({
    id           : `sr_${a.id || i}`,        // prefixed so we know it's from SR vault
    source       : "shiprocket",
    fullName     : a.name       || a.full_name       || "",
    phone        : a.phone      || a.contact_number  || "",
    addressLine1 : a.address    || a.address_line1   || a.line1 || "",
    addressLine2 : a.address2   || a.address_line2   || a.line2 || "",
    city         : a.city       || "",
    state        : a.state      || "",
    pincode      : a.pincode    || a.zip             || "",
    label        : a.label      || a.type            || "home",
    isDefault    : a.is_default || false,
  }));
}

module.exports = { sendOtp, verifyOtp, getBuyerAddresses };
