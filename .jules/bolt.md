## 2024-06-21 - Local Store O(n^2) Duplicate Check Bottleneck
**Learning:** `addJobs` was using `store.jobs.some(sameJobIdentity)` for *each* new job, resulting in an O(n^2) bottleneck that could block the Node main thread on large job syncs since the application relies on an in-memory fallback store (`store.json`).
**Action:** Always pre-compute tracking structures like `Set`s and `Map`s outside loops for data validation, ensuring to also add the items dynamically within the loop so duplicates inside the incoming batch itself are caught efficiently.
