
## 2024-05-24 - O(n²) nested loop duplicate check replaced with O(1) Set lookup
**Learning:** During batch processing in `addJobs`, relying on `store.jobs.some((existing) => sameJobIdentity(existing, j))` created a massive O(n²) performance bottleneck on the main thread for duplicate job checking as the number of stored jobs grew.
**Action:** Always utilize `Set` structures pre-populated in O(n) for membership lookups within iterative data-loading paths, especially when relying on a local JSON file store (no DB index). Adding the newly verified elements to the batch dynamically ensures duplicate tracking *within* the incoming batch without multiple passes.
