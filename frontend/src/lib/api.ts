import axios from "axios";

let baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

if (typeof window !== "undefined") {
  const hostname  = window.location.hostname;
  const isLocal   = hostname === "localhost" || hostname === "127.0.0.1";
  const isIp      = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
  if (!process.env.NEXT_PUBLIC_API_URL && (isLocal || isIp)) {
    baseUrl = `${window.location.protocol}//${hostname}:8000`;
  }
}

export const API_URL = baseUrl;

export const api = axios.create({
  baseURL      : API_URL,
  withCredentials: true,
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const isAdmin = config.url?.includes("/admin/");
    if (isAdmin) {
      const adminRaw = localStorage.getItem("zupwell-admin");
      if (adminRaw) {
        const token = JSON.parse(adminRaw)?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      const raw = localStorage.getItem("zupwell-store");
      if (raw) {
        const token = JSON.parse(raw)?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || "Something went wrong";
    if (err.response?.status === 401 && typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      localStorage.removeItem("zupwell-admin");
      try { const { clearAdminAuthCookie } = require("./auth-cookie"); clearAdminAuthCookie(); } catch {}
    }
    return Promise.reject(new Error(msg));
  }
);


// ── Auth – Shiprocket Login & Address Vault ───────────────────────────────────
export const authApi = {
  /**
   * Step 1: Ask Shiprocket to send an OTP to the buyer's phone.
   * Returns { step: "otp" | "admin-otp" }
   */
  srSendOtp: (phone: string) =>
    api.post("/api/auth/sr-send-otp", { phone }).then((r) => r.data),

  /**
   * Step 2: Verify the OTP with Shiprocket.
   * For regular users returns { step: "logged-in", accessToken, user, srAddresses }.
   * For admins returns { step: "admin-credentials", gateToken }.
   */
  srVerifyOtp: (phone: string, otp: string) =>
    api.post("/api/auth/sr-verify-otp", { phone, otp }).then((r) => r.data),

  /** Get current user session */
  me: () => api.get("/api/auth/me").then((r) => r.data),

  /** Logout (clears server-side session if any) */
  logout: () => api.post("/api/auth/logout").then((r) => r.data),

  /** Razorpay phone-auth sync (kept for payment webhook compatibility) */
  razorpaySync: (phone: string, email?: string, name?: string) =>
    api.post("/api/auth/razorpay-sync", { phone, email, name }).then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  login: (email: string, password: string, gateToken: string) =>
    api.post("/api/admin/auth/login", { email, password, gateToken }).then((r) => r.data),
};


// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get("/api/products", { params }).then((r) => r.data),
  get: (slug: string) => api.get(`/api/products/${slug}`).then((r) => r.data),
  categories: () => api.get("/api/categories").then((r) => r.data),
};


// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => api.get("/api/cart").then((r) => r.data),
  addItem: (productId: number, variantId?: number, qty = 1) =>
    api.post("/api/cart/items", { productId, variantId, qty }).then((r) => r.data),
  updateItem: (id: number, qty: number) =>
    api.put(`/api/cart/items/${id}`, { qty }).then((r) => r.data),
  removeItem: (id: number) =>
    api.delete(`/api/cart/items/${id}`).then((r) => r.data),
  applyCoupon: (code: string) =>
    api.post("/api/cart/apply-coupon", { code }).then((r) => r.data),
};


// ── Orders ────────────────────────────────────────────────────────────────────
export const ordersApi = {
  create: (data: Record<string, unknown>) =>
    api.post("/api/orders", data).then((r) => r.data),
  list: () => api.get("/api/orders").then((r) => r.data),
  get: (orderNumber: string) => api.get(`/api/orders/${orderNumber}`).then((r) => r.data),
  cancel: (orderId: number) => api.delete(`/api/orders/${orderId}/cancel`).then((r) => r.data),
  track: (orderNumber: string, phone: string) =>
    api.post("/api/orders/track", { orderNumber, phone }).then((r) => r.data),
};


// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  createRazorpayOrder: (orderId: number) =>
    api.post("/api/payments/create-razorpay-order", { orderId }).then((r) => r.data),
  verify: (data: Record<string, string>) =>
    api.post("/api/payments/verify", data).then((r) => r.data),
};


// ── Invoices ──────────────────────────────────────────────────────────────────
export const invoicesApi = {
  downloadPdf: async (invoiceNumber: string): Promise<void> => {
    const url = `${API_URL}/api/invoices/${invoiceNumber}/pdf`;
    let token: string | null = null;
    try {
      const userRaw  = localStorage.getItem("zupwell-store");
      token = userRaw ? JSON.parse(userRaw)?.state?.token ?? null : null;
      if (!token) {
        const adminRaw = localStorage.getItem("zupwell-admin");
        token = adminRaw ? JSON.parse(adminRaw)?.token ?? null : null;
      }
    } catch {}

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to download invoice");

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href  = URL.createObjectURL(blob);
    link.download = `invoice-${invoiceNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(link.href);
  },
};


// ── Account (profile + local addresses) ──────────────────────────────────────
export const accountApi = {
  getAddresses  : () => api.get("/api/account/addresses").then((r) => r.data),
  addAddress    : (data: Record<string, unknown>) =>
    api.post("/api/account/addresses", data).then((r) => r.data),
  updateAddress : (id: number, data: Record<string, unknown>) =>
    api.put(`/api/account/addresses/${id}`, data).then((r) => r.data),
  deleteAddress : (id: number) => api.delete(`/api/account/addresses/${id}`).then((r) => r.data),
  updateProfile : (data: { name?: string; email?: string }) =>
    api.put("/api/account/profile", data).then((r) => r.data),
};
