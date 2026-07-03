## 2026-07-03 - Optimize duplicate check in addJobs
**Learning:** Using O(n²) array iteration (`Array.prototype.some`) for duplicate uniqueness checks during batch inserts on the local JSON store acts as a major bottleneck on the main thread when the store grows.
**Action:** Replace `Array.prototype.some` searches with pre-computed O(1) lookups using Javascript `Set`s, dynamically updated during the batch insertion to efficiently prevent duplicates within the batch itself.
