import "./globals.css";
import type { Metadata } from "next";
import { Toast } from "@/components/Toast";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "zupwell | Premium 3D Molecular Skincare",
  description:
    "Experience the future of skin nutrition with zupwell's advanced 3D molecular extraction technology. Premium skincare products crafted with precision.",
  keywords: ["skincare", "3D molecular", "wellness", "zupwell", "premium"],
  authors: [{ name: "zupwell" }],
  openGraph: {
    title: "zupwell | Premium 3D Molecular Skincare",
    description:
      "Experience the future of skin nutrition with zupwell's advanced 3D molecular extraction technology.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width" as const,
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScrollProvider>
          {children}
          <Toast />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

