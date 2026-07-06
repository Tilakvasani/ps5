/**
 * Helpers to keep the `user-token` cookie in sync with the Zustand token.
 * The Next.js middleware reads this cookie to guard /checkout, /account, /order.
 * The cookie must be set client-side immediately after login / OAuth callback
 * and cleared on logout — it does NOT replace the token in Zustand/localStorage.
 */

const COOKIE_NAME = "user-token";
// 7 days — same expected lifetime as the JWT
const MAX_AGE = 60 * 60 * 24 * 7;

export function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
