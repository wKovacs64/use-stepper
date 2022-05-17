import { countDecimals, sum } from '../decimals';

describe('decimals', () => {
  it('should sum two numbers with any number of decimals', () => {
    expect(sum(0.1, 0.2)).toBe(0.3);
    expect(sum(1, 0.02)).toBe(1.02);
    expect(sum(NaN, 0.02)).toBe(0.02);
    expect(sum(0.02, NaN)).toBe(0.02);
  });

  it('count the number of decimals', () => {
    expect(countDecimals(0.0001232)).toBe(7);
    expect(countDecimals('0.000420')).toBe(6);
    expect(countDecimals('5e-6')).toBe(6);
  });
});
