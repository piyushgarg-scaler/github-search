import { Input } from "@/components/ui/input";
import "./App.css";
import { useEffect, useRef, useState } from "react";

import { useDebounce } from "./hooks/useDebounce";
import { useGithubSearch } from "./hooks/useGithubSearch";

function App() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const delayedSearch = useDebounce(search);

  const observerTarget = useRef(null);

  const { items, isLoading, totalResults, hasMore } = useGithubSearch(
    delayedSearch,
    { page }
  );

  console.log("Current Page Number", page);

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
