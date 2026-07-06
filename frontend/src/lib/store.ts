import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthCookie } from "./auth-cookie";

interface CartItem {
  productId: number;
  variantId?: number;
  name: string;
  sku: string;
  price: number;
  qty: number;
  imageUrl?: string;
  unit: string;
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
  updateCartQty: (productId: number, variantId: number | undefined, qty: number) => void;
  removeFromCart: (productId: number, variantId?: number) => void;
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

      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find(
          (c) => c.productId === item.productId && c.variantId === item.variantId
        );
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.productId === item.productId && c.variantId === item.variantId
                ? { ...c, qty: c.qty + item.qty }
                : c
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },

      updateCartQty: (productId, variantId, qty) => {
        const { cart } = get();
        if (qty <= 0) {
          set({ cart: cart.filter((c) => !(c.productId === productId && c.variantId === variantId)) });
        } else {
          set({
            cart: cart.map((c) =>
              c.productId === productId && c.variantId === variantId ? { ...c, qty } : c
            ),
          });
        }
      },

      removeFromCart: (productId, variantId) => {
        set({
          cart: get().cart.filter(
            (c) => !(c.productId === productId && c.variantId === variantId)
          ),
        });
      },

      clearCart: () => set({ cart: [] }),

      logout: () => {
        clearAuthCookie();
        set({ user: null, token: null, cart: [] });
      },
    }),
    { name: "zupwell-store" }
  )
);
