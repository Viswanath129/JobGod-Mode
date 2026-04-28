## 2024-05-15 - React Render Optimization
**Learning:** Found an O(N*M) loop nested within a .filter() array where a small map over selected items string operations was repeatedly executed for every job item.
**Action:** Next time, search for arrays mappings and operations that don't depend on the current iteration value and hoist them outside of the filter/map callback.
