import { callAll } from '../call-all';

describe('callAll', () => {
  it('calls all functions passed in with the same arguments', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const args = ['foo', 'bar', 42];

    callAll(fn1, fn2)(...args);

    expect(fn1).toHaveBeenCalledWith(...args);
    expect(fn2).toHaveBeenCalledWith(...args);
  });
});
