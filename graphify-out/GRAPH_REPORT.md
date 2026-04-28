# Graph Report - ps5  (2026-04-28)

## Corpus Check
- 62 files · ~33,666 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 145 nodes · 99 edges · 9 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `verifyAccess()` - 4 edges
2. `fetch()` - 3 edges
3. `fetch()` - 3 edges
4. `fetch()` - 3 edges
5. `update()` - 3 edges
6. `fix()` - 2 edges
7. `authUser()` - 2 edges
8. `authAdmin()` - 2 edges
9. `optionalAuth()` - 2 edges
10. `main()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `fix()` --calls--> `update()`  [INFERRED]
  backend\fix-gst-rates.js → frontend\src\components\admin\ProductForm.tsx
- `authUser()` --calls--> `verifyAccess()`  [INFERRED]
  backend\src\middleware\auth.js → backend\src\utils\jwt.js
- `authAdmin()` --calls--> `verifyAccess()`  [INFERRED]
  backend\src\middleware\auth.js → backend\src\utils\jwt.js
- `optionalAuth()` --calls--> `verifyAccess()`  [INFERRED]
  backend\src\middleware\auth.js → backend\src\utils\jwt.js
- `main()` --calls--> `update()`  [INFERRED]
  backend\src\utils\seed.js → frontend\src\components\admin\ProductForm.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.28
Nodes (4): authAdmin(), authUser(), optionalAuth(), verifyAccess()

### Community 1 - "Community 1"
Cohesion: 0.25
Nodes (3): update(), fix(), main()

### Community 2 - "Community 2"
Cohesion: 0.38
Nodes (3): fetch(), handleDelete(), handleSave()

### Community 3 - "Community 3"
Cohesion: 0.47
Nodes (3): fetch(), handleDelete(), handleSave()

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (2): fetchProducts(), handleDelete()

### Community 10 - "Community 10"
Cohesion: 0.83
Nodes (3): approve(), del(), fetch()

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (2): handlePlaceOrder(), loadRazorpay()

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): fetchInventory(), handleMovement()

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (2): cancel(), fetch()

## Knowledge Gaps
- **Thin community `Community 9`** (4 nodes): `page.tsx`, `fetchProducts()`, `handleDelete()`, `toggleActive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (4 nodes): `handlePlaceOrder()`, `handleSaveAddress()`, `loadRazorpay()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (3 nodes): `page.tsx`, `fetchInventory()`, `handleMovement()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (3 nodes): `page.tsx`, `cancel()`, `fetch()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 3 inferred relationships involving `verifyAccess()` (e.g. with `authUser()` and `authAdmin()`) actually correct?**
  _`verifyAccess()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `update()` (e.g. with `fix()` and `main()`) actually correct?**
  _`update()` has 2 INFERRED edges - model-reasoned connections that need verification._