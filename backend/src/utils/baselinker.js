/**
 * baselinker.js — BaseLinker API utility for Zupwell
 * Docs: https://api.baselinker.com/connector.php
 */

const BASE_URL = "https://api.baselinker.com/connector.php";

// Cache status ID so we don't fetch every time
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
    throw new Error(`BaseLinker API error [${data.error_code}]: ${data.error_message}`);
  }
  return data;
}

// ── Get first available order status ID ──────────────────────────────
async function getFirstStatusId() {
  if (_cachedStatusId !== null) return _cachedStatusId;
  try {
    const data = await callAPI("getOrderStatusList");
    const statuses = data.statuses || [];
    if (statuses.length > 0) {
      _cachedStatusId = statuses[0].id;
      console.log("BaseLinker: using status ID " + _cachedStatusId + " (" + statuses[0].name + ")");
      return _cachedStatusId;
    }
  } catch (err) {
    console.error("Could not fetch BaseLinker statuses:", err.message);
  }
  return null;
}

// ── Add Order to BaseLinker ───────────────────────────────────────────
async function addOrder(order, user) {
  const addr = order.address;
  const statusId = await getFirstStatusId();

  const products = order.items.map((item) => ({
    storage:      "db",
    storage_id:   0,
    product_id:   String(item.productId || ""),
    variant_id:   0,
    name:         item.product?.name || ("Product #" + item.productId),
    sku:          item.product?.sku  || ("SKU-" + item.productId),
    ean:          "",
    location:     "",
    warehouse_id: 0,
    attributes:   "",
    price_brutto: Number(item.unitPrice),
    tax_rate:     18,
    quantity:     item.qty,
    weight:       0.5,
  }));

  const parameters = {
    ...(statusId !== null && { order_status_id: statusId }),
    date_add:           Math.floor(new Date(order.createdAt).getTime() / 1000),
    currency:           "INR",
    payment_method:     order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment",
    payment_method_cod: order.paymentMethod === "cod" ? 1 : 0,
    payment_done:       order.paymentMethod === "cod" ? 0 : Number(order.totalAmount),
    delivery_method:       "",
    delivery_price:        Number(order.shippingCharge) || 0,
    delivery_fullname:     addr.fullName,
    delivery_company:      "",
    delivery_address:      addr.addressLine1 + (addr.addressLine2 ? ", " + addr.addressLine2 : ""),
    delivery_city:         addr.city,
    delivery_postcode:     addr.pincode,
    delivery_country_code: "IN",
    delivery_phone:        addr.phone,
    delivery_email:        user.email || "",
    invoice_fullname:      addr.fullName,
    invoice_company:       "",
    invoice_address:       addr.addressLine1,
    invoice_city:          addr.city,
    invoice_postcode:      addr.pincode,
    invoice_country_code:  "IN",
    invoice_email:         user.email || "",
    invoice_phone:         addr.phone,
    invoice_nip:           addr.gstin || "",
    admin_comments: "Zupwell Order#: " + order.orderNumber,
    user_comments:  "",
    want_invoice:   addr.gstin ? 1 : 0,
    extra_field_1:  order.orderNumber,
    extra_field_2:  order.paymentMethod === "cod" ? "COD" : ("Razorpay: " + (order.razorpayPaymentId || "")),
    products,
  };

  const data = await callAPI("addOrder", parameters);
  return { baselinkerOrderId: String(data.order_id) };
}

module.exports = { callAPI, addOrder };