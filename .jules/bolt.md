## 2024-05-25 - O(1) Duplicate Checks in Local Store
**Learning:** In a local JSON file-backed database, checking for duplicates on insertion using `some` inside a loop leads to an O(N^2) bottleneck. This is a severe problem for batch inserts.
**Action:** Use `Set` structures initialized before batch processing to maintain O(1) duplicate lookups, and dynamically update the sets during iteration to prevent duplicates within the batch itself.
