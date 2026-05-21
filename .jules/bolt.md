## 2026-05-21 - Optimize O(n²) duplicate check in local store
**Learning:** Checking duplicates using `Array.some` against the entire dataset for every new item creates an O(n²) bottleneck, especially since `sameJobIdentity` generates string fingerprints repeatedly.
**Action:** Always use `Set` structures to build lookup tables for unique keys (like external ID, URL, or fingerprint) before processing batches, and update these sets dynamically to ensure O(1) checks and prevent intra-batch duplicates.
