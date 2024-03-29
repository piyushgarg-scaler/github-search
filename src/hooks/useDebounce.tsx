import { useEffect, useState } from "react";

export interface DebounceOptions {
  timeout?: number;
}

export const useDebounce = <T,>(value: T, options?: DebounceOptions) => {
  const [delayedValue, setDelayedValue] = useState<T>();

  useEffect(() => {
    const timer = setTimeout(
      () => setDelayedValue(value),
      options?.timeout ?? 500
    );
    return () => {
      clearTimeout(timer);
    };
  }, [options?.timeout, value]);

  return delayedValue;
};
