/**
 * utils.ts — Shared Utilities
 * ============================
 * Single source of truth for animations, helpers, and UI utilities.
 * Import from here instead of redefining in each file.
 */

// ── Image delivery optimization ───────────────────────────────────────────────

/**
 * cldOptimize — Ensures Cloudinary image URLs use HTTPS.
 * Non-Cloudinary URLs are returned as-is.
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
 *
 * Usage:
 *   <motion.div {...fadeUp(0.2)}>...</motion.div>
 */
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

// ── HTML Sanitizer ────────────────────────────────────────────────────────────

/**
 * sanitizeHtml — Strips dangerous tags/attributes from HTML strings.
 * Used instead of raw dangerouslySetInnerHTML to prevent XSS.
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

  div.querySelectorAll("*").forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    if (!allowedTags.includes(tagName)) {
      el.replaceWith(...Array.from(el.childNodes));
      return;
    }
    // Strip event handlers and dangerous href values
    Array.from(el.attributes).forEach((attr) => {
      if (
        attr.name.startsWith("on") ||
        (attr.name === "href" && (attr.value.startsWith("javascript:") || attr.value.startsWith("data:")))
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return div.innerHTML;
}

// ── Shared Validation & Formatting Helpers ────────────────────────────────────

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Strip non-digits and return last 10 digits of a phone number */
export function cleanPhoneNumber(raw: string): string {
  return (raw || "").replace(/\D/g, "").slice(-10);
}

/** Validate 10-digit Indian mobile number */
export function isValidIndianMobile(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(cleaned) && !/^(\d)\1{9}$/.test(cleaned) && cleaned !== "1234567890";
}

