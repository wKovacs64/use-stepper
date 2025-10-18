import * as React from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const [previousValue, setPreviousValue] = React.useState<T | undefined>(undefined);
  const [currentValue, setCurrentValue] = React.useState<T>(value);

  React.useEffect(() => {
    if (currentValue !== value) {
      setPreviousValue(currentValue);
      setCurrentValue(value);
    }
  }, [value, currentValue]);

  return previousValue;
}
