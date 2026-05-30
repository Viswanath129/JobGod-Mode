## 2026-05-30 - Local JSON Store Uniqueness Checks
**Learning:** Relational data operations and duplicate uniqueness checks on the local store fallbacks (like `sameJobIdentity` over `store.jobs`) default to O(n²) loop-within-a-loop patterns, causing performance bottlenecks on the main thread during batch adds.
**Action:** Use Sets/Maps to build O(1) indexes dynamically during batch operations, preventing both O(n²) database lookups and internal duplicates within the batch.
