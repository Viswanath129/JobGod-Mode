## 2026-04-30 - O(N*M) Array.prototype.map in React renders
**Learning:** Found an anti-pattern in `src/app/dashboard/jobs/page.tsx` where mapping an array inside a filter loop causes an O(N*M) time complexity and massive string allocations on every React render.
**Action:** Extract expensive mappings outside loops, use `Set` for O(1) lookups, and wrap derived calculations in `useMemo` to prevent calculation on re-renders.
