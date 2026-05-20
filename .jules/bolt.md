
## 2024-05-20 - O(N^2) duplicates check optimization in local store
**Learning:** Local JSON file stores acting as a database fallback (e.g. `src/lib/store.ts`) can create massive main thread blocking issues if `Array.some` is used in batch operations like `addJobs`. In a batch of N jobs with M existing jobs, this creates O(N*M) complexity.
**Action:** Replace `Array.some()` iteration with multiple `Set` indexes mapping exact deduplication keys (URLs, external IDs, and fingerprints). Dynamically add items to the Sets while looping the batch to deduplicate items *within* the batch.
