# Website Improvements Implementation TODO

## Phase 1 — Critical Fixes
- [x] 1. Fix `web/app/layout.tsx` syntax error + add SEO + Toast + SmoothScroll
- [x] 2. Implement `web/components/Toast.tsx` with full notification UI
- [x] 3. Create `web/components/MobileMenu.tsx` responsive slide-out menu
- [x] 4. Create `web/app/not-found.tsx` 404 page with ReusableBackground

## Phase 2 — DRY Refactor (Replace Inline Backgrounds)
- [x] 5. Refactor `web/app/login/page.tsx` → use ReusableBackground
- [x] 6. Refactor `web/app/register/page.tsx` → use ReusableBackground
- [x] 7. Refactor `web/app/dashboard/page.tsx` → use ReusableBackground
- [x] 8. Refactor `web/app/checkout/page.tsx` → use ReusableBackground
- [x] 9. Refactor `web/app/page.tsx` → use ReusableBackground

## Phase 3 — Component & Page Enhancements
- [x] 10. Update `web/components/Navbar.tsx` with mobile menu integration
- [x] 11. Update `web/app/dashboard/page.tsx` — add cart item removal
- [x] 12. Update `web/components/ProductShowcase.tsx` — images, filtering, better cards
- [x] 13. Update `web/app/page.tsx` — testimonials, scroll animations
- [x] 14. Update `web/app/globals.css` — reduced-motion, accessibility
- [x] 15. Update `web/lib/api.ts` — add listCategories helper
- [x] 15b. Update `web/app/products/page.tsx` — dynamic import (SSR fix)

## Phase 4 — Verification
- [x] 16. Run `npm run build` in web/ — all pages compile cleanly
- [x] 17. Final review — all 18 TODO_IMPROVEMENTS items complete
