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
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
      </body>
    </html>
  );
}
