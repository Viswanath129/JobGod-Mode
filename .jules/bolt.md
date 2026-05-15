## 2025-02-12 - Duplicate checking overhead in flat file stores
**Learning:** Checking for duplicates using a nested loop (`Array.some` against a collection where checking involves computing complex string fingerprints) leads to `O(N*M)` complexity and can freeze the thread when inserting new batches of jobs.
**Action:** Always prefer `Set` or `Map`-based lookups (`O(N+M)`) for uniqueness checks over collections, especially when operating on the main thread in a Node/Next.js environment handling local store arrays.
