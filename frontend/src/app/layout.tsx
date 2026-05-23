import type { Metadata } from "next";
import "./globals.css";
import ZupwellChat from "@/components/ZupwellChat";
import WhatsAppButton from "@/components/storefront/WhatsAppButton";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

const AuthSync = dynamic(() => import("@/components/AuthSync"), { ssr: false });

// Keep Render backends alive — ping every 14 min to prevent sleep
if (typeof window !== "undefined") {
  const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "https://whatsappchatbot-jfki.onrender.com";
  const API_URL  = process.env.NEXT_PUBLIC_API_URL     || "https://ps5-ufm2.onrender.com";
  setInterval(() => {
    fetch(CHAT_URL + "/").catch(() => {});
    fetch(API_URL  + "/health").catch(() => {});
  }, 14 * 60 * 1000);
}

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
      <body>
        <AuthSync />
        <ZupwellChat />
        <WhatsAppButton />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#002A30",
              border: "1px solid #E8E2D9",
              
              borderRadius: "12px",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#48C062", secondary: "#FFFFFF" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#FFFFFF" } },
          }}
        />
      </body>
    </html>
  );
} 
