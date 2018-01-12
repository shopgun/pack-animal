import intersect from "./lines-intersect";
import inside from "./point-inside-polygon";

function polygonPointsInside(p0: number[][], p1: number[][]) {
  let i;
  for (i = 0; i < p0.length; i += 1) {
    if (inside(p0[i], p1)) {
      return true;
    }
  }
  for (i = 0; i < p1.length; i += 1) {
    if (inside(p1[i], p0)) {
      return true;
    }
  }
  return false;
}

function polygonEdgesOverlap(p0: number[][], p1: number[][]) {
  for (let i = 0; i < p0.length - 1; i += 1) {
    for (let j = 0; j < p1.length - 1; j += 1) {
      if (
        intersect(
          p0[i][0],
          p0[i][1],
          p0[i + 1][0],
          p0[i + 1][1],
          p1[j][0],
          p1[j][1],
          p1[j + 1][0],
          p1[j + 1][1]
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

export default (p0: number[][], p1: number[][]) =>
  polygonPointsInside(p0, p1) || polygonEdgesOverlap(p0, p1);
