import type { MetadataRoute } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zupwell.com";

// Static, always-present routes. Keep in sync with src/app when you add
// new top-level pages (checkout/account/admin are intentionally excluded —
// see robots.ts, they shouldn't be indexed).
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "",                 priority: 1.0, changeFrequency: "daily" },
  { path: "/products",        priority: 0.9, changeFrequency: "daily" },
  { path: "/about",           priority: 0.6, changeFrequency: "monthly" },
  { path: "/science",         priority: 0.6, changeFrequency: "monthly" },
  { path: "/certifications",  priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact",         priority: 0.5, changeFrequency: "monthly" },
  { path: "/faqs",            priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms-of-service",priority: 0.3, changeFrequency: "yearly" },
];

interface ApiProduct { slug: string; updatedAt?: string }
interface ApiCategory { slug: string }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Pull in real products + categories so new items show up automatically —
  // if the API isn't reachable at build time we fall back to the static
  // routes above rather than failing the whole build.
  try {
    const res = await fetch(`${API_URL}/api/products?perPage=1000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const products: ApiProduct[] = data.products || [];
      for (const p of products) {
        entries.push({
          url: `${SITE_URL}/products/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // API unreachable at build time — ship the static routes only.
  }

  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const categories: ApiCategory[] = await res.json();
      for (const c of categories) {
        entries.push({
          url: `${SITE_URL}/products?category=${c.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  } catch {
    // API unreachable at build time — ship the static routes only.
  }

  return entries;
}
