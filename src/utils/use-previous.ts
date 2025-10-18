import * as React from 'react';

export function usePrevious<T>(value: T): T | undefined {
  const [[previousValue, currentValue], setValues] = React.useState<[T | undefined, T]>([
    undefined,
    value,
  ]);

  if (currentValue !== value) {
    setValues([currentValue, value]);
  }

  return previousValue;
}
