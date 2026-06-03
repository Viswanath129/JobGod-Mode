## 2024-06-03 - Local JSON Store Uniqueness Checks
**Learning:** The application uses a local JSON file (`data/store.json`) as a fallback database. When performing batch operations like `addJobs`, relying on standard array lookups for duplication checks created an O(n²) performance bottleneck on the main thread.
**Action:** Always utilize O(1) `Set` or `Map` structures to validate duplicates dynamically during batch operations. Update these structures during loop iterations to prevent duplicates within the batch itself.
