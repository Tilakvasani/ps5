import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zupwell.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/",
        "/account",
        "/account/",
        "/checkout",
        "/checkout/",
        "/order/",
        "/cart",
        "/login",
        "/register",
        "/track-order",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
