## 2024-11-20 - [O(1) Set Lookups for Batch Deduplication]
**Learning:** Using `Array.some` combined with O(N) linear comparisons over an already O(M) job batch leads to O(N^2) complexity, causing significant thread blockage during batch operations like adding scraped jobs to the store.
**Action:** Always pre-compute O(1) lookup structures like `Set`s or `Map`s outside the loop for batch deduplication. Remember to iteratively add new non-duplicate entries to the `Set` during the batch process to prevent intra-batch duplicates.
