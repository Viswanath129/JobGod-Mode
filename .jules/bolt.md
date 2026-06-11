## 2024-06-11 - Optimize `addJobs` O(n²) duplicate uniqueness check

**Learning:** Duplicate checks across large batches of objects using array `.some` with complex identity functions (`sameJobIdentity`) inside nested loops (`store.jobs.some`) causes significant O(n²) performance bottlenecks, especially when handling JSON-based storage without database-level uniqueness constraints.

**Action:** Whenever implementing bulk operations (like `addJobs`), use Sets or Maps to precompute existing identities for O(1) lookups, and dynamically update these data structures during the loop to catch duplicates within the new batch itself.
