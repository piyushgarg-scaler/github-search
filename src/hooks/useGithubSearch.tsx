import { githubAPIInstance } from "@/api";
import { GetSearchRepoResponse, RepoItem } from "@/types/repository";
import { useEffect, useRef, useState } from "react";

interface Options {
  page: number;
}

export const useGithubSearch = (q?: string, options?: Options) => {
  const [items, setItems] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState<number>();
  const [error, setError] = useState(false);
  const queryRef = useRef<string | null>();

  const revertStates = () => {
    if(items.length){
      setItems([]);
    }
    setHasMore(false);
    setTotalResults(undefined);
  }

  useEffect(() => {
    (async () => {
      if (q && q.trim()) {
        setLoading(true);
        try {
          const { data } = await githubAPIInstance.get<GetSearchRepoResponse>(
            `/search/repositories?q=${q}&page=${options?.page}&per_page=25`
          );
          if (data && data.incomplete_results) setHasMore(true);
          else setHasMore(false);

          if (data && data.total_count) setTotalResults(data.total_count);
          
          if(queryRef.current !== q){
            setItems(data.items);
          } else if (data && data.items) {
            setItems((prev) => [...prev, ...data.items]);
          }
    
        } catch (err) {
          setError(true);
          console.log("Error", err);
        } finally {
          setLoading(false);
          queryRef.current = q?.trim() || null;
        }
      } else {
        revertStates();
        queryRef.current = null;
      }
    })();
  }, [q, options?.page]);

  return { items, isLoading: loading, hasMore, totalResults, error };
};
