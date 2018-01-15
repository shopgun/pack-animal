import { Matrix } from "./vendor/matrix";
import polygonOverlap from "./vendor/polygon-overlap";

export interface IPoint {
  x: number;
  y: number;
}

export interface ITransform {
  cssText: string;
  rotate: number;
  scale: number;
  translateX: number;
  translateY: number;
  matrix: Matrix;
  points: IPoint[];
  svgTransform: string;
}

export const rotateMatrixAroundPoint = (
  point: IPoint,
  degrees: number,
  matrix = new Matrix()
) => {
  const rotatedMatrix = matrix.clone();
  const { x, y } = point;
  rotatedMatrix.multiply(new Matrix().translate(x, y));
  rotatedMatrix.multiply(new Matrix().rotateDeg(degrees));
  rotatedMatrix.multiply(new Matrix().translate(-x, -y));
  return rotatedMatrix;
};

export const doPolygonsOverlap = (polygon1: IPoint[], polygon2: IPoint[]) =>
  polygonOverlap(
    polygon1.map(({ x, y }) => [x, y]),
    polygon2.map(({ x, y }) => [x, y])
  );

export const polygonArea = (points: IPoint[]) => {
  const l = points.length;
  let det = 0;

  points = points.concat(points[0]);

  for (let i = 0; i < l; i++) {
    det += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x;
  }

  return Math.abs(det) / 2;
};

export const polygonBounds = (points: IPoint[]): IPoint[] => {
  const left = Math.min(...points.map(point => point.x));
  const top = Math.min(...points.map(point => point.y));
  const right = Math.max(...points.map(point => point.x));
  const bottom = Math.max(...points.map(point => point.y));
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
};

export const isPolygonWithinRectangle = (
  polygon: IPoint[],
  rectangle: IPoint[]
) => {
  if (!polygon.length) {
    throw new Error("Checking a pointless polygon is pointless.");
  }
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

export const verifyPack = (polygons: IPoint[][], rectangle: IPoint[]) => {
  /*
  const rectangleArea = polygonArea([
    rectangle[0],
    { x: rectangle[1].x, y: 0 },
    rectangle[1],
    { x: 0, y: rectangle[1].y }
  ]);
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
  return (
    polygons.every(polygon => isPolygonWithinRectangle(polygon, rectangle)) &&
    !(
      polygons.length > 1 &&
      polygons.some((polygon, index) =>
        polygons
          .filter((value, arrIndex) => index !== arrIndex)
          .some(otherPolygon => doPolygonsOverlap(polygon, otherPolygon))
      )
    )
  );
};
const arrayWithoutElementAtIndex = (arr: any[], index: number) => arr;
