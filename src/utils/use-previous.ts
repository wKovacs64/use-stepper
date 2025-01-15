import * as React from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const previousValue = React.useRef<T>(undefined);
  React.useEffect(() => {
    previousValue.current = value;
  }, [value]);
  return previousValue.current;
}
