## 2024-05-01 - [O(n^2) Bottlenecks in Local JSON Store]
**Learning:** The application uses a local JSON file (`store.json`) as a database fallback. Because it lacks native database indexing, relational "joins" (like attaching scores to jobs or jobs to applications) use `Array.prototype.find()` inside `.map()`, creating hidden O(n²) bottlenecks as the data grows.
**Action:** When working with local store relations, always construct a `Map` first to achieve O(n) lookups and prevent frontend dashboard lag as job/application volume increases.
