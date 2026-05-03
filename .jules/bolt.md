## 2024-05-03 - [Optimizing relational data lookups in local store fallback]
**Learning:** The application architecture uses a local JSON file (`data/store.json`) as a database fallback. Performing relational joins using nested arrays (`Array.prototype.map` containing `Array.prototype.find`) causes hidden O(n²) scaling issues, significantly degrading performance when dataset size grows.
**Action:** Always construct Hash Maps (O(1) lookups) for related items before mapping over the primary collection when operating on local store arrays.
