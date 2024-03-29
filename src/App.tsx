import { Input } from "@/components/ui/input";
import "./App.css";
import { useEffect, useRef, useState } from "react";

import { useDebounce } from "./hooks/useDebounce";
import { useGithubSearch } from "./hooks/useGithubSearch";

/*
Challenges:
1. User should not scroll to the very end to fetch result
Sol - If I am almost at the end, keep the next results ready

2. What is there is an Error?
Solution - Can you first disable the Intersection Observer, Show
the user that something went wrong UI

3. What if user keeps on scrolling?
Sol - At some point you can have 1_00_000 items in array which
is not memory efficent.

4. Reset States when search query changes

5. Improve the list of repos by creating a custom noice component

6. Improve the loading style

7. Create a generic hook for Intersection Observer

⭐️ Bonus: Can you implement type a head based on the results that you currently have in seach results
Example: Autocomplete
 */

function App() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const delayedSearch = useDebounce(search);

  const observerTarget = useRef(null);

  const { items, isLoading } = useGithubSearch(delayedSearch, { page });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (items.length !== 0) setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);

    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget, items]);

  return (
    <div className="w-[100vw] h-[100vh] flex items-center justify-center">
      <div>
        <div>
          <Input
            disabled={isLoading}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search someting.."
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto mt-5">
          <ul>
            {items.map((item) => (
              <li key={`${item.node_id}`}>{item.full_name}</li>
            ))}
            <div ref={observerTarget} />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
