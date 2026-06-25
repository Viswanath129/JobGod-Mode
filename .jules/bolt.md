## 2024-06-25 - Local JSON duplicate check bottleneck
**Learning:** Checking uniqueness with array `some()` logic inside loops when interacting with the fallback local JSON store (e.g. `addJobs`) creates an O(N²) bottleneck on the main thread for bulk inserts.
**Action:** When updating local JSON file structures in batch operations, replace O(n²) loops with O(n) `Set`/`Map` based hashing or fingerprints to maintain fast insertions on main thread, and make sure these lookup maps are dynamically updated inside the loop itself.
