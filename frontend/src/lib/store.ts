import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthCookie, clearAdminAuthCookie } from "./auth-cookie";

interface CartItem {
  productId: number;
  variantId?: number;
  name: string;
  sku: string;
  price: number;
  qty: number;
  imageUrl?: string;
  unit: string;
  pack?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface AppStore {
  user: User | null;
  token: string | null;
  cart: CartItem[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  addToCart: (item: CartItem) => void;
  updateCartQty: (productId: number, variantId: number | undefined, pack: number | undefined, qty: number) => void;
  removeFromCart: (productId: number, variantId: number | undefined, pack: number | undefined) => void;
  clearCart: () => void;
  logout: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      cart: [],

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      // NOTE: cart lines are matched on productId + variantId + pack.
      // Two different pack sizes of the same product/variant are DIFFERENT
      // line items with different per-line prices — they must never be
      // merged into one row, or the price silently goes stale (see the
      // ₹14,000 → ₹3,000 billing bug in the audit doc).
      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find(
          (c) => c.productId === item.productId && c.variantId === item.variantId && c.pack === item.pack
        );
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.productId === item.productId && c.variantId === item.variantId && c.pack === item.pack
                ? { ...c, qty: c.qty + item.qty, price: item.price } // always refresh price too, never just qty
                : c
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },

      updateCartQty: (productId, variantId, pack, qty) => {
        const { cart } = get();
        if (qty <= 0) {
          set({ cart: cart.filter((c) => !(c.productId === productId && c.variantId === variantId && c.pack === pack)) });
        } else {
          set({
            cart: cart.map((c) =>
              c.productId === productId && c.variantId === variantId && c.pack === pack ? { ...c, qty } : c
            ),
          });
        }
      },

      removeFromCart: (productId, variantId, pack) => {
        set({
          cart: get().cart.filter(
            (c) => !(c.productId === productId && c.variantId === variantId && c.pack === pack)
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      logout: () => {
        clearAuthCookie();
        try {
          clearAdminAuthCookie();
          localStorage.removeItem("zupwell-admin");
        } catch (e) {}
        set({ user: null, token: null, cart: [] });
      },
    }),
    { name: "zupwell-store" }
  )
);
