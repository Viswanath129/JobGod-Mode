## 2024-05-18 - O(n^2) Bottleneck in Local Fallback Database batch inserts
**Learning:** Using `Array.prototype.some` for duplicate checking inside a batch import loop (when treating an array as a local JSON database fallback) creates a hidden O(n^2) bottleneck that can block the main thread significantly.
**Action:** Always pre-compute a `Set` or `Map` to perform O(1) duplicate lookups for batch operations, and ensure the Set/Map is dynamically updated during the loop to catch duplicates *within* the batch itself.
