## 2026-05-18 - Local Database JSON Array Performance
**Learning:** The application uses a local JSON file (`data/store.json`) as a database fallback. Using array methods like `.some()` and `.find()` for relational operations and duplicate checking blocks the main thread with O(n²) complexity, especially for operations like `addJobs` scanning batches against all historical entries.
**Action:** Always pre-process local JSON DB array results into `Map` or `Set` instances for O(1) lookups before executing loops or transformations.
