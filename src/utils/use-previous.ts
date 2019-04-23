import React from 'react';

function usePrevious<T>(value: T): T | undefined {
  const previousValue = React.useRef<T>();
  React.useEffect(() => {
    previousValue.current = value;
  }, [value]);
  return previousValue.current;
}

export default usePrevious;
