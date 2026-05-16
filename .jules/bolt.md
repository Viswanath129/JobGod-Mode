## 2024-05-16 - O(N²) Local Store Unique Uniqueness Bottleneck
**Learning:** Local JSON file as database fallback strategy risks major O(N²) unoptimized search patterns. When inserting bulk jobs or items into a large store array, using `Array.prototype.some` or `find` on the main thread blocks operations.
**Action:** Always utilize `Map` or `Set` objects to index existing entries on keys (like IDs, URLs or Fingerprints) before filtering or searching, keeping uniqueness checks at O(1) inside bulk insertion loops (O(N) total).
