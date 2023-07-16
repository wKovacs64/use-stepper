type CallbackFn = (...args: any[]) => void;

export function callAll(...fns: (CallbackFn | undefined)[]): CallbackFn {
  const callAllCallbackFnsWithOriginalArgs: CallbackFn = (
    ...args: unknown[]
  ) => {
    fns.forEach((fn) => {
      if (typeof fn === 'function') fn(...args);
    });
  };
  return callAllCallbackFnsWithOriginalArgs;
}
