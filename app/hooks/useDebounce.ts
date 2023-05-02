import { useEffect, useState } from "react";

/**
 * This React hook helps to limit that the component is re-rendered too many times.
 *
 * Docs - https://usehooks-ts.com/react-hook/use-debounce
 */
export default function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
