## 2024-07-04 - Local JSON Database Bottleneck with Array.some
**Learning:** The application uses a local JSON file for storage as a Supabase fallback. Using `Array.some()` inside a batch processing loop (like `addJobs`) creates a hidden O(n²) main-thread bottleneck, especially as `store.jobs` grows large.
**Action:** Always pre-compute `Set` or `Map` data structures outside the loop for O(1) lookups during insertions, and remember to add new items to the `Set` during the batch loop to prevent duplicates from within the batch itself.
