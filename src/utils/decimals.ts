export function countDecimals(value: string | number) {
  const text = value.toString();

  // verify if number 0.000005 is represented as "5e-6"
  if (text.includes('e-')) {
    const [, trail] = text.split('e-');
    const deg = Number.parseInt(trail, 10);
    return deg;
  }

  // count decimals for number in representation like "0.123456"
  return text.split('.')[1]?.length ?? 0;
}

// Sum two numbers with any number of decimals
export function sum(a: number, b: number) {
  if (Number.isNaN(a)) {
    return b;
  }
  if (Number.isNaN(b)) {
    return a;
  }

  const decimalsA = countDecimals(a);
  const decimalsB = countDecimals(b);
  const decimals = Math.max(decimalsA, decimalsB);
  const alpha = 10 ** decimals;

  return (a * alpha + b * alpha) / alpha;
}
