## 2024-05-09 - Local Store Relational Operations Bottleneck
**Learning:** Relational operations on the local JSON store (`data/store.json`) were implemented using nested array searches (`.map` with `.find`), resulting in O(n²) performance bottlenecks, particularly in `getJobs` and `getApplications`.
**Action:** Replace `Array.prototype.find()` lookups within `.map()` loops with `Map` structures to achieve O(1) lookups, turning O(n²) operations into O(n).
