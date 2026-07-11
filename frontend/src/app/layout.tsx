import type { Metadata } from "next";
import "./globals.css";
import WhatsAppButton from "@/components/storefront/WhatsAppButton";
import ServerWakeup from "@/components/ServerWakeup";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

const AuthSync = dynamic(() => import("@/components/AuthSync"), { ssr: false });



export const metadata: Metadata = {
  title: {
    default:  "Zupwell — Premium Health & Wellness Supplements",
    template: "%s | Zupwell",
  },
  description: "Zupwell offers science-backed electrolyte tablets, vitamins, protein, and wellness supplements. Sugar-free, delicious, and fast-absorbing. Order online with free delivery across India.",
  keywords: ["health supplements", "electrolyte tablets", "effervescent tablets", "vitamins India", "immunity booster", "protein supplements", "wellness products", "Zupwell", "Ahmedabad health store", "sugar free supplements"],
  authors: [{ name: "Zupwell", url: "https://zupwell.com" }],
  creator: "Zupwell",
  publisher: "Zupwell",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type:        "website",
    locale:      "en_IN",
    siteName:    "Zupwell",
    title:       "Zupwell — Premium Health & Wellness Supplements",
    description: "Science-backed electrolytes, vitamins, protein & wellness supplements. Sugar-free, delicious and effective. Fast delivery across India.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Zupwell Health Supplements" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Zupwell — Premium Health & Wellness Supplements",
    description: "Science-backed electrolytes, vitamins & wellness supplements. Sugar-free and delicious.",
    images:      ["/og-image.jpg"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://ps5-hhvf.vercel.app",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                try {
                  var prefix = "_zw_";

                  var obfuscateKey = function(k) {
                    if (typeof k !== 'string') return k;
                    if (
                      k.indexOf('zupwell') !== -1 ||
                      k.indexOf('ally') !== -1 ||
                      k.indexOf('rzp') !== -1 ||
                      k.indexOf('checkout') !== -1 ||
                      k === 'token' ||
                      k === 'auth_token'
                    ) {
                      return prefix + btoa(k).replace(/=/g, "");
                    }
                    return k;
                  };

                  var deobfuscateKey = function(ok) {
                    if (typeof ok !== 'string' || ok.indexOf(prefix) !== 0) return ok;
                    var raw = ok.slice(prefix.length);
                    while (raw.length % 4 !== 0) {
                      raw += "=";
                    }
                    try {
                      return atob(raw);
                    } catch (e) {
                      return ok;
                    }
                  };

                  var obfuscateValue = function(v) {
                    if (typeof v !== 'string') return v;
                    try {
                      return btoa(unescape(encodeURIComponent(v)));
                    } catch (e) {
                      return v;
                    }
                  };

                  var deobfuscateValue = function(ov) {
                    if (typeof ov !== 'string') return ov;
                    try {
                      return decodeURIComponent(escape(atob(ov)));
                    } catch (e) {
                      return ov;
                    }
                  };

                  var origGetItem = Storage.prototype.getItem;
                  Storage.prototype.getItem = function(key) {
                    var ok = obfuscateKey(key);
                    var val = origGetItem.call(this, ok);
                    if (val === null && ok !== key) {
                      var fallback = origGetItem.call(this, key);
                      if (fallback !== null) return fallback;
                    }
                    return deobfuscateValue(val);
                  };

                  var origSetItem = Storage.prototype.setItem;
                  Storage.prototype.setItem = function(key, value) {
                    var ok = obfuscateKey(key);
                    var ov = obfuscateValue(value);
                    origSetItem.call(this, ok, ov);
                  };

                  var origRemoveItem = Storage.prototype.removeItem;
                  Storage.prototype.removeItem = function(key) {
                    var ok = obfuscateKey(key);
                    origRemoveItem.call(this, ok);
                    if (ok !== key) {
                      origRemoveItem.call(this, key);
                    }
                  };

                  var origKey = Storage.prototype.key;
                  Storage.prototype.key = function(index) {
                    var ok = origKey.call(this, index);
                    return deobfuscateKey(ok);
                  };

                  // Clean up and migrate old plaintext keys so they are deleted from DevTools
                  var oldKeys = [
                    'zupwell-admin',
                    'zupwell-store',
                    'zupwell-settings-cache',
                    'zupwell_chat_session',
                    'ally-supports-cache',
                    'rzp_checkout_anon_id',
                    'rzp_device_id',
                    'rzp_stored_checkout_id',
                    'zupwell-settings-bust',
                    'auth_token',
                    'token'
                  ];
                  [window.localStorage, window.sessionStorage].forEach(function(store) {
                    if (!store) return;
                    for (var i = 0; i < oldKeys.length; i++) {
                      var oldK = oldKeys[i];
                      try {
                        var oldV = origGetItem.call(store, oldK);
                        if (oldV !== null) {
                          var newK = obfuscateKey(oldK);
                          var newV = obfuscateValue(oldV);
                          origSetItem.call(store, newK, newV);
                          origRemoveItem.call(store, oldK);
                        }
                      } catch (e) {}
                    }
                  });
                } catch (err) {
                  console.error("Storage obfuscation error:", err);
                }
              })();
            `
          }}
        />
      </head>
      <body>
        <AuthSync />
        <ServerWakeup />
        <WhatsAppButton />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0C1E39",
              color: "#FFFFFF",
              border: "1.5px solid #0C1E39",
              borderRadius: "10px",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
            },
            success: { iconTheme: { primary: "var(--or)", secondary: "#FFFFFF" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#FFFFFF" } },
          }}
        />
      </body>
    </html>
  );
} 
