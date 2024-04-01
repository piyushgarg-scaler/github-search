import { githubAPIInstance } from "@/api";
import { GetSearchRepoResponse, RepoItem } from "@/types/repository";
import { useEffect, useRef, useState } from "react";

interface Options {
  page: number;
  topPage: number;
  callback?: (params: any) => void;
}

export const DATA_OFFSET = 75;
export const PER_PAGE_DATA = 25;

export const useGithubSearch = (q?: string, options?: Options) => {
  const [items, setItems] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [startOffset, setStartOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState<number>();
  const [error, setError] = useState(false);

  const queryRef = useRef<string | null>();
  const topPageRef = useRef<number>(0);

  const reInitializeStates = () => {
    if(items.length){
      setItems([]);
    }
    setHasMore(false);
    setStartOffset(0);
    setTotalResults(undefined);
  }

  useEffect(() => {
    (async () => {
      if (q && q.trim()) {
        if(queryRef.current !== q && options?.page !== 1){
          return { items, isLoading: false, hasMore, totalResults, error };
        }

        let isScrollUp = false;
        if(topPageRef.current < (options?.topPage as number)){
          isScrollUp = true;
        }

        let url = `/search/repositories?q=${q}&page=${options?.page}&per_page=${PER_PAGE_DATA}`;
        if(isScrollUp){
          url = `/search/repositories?q=${q}&page=${startOffset}&per_page=${PER_PAGE_DATA}`
        }
        

        setLoading(true);
        try {
          const { data } = await githubAPIInstance.get<GetSearchRepoResponse>(url);

          if(isScrollUp && startOffset > 0){
            
            setItems((prev) => {
              let dataItems = [...prev];
              dataItems.splice(DATA_OFFSET-(PER_PAGE_DATA), DATA_OFFSET);
              return [...data.items, ...dataItems];
            });

            topPageRef.current = options?.topPage as number;
            setStartOffset((prev) => prev - 1);

          } else {
            if (data && data.incomplete_results) {
              setHasMore(true)
            } else {
              setHasMore(false)
            };

            if (data && data.total_count){
              setTotalResults(data.total_count)
            };

            if(options?.page && options?.page*PER_PAGE_DATA > DATA_OFFSET){
              setStartOffset((prev) => prev + 1);
            }
          
            if(queryRef.current !== q){
              setItems(data.items);
            } else if (data && data.items) {
              setItems((prev) => {
                let dataItems = [...prev];
                if(options?.page && options?.page*PER_PAGE_DATA > DATA_OFFSET){
                  dataItems.splice(0, PER_PAGE_DATA);
                }
                return [...dataItems, ...data.items]
              });
            }
          }
    
        } catch (err) {
          setError(true);
          console.log("Error", err);
        } finally {
          setLoading(false);
          queryRef.current = q?.trim() || null;
        }
      } else {
        reInitializeStates();
        queryRef.current = null;
      }
    })();
  }, [q, options?.page, options?.topPage]);

  return { items, isLoading: loading, hasMore, totalResults, error, startOffset };
};
