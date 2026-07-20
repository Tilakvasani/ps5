/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://ps5-ufm2.onrender.com",
    NEXT_PUBLIC_CHAT_API_URL: process.env.NEXT_PUBLIC_CHAT_API_URL || "https://whatsappchatbot-jfki.onrender.com",
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  },
  async headers() {
    // CSP is scoped to what this app actually loads: Google Tag Manager/
    // Analytics, Razorpay checkout, and Cloudinary-hosted images. If you
    // add a new third-party script later (a new chat widget, a new
    // analytics tool, etc.), its domain needs to be added here or the
    // browser will silently block it.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://res.cloudinary.com https://placehold.co https://i.ibb.co https://www.googletagmanager.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://api.razorpay.com https://lumberjack-cx.razorpay.com " +
        (process.env.NEXT_PUBLIC_API_URL || "https://ps5-ufm2.onrender.com") + " " +
        (process.env.NEXT_PUBLIC_CHAT_API_URL || "https://whatsappchatbot-jfki.onrender.com"),
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

module.exports = nextConfig;