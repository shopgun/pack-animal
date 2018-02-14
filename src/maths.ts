export const average = (values: number[]) =>
  values.reduce((memo, value) => memo + value, 0) / values.length;

export const standardDeviation = (values: number[]) => {
  const mean = average(values);
  return Math.sqrt(average(values.map(value => (value - mean) ** 2)));
};
