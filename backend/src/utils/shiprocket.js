/**
 * shiprocket.js — Shiprocket API utility for Zupwell
 *
 * Handles:
 *  - Auto-login & token caching (tokens expire in 24h)
 *  - createOrder()    → pushes an order to Shiprocket
 *  - generateAWB()    → assigns a courier and AWB code
 *  - getTracking()    → fetches live tracking status
 *  - cancelOrder()    → cancels order in Shiprocket
 */

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// ── Token cache (in-memory; resets on server restart) ────────────────
let _token = null;
let _tokenExpiry = null;

async function getToken() {
  // Return cached token if still valid (with 5-min buffer)
  if (_token && _tokenExpiry && Date.now() < _tokenExpiry - 5 * 60 * 1000) {
    return _token;
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:    process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Shiprocket login failed: ${err}`);
  }

  const data = await res.json();
  _token       = data.token;
  _tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  console.log("✅ Shiprocket: token refreshed");
  return _token;
}

// ── Generic authenticated request ────────────────────────────────────
async function srFetch(path, method = "GET", body = null) {
  const token = await getToken();
  const opts = {
    method,
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();

  if (!res.ok) {
    console.error("Shiprocket API error:", data);
    throw new Error(data?.message || `Shiprocket error on ${path}`);
  }
  return data;
}

// ── Create order in Shiprocket ────────────────────────────────────────
/**
 * @param {Object} order   - Prisma order object (with items, address included)
 * @param {Object} user    - { name, email, phone }
 * @returns {Object}       - { shiprocketOrderId, shipmentId }
 */
async function createOrder(order, user) {
  const addr = order.address;

  // Map order items to Shiprocket format
  const orderItems = order.items.map((item) => ({
    name:     item.product?.name || `Product #${item.productId}`,
    sku:      item.product?.sku  || `SKU-${item.productId}`,
    units:    item.qty,
    selling_price: Number(item.unitPrice),
    discount: 0,
    tax:      "",
    hsn:      item.hsnCode || "3919",
  }));

  const payload = {
    order_id:          order.orderNumber,
    order_date:        new Date(order.createdAt).toISOString().split("T")[0], // YYYY-MM-DD
    pickup_location:   process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",

    channel_id: "",  // leave blank for manual/custom channel

    billing_customer_name:  addr.fullName,
    billing_last_name:      "",
    billing_address:        addr.addressLine1,
    billing_address_2:      addr.addressLine2 || "",
    billing_city:           addr.city,
    billing_pincode:        addr.pincode,
    billing_state:          addr.state,
    billing_country:        "India",
    billing_email:          user.email,
    billing_phone:          addr.phone,
    billing_alternate_phone: "",

    shipping_is_billing: true,

    order_items: orderItems,

    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    shipping_charges: Number(order.shippingCharge) || 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: Number(order.discountAmount) || 0,
    sub_total:      Number(order.subtotal),
    length:         10,  // cm — adjust per your packaging
    breadth:        10,
    height:         10,
    weight:         0.5, // kg — adjust per your product weight
  };

  const data = await srFetch("/orders/create/adhoc", "POST", payload);

  return {
    shiprocketOrderId: String(data.order_id),
    shipmentId:        data.shipment_id,
  };
}

// ── Generate AWB (assign courier) ────────────────────────────────────
/**
 * @param {string|number} shipmentId  - Shiprocket shipment_id from createOrder
 * @returns {Object} - { awbCode, courierName, trackingUrl }
 */
async function generateAWB(shipmentId) {
  const data = await srFetch("/courier/assign/awb", "POST", {
    shipment_id: String(shipmentId),
    courier_id:  "",  // blank = Shiprocket auto-assigns best courier
  });

  const response = data?.response?.data;
  const awbCode    = response?.awb_code     || "";
  const courierName = response?.courier_name || "";
  const trackingUrl = awbCode
    ? `https://shiprocket.co/tracking/${awbCode}`
    : "";

  return { awbCode, courierName, trackingUrl };
}

// ── Schedule Pickup ───────────────────────────────────────────────────
/**
 * @param {string|number} shipmentId
 */
async function schedulePickup(shipmentId) {
  const data = await srFetch("/courier/generate/pickup", "POST", {
    shipment_id: [String(shipmentId)],
  });
  return data;
}

// ── Get Tracking Info ─────────────────────────────────────────────────
/**
 * @param {string} awbCode
 * @returns {Object} tracking data
 */
async function getTracking(awbCode) {
  const data = await srFetch(`/courier/track/awb/${awbCode}`);
  return data?.tracking_data || null;
}

// ── Cancel Order ──────────────────────────────────────────────────────
/**
 * @param {string[]} orderIds  - array of Shiprocket order IDs (strings)
 */
async function cancelOrder(orderIds) {
  const data = await srFetch("/orders/cancel", "POST", {
    ids: orderIds.map(String),
  });
  return data;
}

module.exports = {
  createOrder,
  generateAWB,
  schedulePickup,
  getTracking,
  cancelOrder,
};
