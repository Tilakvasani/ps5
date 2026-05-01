import type { Metadata } from "next";
import "./globals.css";
import ZupwellChat from "@/components/ZupwellChat";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

// ssr: false — AuthSync reads document.cookie and localStorage (browser-only).
// Dynamic import prevents Next.js from trying to run it on the server.
const AuthSync = dynamic(() => import("@/components/AuthSync"), { ssr: false });

// Keep Render backend alive — pings every 14 minutes to prevent sleep
if (typeof window !== "undefined") {
  const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "https://whatsappchatbot-jfki.onrender.com";
  const API_URL  = process.env.NEXT_PUBLIC_API_URL || "https://ps5-ufm2.onrender.com";
  setInterval(() => {
    fetch(CHAT_URL + "/").catch(() => {});
    fetch(API_URL  + "/").catch(() => {});
  }, 14 * 60 * 1000); // every 14 minutes
}

export const metadata: Metadata = {
  title: "Zupwell — Premium Health & Wellness Products",
  description: "Shop premium health supplements, electrolytes, vitamins, and wellness products. Fast delivery across India. GST compliant invoicing.",
  keywords: "health supplements, electrolytes, vitamins, immunity, protein, wellness products, India",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSync />
        <ZupwellChat />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#111827",
              border: "1px solid #D9DEE8",
              boxShadow: "0 4px 16px rgba(11,44,111,0.1)",
              borderRadius: "12px",
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#F47C41", secondary: "#FFFFFF" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#FFFFFF" },
            },
          }}
        />
      </body>
    </html>
  );
}