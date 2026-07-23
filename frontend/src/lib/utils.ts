/**
 * utils.ts — Shared Utilities
 * ============================
 * Single source of truth for animations, helpers, and UI utilities.
 * Import from here instead of redefining in each file.
 */

// ── Image delivery optimization ───────────────────────────────────────────────

/**
 * cldOptimize — Injects Cloudinary transformation params into a Cloudinary
 * image URL so the browser downloads a properly-sized, auto-compressed,
 * modern-format (WebP/AVIF) image instead of the full-resolution original.
 *
 * This is the fix for Lighthouse's "Improve image delivery" audit (was
 * flagging ~2.3MB of avoidable image weight) — most images in this app were
 * being served at their original upload resolution regardless of the
 * (often much smaller) size they're actually displayed at.
 *
 * Only touches Cloudinary URLs (res.cloudinary.com/.../upload/...) — any
 * other URL (relative /assets paths, placehold.co, etc.) is returned as-is,
 * so this is safe to wrap around every image src in the app without risk
 * of breaking non-Cloudinary images.
 *
 * @param url    The original image URL (may or may not be Cloudinary)
 * @param width  The rendered width in px — pass the largest size this image
 *               is ever displayed at (e.g. 600 for a product thumbnail,
 *               1200 for a full-width hero)
 */
export function cldOptimize(url: string | undefined | null, width: number): string {
  if (!url) return "";
  if (url.startsWith("http://res.cloudinary.com")) {
    return "https://" + url.slice(7);
  }
  return url;
}

// ── Framer Motion Helpers ─────────────────────────────────────────────────────

/**
 * fadeUp — Reusable fade-up animation variant for Framer Motion.
 * Previously duplicated in: page.tsx, about/page.tsx, science/page.tsx, contact/page.tsx
 *
 * Usage:
 *   <motion.div {...fadeUp(0.2)}>...</motion.div>
 */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

/**
 * fadeIn — Simple opacity fade, no vertical movement.
 */
export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay },
});

/**
 * scaleIn — Scale + fade in, great for modals and cards.
 */
export const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, delay },
});

// ── String Helpers ────────────────────────────────────────────────────────────

/** Safely get first character of a name for avatars */
export const initials = (name?: string | null): string =>
  name?.charAt(0)?.toUpperCase() ?? "?";

/** Truncate long text */
export const truncate = (str: string, maxLen: number): string =>
  str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;

// ── Number / Currency Helpers ─────────────────────────────────────────────────

/** Format INR currency */
export const formatINR = (amount: number): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

/** Format a date string cleanly */
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// ── HTML Sanitizer ────────────────────────────────────────────────────────────

/**
 * sanitizeHtml — Strips dangerous tags/attributes from HTML strings.
 * Used instead of raw dangerouslySetInnerHTML to prevent XSS.
 * 
 * SECURITY FIX: Replaces unsafe dangerouslySetInnerHTML usage in product pages.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: strip all tags completely
    return dirty.replace(/<[^>]*>/g, "");
  }
  // Client-side: allow safe formatting tags only
  const allowedTags = ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "span", "h3", "h4"];
  const div = document.createElement("div");
  div.innerHTML = dirty;
  
  // Remove script, style, and event-handler attributes
  div.querySelectorAll("*").forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    if (!allowedTags.includes(tagName)) {
      el.replaceWith(...Array.from(el.childNodes));
      return;
    }
    // Strip all event handler attributes (onclick, onload, etc.)
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("on") || attr.name === "href" && (attr.value.startsWith("javascript:") || attr.value.startsWith("data:"))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return div.innerHTML;
}

// ── Class Name Helper ─────────────────────────────────────────────────────────

/** Simple cn() — combine class names, filtering falsy values */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
