## 2024-05-10 - O(1) Map Lookups for Store Hydration
**Learning:** Hydrating related entities in the `store.json` fallback database (such as mapping scores to jobs or jobs/resumes to applications) was using nested `.find` calls inside `.map` loops, creating an O(n²) bottleneck when local data grows large.
**Action:** When working with related collections in the local JSON store architecture, always proactively construct `Map` objects (O(1) lookups) before iterating to avoid exponential performance degradation on large user datasets.
