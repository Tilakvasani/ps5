import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title       : "Zupwell - Premium Nutraceuticals",
  description : "Premium health & nutrition products",
  openGraph   : { title: "Zupwell", description: "Premium health & nutrition products" },
};

// ── Shiprocket HeadlessCheckout prod URLs (from official docs) ─────────────────
// UI Script : https://checkout-ui.shiprocket.com/assets/js/channels/login.js
// UI CSS    : https://checkout-ui.shiprocket.com/assets/styles/shopify.css
// These are fixed prod URLs — no env var needed for them.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0C1E39" />

        {/* Shiprocket HeadlessCheckout CSS — must be in <head> */}
        <link
          rel="stylesheet"
          href="https://checkout-ui.shiprocket.com/assets/styles/shopify.css"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/*
          Shiprocket HeadlessCheckout JS SDK
          Exposes window.HeadlessCheckout — used by Navbar to trigger the popup.
          strategy="beforeInteractive" ensures it's ready before any click.
        */}
        <Script
          src="https://checkout-ui.shiprocket.com/assets/js/channels/login.js"
          strategy="beforeInteractive"
        />

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "12px",
              background  : "#0C1E39",
              color       : "#FFFFFF",
              fontSize    : "14px",
              fontWeight  : "600",
            },
          }}
        />

        {children}
      </body>
    </html>
  );
}
