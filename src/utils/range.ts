export function range(start: number, end: number) {
  const arr: number[] = [];

  for (let i = 0; i < end - start + 1; i++) {
    arr.push(i + start);
  }

  return arr;
}