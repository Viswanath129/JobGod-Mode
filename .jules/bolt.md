## 2026-05-04 - Local Store Relational Data Bottlenecks
**Learning:** Relational data operations on the local store fallback (e.g., matching jobs to scores or jobs to resumes) using Array.find inside a map callback leads to O(n²) time complexity. This was causing a significant performance bottleneck when the local JSON file database scales up.
**Action:** When implementing or modifying operations that join relational data from the local store arrays, always pre-compute Map structures for O(1) lookups to reduce the worst-case time complexity to O(n).
