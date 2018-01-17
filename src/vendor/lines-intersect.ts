const onSeg = (xi: number, yi: number, xj: number, yj: number, xk: number, yk: number) =>
  (xi <= xk || xj <= xk) &&
  (xk <= xi || xk <= xj) &&
  (yi <= yk || yj <= yk) &&
  (yk <= yi || yk <= yj);

const dir = (xi: number, yi: number, xj: number, yj: number, xk: number, yk: number) => {
  const a = (xk - xi) * (yj - yi);
  const b = (xj - xi) * (yk - yi);
  return a < b ? -1 : a > b ? 1 : 0;
};

export default function intersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
) {
  const d1 = dir(x3, y3, x4, y4, x1, y1);
  const d2 = dir(x3, y3, x4, y4, x2, y2);
  const d3 = dir(x1, y1, x2, y2, x3, y3);
  const d4 = dir(x1, y1, x2, y2, x4, y4);
  return (
    (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) ||
    (d1 === 0 && onSeg(x3, y3, x4, y4, x1, y1)) ||
    (d2 === 0 && onSeg(x3, y3, x4, y4, x2, y2)) ||
    (d3 === 0 && onSeg(x1, y1, x2, y2, x3, y3)) ||
    (d4 === 0 && onSeg(x1, y1, x2, y2, x4, y4))
  );
}
