import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthCookie, clearAdminAuthCookie } from "./auth-cookie";

interface CartItem {
  productId : number;
  variantId?: number;
  name      : string;
  sku       : string;
  price     : number;
  qty       : number;
  imageUrl? : string;
  unit      : string;
  pack?     : number;
}

interface User {
  id    : number;
  name  : string;
  email : string;
  phone?: string;
}

/** Address entry from Shiprocket's buyer vault */
export interface SRAddress {
  id          : string;       // "sr_xxx"  — prefixed to distinguish from DB ids
  source      : "shiprocket";
  fullName    : string;
  phone       : string;
  addressLine1: string;
  addressLine2: string;
  city        : string;
  state       : string;
  pincode     : string;
  label       : string;
  isDefault   : boolean;
}

interface AppStore {
  user       : User | null;
  token      : string | null;
  cart       : CartItem[];
  srAddresses: SRAddress[];   // Shiprocket vault addresses fetched at login

  setUser        : (user: User | null) => void;
  setToken       : (token: string | null) => void;
  setSRAddresses : (addresses: SRAddress[]) => void;
  addToCart      : (item: CartItem) => void;
  updateCartQty  : (productId: number, variantId: number | undefined, pack: number | undefined, qty: number) => void;
  removeFromCart : (productId: number, variantId: number | undefined, pack: number | undefined) => void;
  clearCart      : () => void;
  logout         : () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user        : null,
      token       : null,
      cart        : [],
      srAddresses : [],

      setUser        : (user) => set({ user }),
      setToken       : (token) => set({ token }),
      setSRAddresses : (srAddresses) => set({ srAddresses }),

      // Cart lines are matched on productId + variantId + pack.
      // Two different pack sizes are DIFFERENT line items with different prices.
      addToCart: (item) => {
        const { cart } = get();
        const existing = cart.find(
          (c) => c.productId === item.productId && c.variantId === item.variantId && c.pack === item.pack
        );
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.productId === item.productId && c.variantId === item.variantId && c.pack === item.pack
                ? { ...c, qty: c.qty + item.qty, price: item.price }
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
        set({ cart: get().cart.filter((c) => !(c.productId === productId && c.variantId === variantId && c.pack === pack)) });
      },

      clearCart: () => set({ cart: [] }),

      logout: () => {
        clearAuthCookie();
        try {
          clearAdminAuthCookie();
          localStorage.removeItem("zupwell-admin");
        } catch {}
        set({ user: null, token: null, cart: [], srAddresses: [] });
      },
    }),
    { name: "zupwell-store" }
  )
);
