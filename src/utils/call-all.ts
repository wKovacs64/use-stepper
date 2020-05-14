type CallbackFn = (...args: Array<any>) => void;

export default function callAll(
  ...fns: Array<CallbackFn | undefined>
): CallbackFn {
  function callAllCallbackFnsWithOriginalArgs(...args: Array<any>) {
    fns.forEach((fn) => fn && fn(...args));
  }
  return callAllCallbackFnsWithOriginalArgs;
}
