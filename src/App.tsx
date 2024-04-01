import { Input } from "@/components/ui/input";
import "./App.css";
import { useEffect, useMemo, useRef, useState } from "react";

import { useDebounce } from "./hooks/useDebounce";
import { DATA_OFFSET, PER_PAGE_DATA, useGithubSearch } from "./hooks/useGithubSearch";
import useObserver from "./hooks/useObserver";

/*
Challenges:

1. User should not scroll to the very end to fetch result
Sol - If I am almost at the end, keep the next results ready ( DONE )

2. What is there is an Error?
Solution - Can you first disable the Intersection Observer, Show
the user that something went wrong UI

3. What if user keeps on scrolling?
Sol - At some point you can have 1_00_000 items in array which
is not memory efficent. ( DONE )

4. Reset States when search query changes ( DONE )

5. Improve the list of repos by creating a custom noice component

6. Improve the loading style

7. Create a generic hook for Intersection Observer ( DONE )

⭐️ Bonus: Can you implement type ahead based on the results that you currently have in seach results
Example: Autocomplete
 */

function App() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [topPage, setTopPage] = useState(0);
  const [divRef, setDivRef] = useState<HTMLElement | null>(null);
  const [topDivRef, setTopDivRef] = useState<HTMLElement | null>(null);
  const dataListRef = useRef<HTMLDivElement>(null);
  const ulEleRef = useRef<HTMLUListElement>(null);

  const delayedSearch = useDebounce(search);

  const scrollUp = (num = 0) => {
    (dataListRef.current as HTMLDivElement).scrollTop = num;
  }

  useEffect(() => {
    scrollUp();
    setPage(1);
  }, [delayedSearch]);

  const { items, isLoading, startOffset } = useGithubSearch(delayedSearch, { page, topPage });
  const { isIntersecting } = useObserver(divRef);
  const { isIntersecting: isTopRefIntersecting } = useObserver(topDivRef);

  const itemsLen = useMemo(() => {
      return items.length;
  }, [items]);

  const checkTopRef = useMemo(() => {
   return { changed: page*PER_PAGE_DATA > DATA_OFFSET}; 
  }, [page]);

  useEffect(() => {
    if(isIntersecting){
      setPage((prev) => prev + 1);
    }
  }, [isIntersecting]);

  useEffect(() => {
    if(isTopRefIntersecting){
      setTopPage((prev) => prev + 1);
      setPage((prev) => prev - 1);

      const offsetHeight = ulEleRef.current?.querySelector('li')?.clientHeight;
      if(offsetHeight !== undefined){
        scrollUp(offsetHeight*PER_PAGE_DATA);
      }
    }
  }, [isTopRefIntersecting]);

  useEffect(() => {
    if(checkTopRef.changed){
      const offsetHeight = ulEleRef.current?.querySelector('li')?.clientHeight;
      if(offsetHeight !== undefined){
        scrollUp(offsetHeight*PER_PAGE_DATA*2);
      }
    }
  }, [checkTopRef]);

  return (
    <div className="w-[100vw] h-[100vh] flex items-center justify-center">
      <div>
        <div>
          <Input
            disabled={isLoading}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search someting.."
          />
        </div>
        <div ref={dataListRef} className="max-h-[300px] overflow-y-auto mt-5">
          <ul ref={ulEleRef}>
            {items.map((item, idx) => {
              if(idx === 5 && checkTopRef.changed && startOffset){
                return(
                  <div key={`${item.node_id}-${idx}`}>
                    <li>{item.full_name}</li>
                    <div ref={(ref) => {setTopDivRef(ref)}} />
                  </div>
                )
              }

              if(idx === itemsLen-4){
                return(
                  <div key={`${item.node_id}-${idx}`}>
                    <li>{item.full_name}</li>
                    <div ref={(ref) => {setDivRef(ref)}} />
                  </div>
                )
              }
              
              return(
              <li key={`${item.node_id}-${idx}`}>{item.full_name}</li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
