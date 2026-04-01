import { useState, useEffect } from "react";

export function useDebouncedValue<T>(value: T, delayMilliseconds = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMilliseconds);
    return () => clearTimeout(timer);
  }, [value, delayMilliseconds]);

  return debouncedValue;
}
