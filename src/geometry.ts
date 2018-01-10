import polygonOverlap from "polygon-overlap";

export interface IPoint {
  x: number;
  y: number;
}

export interface ITransform {
  cssTransform: string;
  rotate: number;
  scale: number;
  translateX: number;
  translateY: number;
  matrix: string;
  points: IPoint[];
}

export const doPolygonsOverlap = (polygon1: IPoint[], polygon2: IPoint[]) =>
  polygonOverlap(
    polygon1.map(({ x, y }) => [x, y]),
    polygon2.map(({ x, y }) => [x, y])
  );

export const polygonArea = (points: IPoint[]) => {
  const l = points.length;
  let det = 0;

  if (points[0] !== points[points.length - 1]) {
    points = points.concat(points[0]);
  }

  for (let i = 0; i < l; i++) {
    det += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x;
  }

  return Math.abs(det) / 2;
};

export const isPolygonWithinRectangle = (
  polygon: IPoint[],
  rectangle: IPoint[]
) => {
  for (const { x, y } of polygon) {
    if (x < rectangle[0].x || x > rectangle[1].x) {
      return false;
    }
    if (y < rectangle[0].y || y > rectangle[1].y) {
      return false;
    }
  }
  return true;
};

export const verifyPack = (
  transformPolygons: ITransform[],
  rectangle: IPoint[]
) => {
  const rectangleArea = polygonArea([
    rectangle[0],
    { x: rectangle[1].x, y: 0 },
    rectangle[1],
    { x: 0, y: rectangle[1].y }
  ]);
  /*
  console.log({
    utilization:
      Math.round(
        (1 -
          transformPolygons.reduce(
            (memo, { points }) => memo - polygonArea(points),
            rectangleArea
          ) /
            rectangleArea) *
          100
      ) + "%"
  });
*/
  const polygonsLength = transformPolygons.length;
  return (
    transformPolygons.every(({ points }) =>
      isPolygonWithinRectangle(points, rectangle)
    ) &&
    !(
      transformPolygons.length > 1 &&
      transformPolygons.some((transformPolygon, index) =>
        doPolygonsOverlap(
          transformPolygons[index].points,
          transformPolygons[(index + 1) % polygonsLength].points
        )
      )
    )
  );
};
