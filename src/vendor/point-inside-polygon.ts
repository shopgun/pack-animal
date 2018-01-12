export default function(p: number[], poly: number[][]) {
  let c = false;
  const nvert = poly.length;
  let j = nvert - 1;
  for (let i = 0; i < nvert; j = i++) {
    if (
      poly[i][1] > p[1] !== poly[j][1] > p[1] &&
      p[0] <
        (poly[j][0] - poly[i][0]) *
          (p[1] - poly[i][1]) /
          (poly[j][1] - poly[i][1]) +
          poly[i][0]
    ) {
      c = !c;
    }
  }
  return c;
}
