import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Zupwell — B2B/B2C Packaging Materials",
  description: "Premium BOPP Tape, packaging materials and industrial supplies. GST compliant invoicing. Based in Ahmedabad, Gujarat.",
  keywords: "BOPP tape, packaging materials, industrial supplies, Ahmedabad, Gujarat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
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
