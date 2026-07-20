import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServerWakeup from "@/components/ServerWakeup";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

const AuthSync = dynamic(() => import("@/components/AuthSync"), { ssr: false });

// next/font self-hosts Inter at build time — no request to Google Fonts at
// runtime, no render-blocking @import, and no font-swap layout flicker.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});



export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zupwell.com"),
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
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google Tag (gtag.js) and Consent Mode v2 Initialization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}

              // Set default consent state to granted by default (implied consent)
              gtag('consent', 'default', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted',
                'analytics_storage': 'granted',
                'wait_for_update': 500
              });
            `
          }}
        />
        {/* Load Google Tag script */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2E4EEGNE46"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              gtag('js', new Date());
              gtag('config', 'G-2E4EEGNE46');
            `
          }}
        />
      </head>
      <body>
        <AuthSync />
        <ServerWakeup />
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
