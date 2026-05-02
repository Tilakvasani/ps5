import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach token from localStorage if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const isAdminRoute = config.url?.includes("/admin/");
    if (isAdminRoute) {
      const adminRaw = localStorage.getItem("zupwell-admin");
      if (adminRaw) {
        const adminData = JSON.parse(adminRaw);
        const token = adminData?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      const raw = localStorage.getItem("zupwell-store");
      if (raw) {
        const store = JSON.parse(raw);
        const token = store?.state?.token;
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
    return Promise.reject(new Error(msg));
  }
);

// ── Auth ──────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    api.post("/api/auth/register", data).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }).then((r) => r.data),
  logout: () => api.post("/api/auth/logout").then((r) => r.data),
  me: () => api.get("/api/auth/me").then((r) => r.data),
};

// ── Products ──────────────────────────────────────
export const productsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get("/api/products", { params }).then((r) => r.data),
  get: (slug: string) =>
    api.get(`/api/products/${slug}`).then((r) => r.data),
  categories: () =>
    api.get("/api/categories").then((r) => r.data),
};

// ── Cart ──────────────────────────────────────────
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

// ── Orders ────────────────────────────────────────
export const ordersApi = {
  create: (data: Record<string, unknown>) =>
    api.post("/api/orders", data).then((r) => r.data),
  list: () => api.get("/api/orders").then((r) => r.data),
  get: (orderNumber: string) =>
    api.get(`/api/orders/${orderNumber}`).then((r) => r.data),
  // Cancel a pending unpaid order (called when Razorpay is dismissed or fails)
  cancel: (orderId: number) =>
    api.delete(`/api/orders/${orderId}/cancel`).then((r) => r.data),
};

// ── Payments ──────────────────────────────────────
export const paymentsApi = {
  createRazorpayOrder: (orderId: number) =>
    api.post("/api/payments/create-razorpay-order", { orderId }).then((r) => r.data),
  verify: (data: Record<string, string>) =>
    api.post("/api/payments/verify", data).then((r) => r.data),
};

// ── Invoices ──────────────────────────────────────
export const invoicesApi = {
  getPdf: (invoiceNumber: string) => {
    const base = `${API_URL}/api/invoices/${invoiceNumber}/pdf`;
    try {
      // Try user token first, then admin token
      const userRaw = localStorage.getItem("zupwell-store");
      const userToken = userRaw ? JSON.parse(userRaw)?.state?.token : null;
      if (userToken) return `${base}?token=${encodeURIComponent(userToken)}`;

      const adminRaw = localStorage.getItem("zupwell-admin");
      const adminToken = adminRaw ? JSON.parse(adminRaw)?.token : null;
      if (adminToken) return `${base}?token=${encodeURIComponent(adminToken)}`;
    } catch {}
    return base;
  },
};

// ── Account ───────────────────────────────────────
export const accountApi = {
  getAddresses: () => api.get("/api/account/addresses").then((r) => r.data),
  addAddress: (data: Record<string, unknown>) =>
    api.post("/api/account/addresses", data).then((r) => r.data),
  updateAddress: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/account/addresses/${id}`, data).then((r) => r.data),
  deleteAddress: (id: number) =>
    api.delete(`/api/account/addresses/${id}`).then((r) => r.data),
  updateProfile: (data: Record<string, unknown>) =>
    api.put("/api/account/profile", data).then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────
export const adminApi = {
  login: (email: string, password: string) =>
    api.post("/api/admin/auth/login", { email, password }).then((r) => r.data),

  dashboard: () => api.get("/api/admin/dashboard/stats").then((r) => r.data),
  revenueChart: (days = 30) => api.get(`/api/admin/dashboard/revenue-chart?days=${days}`).then((r) => r.data),
  topProducts: () => api.get("/api/admin/dashboard/top-products").then((r) => r.data),

  // Products
  getProducts: (params?: Record<string, unknown>) =>
    api.get("/api/admin/products", { params }).then((r) => r.data),
  createProduct: (data: FormData) =>
    api.post("/api/admin/products", data, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  updateProduct: (id: number, data: FormData) =>
    api.put(`/api/admin/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  deleteProduct: (id: number) =>
    api.delete(`/api/admin/products/${id}`).then((r) => r.data),

  // Categories
  getCategories: () => api.get("/api/admin/categories").then((r) => r.data),
  createCategory: (data: Record<string, unknown>) =>
    api.post("/api/admin/categories", data).then((r) => r.data),
  updateCategory: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/admin/categories/${id}`, data).then((r) => r.data),
  deleteCategory: (id: number) =>
    api.delete(`/api/admin/categories/${id}`).then((r) => r.data),

  // Inventory
  getInventory: () => api.get("/api/admin/inventory").then((r) => r.data),
  addMovement: (data: Record<string, unknown>) =>
    api.post("/api/admin/inventory/movement", data).then((r) => r.data),
  getMovements: (params?: Record<string, unknown>) =>
    api.get("/api/admin/inventory/movements", { params }).then((r) => r.data),

  // Orders
  getOrders: (params?: Record<string, unknown>) =>
    api.get("/api/admin/orders", { params }).then((r) => r.data),
  getOrder: (id: number) => api.get(`/api/admin/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/api/admin/orders/${id}/status`, { status }).then((r) => r.data),

  // Invoices
  getInvoices: (params?: Record<string, unknown>) =>
    api.get("/api/admin/invoices", { params }).then((r) => r.data),
  cancelInvoice: (id: number) =>
    api.put(`/api/admin/invoices/${id}/cancel`).then((r) => r.data),

  // Users
  getUsers: (params?: Record<string, unknown>) =>
    api.get("/api/admin/users", { params }).then((r) => r.data),
  getUser: (id: number) => api.get(`/api/admin/users/${id}`).then((r) => r.data),

  // Coupons
  getCoupons: () => api.get("/api/admin/coupons").then((r) => r.data),
  createCoupon: (data: Record<string, unknown>) =>
    api.post("/api/admin/coupons", data).then((r) => r.data),
  updateCoupon: (id: number, data: Record<string, unknown>) =>
    api.put(`/api/admin/coupons/${id}`, data).then((r) => r.data),
  deleteCoupon: (id: number) =>
    api.delete(`/api/admin/coupons/${id}`).then((r) => r.data),

  // Reviews
  getReviews: () => api.get("/api/admin/reviews").then((r) => r.data),
  approveReview: (id: number) =>
    api.put(`/api/admin/reviews/${id}/approve`).then((r) => r.data),
  deleteReview: (id: number) =>
    api.delete(`/api/admin/reviews/${id}`).then((r) => r.data),

  // Settings
  getSettings: () => api.get("/api/admin/settings").then((r) => r.data),
  updateSettings: (data: Record<string, string>) =>
    api.put("/api/admin/settings", data).then((r) => r.data),

  // Notifications
  getNotifications: () => api.get("/api/admin/notifications").then((r) => r.data),
  markRead: (id: number) =>
    api.put(`/api/admin/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.put("/api/admin/notifications/read-all").then((r) => r.data),

  // GST rates
  getGstRates: () => api.get("/api/admin/gst-rates").then((r) => r.data),
};

export default api;
// Public settings — no auth needed, used by storefront pages
export const publicApi = {
  getSettings: (): Promise<Record<string, string>> =>
    api.get("/api/settings").then((r) => r.data),
  getReviews: (): Promise<any[]> =>
    api.get("/api/reviews/public").then((r) => r.data),
};