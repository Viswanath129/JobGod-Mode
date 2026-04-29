## 2026-04-29 - [O(N*M) String Manipulations in React Render]
**Learning:** Running array map operations that perform string replacement for filtering inside a filter callback function triggers massive redundant allocations when jobs scale up. In `src/app/dashboard/jobs/page.tsx`, `selectedModes.map(...replace())` was executing once for every job on every single render.
**Action:** Always extract static transformations out of iteration loops, especially inside React render passes. Use `useMemo` to prevent recalculating filtered arrays entirely when dependencies haven't changed.
