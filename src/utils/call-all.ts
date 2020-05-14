type CallbackFn = (...args: Array<any>) => void;

export function callAll(...fns: Array<CallbackFn | undefined>): CallbackFn {
  const callAllCallbackFnsWithOriginalArgs: CallbackFn = (...args) => {
    fns.forEach((fn) => typeof fn === 'function' && fn(...args));
  };
  return callAllCallbackFnsWithOriginalArgs;
}
