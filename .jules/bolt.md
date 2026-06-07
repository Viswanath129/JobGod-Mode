## 2026-06-07 - Optimize addJobs uniqueness checks

**Learning:** Array-based nested loops (using `.some()` inside a `for` loop) for uniqueness checking create a significant O(N^2) bottleneck for the local JSON data store when processing bulk job insertions, which can block the main thread.

**Action:** Replaced the array scan with dynamically updated `Set` data structures for `externalId`, `url`, and fingerprint properties. This converts the complexity to O(N + M) providing O(1) lookups and ensuring duplicates within the batch itself are also prevented.
