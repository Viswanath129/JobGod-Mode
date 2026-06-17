## 2024-06-17 - O(1) Optimization of Batch Ingestion Duplicate Checks
**Learning:** During local store updates, especially bulk ones like `addJobs`, checking for existing identities using array traversals `.some` scaling N*M.
**Action:** Replace `Array.prototype.some()` or nested array searches with `Set` lookup dictionaries constructed just prior to batched operations. Maintain these sets synchronously inside the ingestion loop to avoid adding identical items from the batch itself.
