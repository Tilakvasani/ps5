/**
 * baselinker.js — BaseLinker API utility for Zupwell
 * API: https://api.baselinker.com/connector.php
 *
 * FIX: Removed delivery_phone & invoice_phone — these parameters do NOT exist
 *      in BaseLinker's addOrder API and caused:
 *      ERROR_BAD_PARAMETER: The specified parameter does not exist (delivery_phone)
 *
 *      Phone number is now stored in admin_comments alongside the order number,
 *      and also in extra_field_2 so it's always visible in BaseLinker panel.
 */

const BASE_URL = "https://api.baselinker.com/connector.php";
let _cachedStatusId = null;

// ── Generic API call ──────────────────────────────────────────────────
async function callAPI(method, parameters = {}) {
  const token = process.env.BASELINKER_TOKEN;
  if (!token) throw new Error("BASELINKER_TOKEN is not set");

  const body = new URLSearchParams();
  body.append("method", method);
  body.append("parameters", JSON.stringify(parameters));

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-BLToken": token,
    },
    body: body.toString(),
  });

  const data = await res.json();
  if (data.status === "ERROR") {
    throw new Error("BaseLinker [" + data.error_code + "]: " + data.error_message);
  }
  return data;
}

// ── Auto fetch first order status ID ─────────────────────────────────
async function getFirstStatusId() {
  if (_cachedStatusId !== null) return _cachedStatusId;
  try {
    const data = await callAPI("getOrderStatusList");
    const statuses = data.statuses || [];
    if (statuses.length > 0) {
      _cachedStatusId = statuses[0].id;
      console.log("BaseLinker status ID: " + _cachedStatusId + " (" + statuses[0].name + ")");
      return _cachedStatusId;
    }
  } catch (err) {
    console.error("BaseLinker status fetch failed:", err.message);
  }
  return null;
}

// ── Add Order ─────────────────────────────────────────────────────────
async function addOrder(order, user) {
  const addr   = order.address;
  const statusId = await getFirstStatusId();

  // ── Products — only data from the order itself ────────────────────
  const products = order.items.map((item) => ({
    storage:      "personal",
    storage_id:   0,
    product_id:   "",
    variant_id:   0,
    name:         item.product?.name || ("Product #" + item.productId),
    sku:          item.product?.sku  || ("SKU-" + item.productId),
    ean:          "",
    location:     "",
    warehouse_id: 0,
    attributes:   "",
    price_brutto: Number(item.unitPrice),
    tax_rate:     0,
    quantity:     item.qty,
    weight:       0.5,
  }));

  // ── Build delivery address string ─────────────────────────────────
  const deliveryAddress =
    addr.addressLine1 + (addr.addressLine2 ? ", " + addr.addressLine2 : "");

  // ── Payment flags ─────────────────────────────────────────────────
  const isCOD = order.paymentMethod === "cod";

  const parameters = {
    // ── Status & dates ───────────────────────────────────────────────
    order_status_id: statusId,
    date_add:        Math.floor(new Date(order.createdAt).getTime() / 1000),

    // ── Currency & payment ───────────────────────────────────────────
    currency:           "INR",
    payment_method:     isCOD ? "Cash on Delivery" : "Online Payment",
    payment_method_cod: isCOD ? 1 : 0,
    paid:               isCOD ? 0 : Number(order.totalAmount),

    // ── Shipping ─────────────────────────────────────────────────────
    delivery_method: "",
    delivery_price:  Number(order.shippingCharge) || 0,

    // ── Delivery address (NO delivery_phone — not a valid BL field) ──
    delivery_fullname:     addr.fullName,
    delivery_company:      "",
    delivery_address:      deliveryAddress,
    delivery_city:         addr.city,
    delivery_state:        addr.state || "",       // state added for eHandler
    delivery_postcode:     addr.pincode,
    delivery_country_code: "IN",
    delivery_email:        user.email || "",

    // ── Invoice address (NO invoice_phone — not a valid BL field) ───
    invoice_fullname:      addr.fullName,
    invoice_company:       "",
    invoice_nip:           addr.gstin || "",       // GST number → NIP field
    invoice_address:       addr.addressLine1,
    invoice_city:          addr.city,
    invoice_state:         addr.state || "",
    invoice_postcode:      addr.pincode,
    invoice_country_code:  "IN",
    invoice_email:         user.email || "",
    want_invoice:          addr.gstin ? 1 : 0,

    // ── Extra fields (visible in BaseLinker panel) ───────────────────
    // extra_field_1 → Order number from Zupwell
    // extra_field_2 → Phone number (since delivery_phone doesn't exist)
    extra_field_1: order.orderNumber,
    extra_field_2: addr.phone || "",

    // ── Comments ─────────────────────────────────────────────────────
    admin_comments:
      "Zupwell Order: " +
      order.orderNumber +
      " | Phone: " +
      (addr.phone || "N/A") +
      (isCOD ? "" : " | Razorpay: " + (order.razorpayPaymentId || "")),
    user_comments: "",

    products,
  };

  const data = await callAPI("addOrder", parameters);
  console.log("✅ BaseLinker: order pushed — ID: " + data.order_id);
  return { baselinkerOrderId: String(data.order_id) };
}

module.exports = { callAPI, addOrder };