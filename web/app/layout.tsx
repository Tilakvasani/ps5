import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glowy Skin | 3D Commerce",
  description: "Interactive skincare product website starter"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
