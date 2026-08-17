import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/storefront/WhatsAppButton";
import ServerWakeup from "@/components/ServerWakeup";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import Script from "next/script";

const AuthSync = dynamic(() => import("@/components/AuthSync"), { ssr: false });

const inter = Inter({
  subsets : ["latin"],
  weight  : ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display : "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zupwell.com"),
  icons: {
    icon : [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
  title: {
    default : "Zupwell — Premium Health & Wellness Supplements",
    template: "%s | Zupwell",
  },
  description: "Zupwell offers science-backed electrolyte tablets, vitamins, protein, and wellness supplements. Sugar-free, delicious, and fast-absorbing. Order online with free delivery across India.",
  keywords: ["health supplements", "electrolyte tablets", "effervescent tablets", "vitamins India", "immunity booster", "protein supplements", "wellness products", "Zupwell", "Ahmedabad health store", "sugar free supplements"],
  authors  : [{ name: "Zupwell", url: "https://zupwell.com" }],
  creator  : "Zupwell",
  publisher: "Zupwell",
  robots   : { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type       : "website",
    locale     : "en_IN",
    siteName   : "Zupwell",
    title      : "Zupwell — Premium Health & Wellness Supplements",
    description: "Science-backed electrolytes, vitamins, protein & wellness supplements. Sugar-free, delicious and effective. Fast delivery across India.",
    images     : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Zupwell Health Supplements" }],
  },
  twitter: {
    card       : "summary_large_image",
    title      : "Zupwell — Premium Health & Wellness Supplements",
    description: "Science-backed electrolytes, vitamins & wellness supplements. Sugar-free and delicious.",
    images     : ["/og-image.jpg"],
  },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "" },
  alternates  : { canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://ps5-hhvf.vercel.app" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google Tag Manager – Consent Mode v2 */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'granted', 'ad_user_data': 'granted',
            'ad_personalization': 'granted', 'analytics_storage': 'granted',
            'wait_for_update': 500
          });
        `}} />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2E4EEGNE46" />
        <script dangerouslySetInnerHTML={{ __html: `gtag('js', new Date()); gtag('config', 'G-2E4EEGNE46');` }} />

        {/* Shiprocket HeadlessCheckout CSS */}
        <link rel="stylesheet" href="https://checkout-ui.shiprocket.com/assets/styles/shopify.css" />
      </head>
      <body>
        {/* Shiprocket HeadlessCheckout JS — exposes window.HeadlessCheckout */}
        <Script
          src="https://checkout-ui.shiprocket.com/assets/js/channels/login.js"
          strategy="beforeInteractive"
        />

        <AuthSync />
        <ServerWakeup />
        <WhatsAppButton />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 1800,
            style: {
              background  : "#0C1E39",
              color       : "#FFFFFF",
              border      : "1.5px solid #0C1E39",
              borderRadius: "10px",
              fontFamily  : "Inter, sans-serif",
              fontSize    : "13px",
            },
            success: { iconTheme: { primary: "var(--or)", secondary: "#FFFFFF" }, duration: 1500 },
            error  : { iconTheme: { primary: "#ef4444", secondary: "#FFFFFF" }, duration: 2200 },
          }}
        />
      </body>
    </html>
  );
}