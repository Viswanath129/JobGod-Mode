## 2024-06-20 - Batch Operations O(N^2) Anti-Pattern
**Learning:** Found a critical bottleneck in `src/lib/store.ts` where `addJobs` compared each new job against all existing jobs using an O(N*M) nested loop via `sameJobIdentity`. This blocks the main thread severely as job volume grows.
**Action:** When performing duplicate checks or relational lookups in the local JSON fallback store, always pre-compute `Set` or `Map` structures to achieve O(1) lookups. Dynamically add to these sets during processing to simultaneously deduplicate items within the incoming batch itself.
