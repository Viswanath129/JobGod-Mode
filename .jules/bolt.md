## 2024-05-12 - Relational Data Lookup Bottleneck
**Learning:** In the local JSON store (`src/lib/store.ts`), using `Array.find()` inside `Array.map()` to join relational data (e.g. mapping scores to jobs) creates an O(n²) bottleneck.
**Action:** Always map relational data to a `Map` or hash object before iterating, resulting in an O(n) operation with O(1) lookups.
