const callAll = (
  ...fns: Array<((...args: Array<any>) => unknown) | undefined>
): ((...args: Array<any>) => void) => (...args: Array<any>) =>
  fns.forEach(fn => fn && fn(...args));

export default callAll;
