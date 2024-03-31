import { useEffect, useState } from "react";

interface UseObserverReturnI {
    isIntersecting: boolean;
}

interface UseObserverI {
    ( ref?: HTMLElement | null,
     threshold?: number): UseObserverReturnI
 };

const useObserver: UseObserverI = (ref = null, threshold = 0) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              setIsIntersecting(true);
            }
          },
          { threshold }
        );
    
        if (ref) observer.observe(ref);
    
        return () => {
          if (ref) observer.unobserve(ref);
          setIsIntersecting(false);
        };
      }, [threshold, ref]);

    return { isIntersecting };
}

export default useObserver;
