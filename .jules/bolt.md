## 2023-10-27 - [Optimize Batch Job Insertion]
**Learning:** Found an O(N*M) bottleneck in `addJobs` in `src/lib/store.ts` where it iterated over existing jobs for every new job to check for duplicates using `.some()`.
**Action:** Replaced the nested loop `.some()` check with O(1) `Set` lookups. Pre-calculate Sets for existing external IDs, URLs, and fingerprints, and update these Sets dynamically during the batch insertion to prevent duplicates within the batch itself. This reduces time complexity to O(N+M).
