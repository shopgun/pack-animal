import { Matrix } from "./vendor/matrix";
import polygonOverlap from "./vendor/polygon-overlap";

export interface IPoint {
  x: number;
  y: number;
}

export const rotateMatrixAroundPoint = (point: IPoint, degrees: number, matrix = new Matrix()) => {
  const rotatedMatrix = matrix.clone();
  const { x, y } = point;
  rotatedMatrix.multiply(new Matrix().translate(x, y));
  rotatedMatrix.multiply(new Matrix().rotateDeg(degrees));
  rotatedMatrix.multiply(new Matrix().translate(-x, -y));
  return rotatedMatrix;
};
export const scaleMatrixAroundPoint = (point: IPoint, scale: number, matrix = new Matrix()) => {
  const rotatedMatrix = matrix.clone();
  const { x, y } = point;
  rotatedMatrix.multiply(new Matrix().translate(x, y));
  rotatedMatrix.multiply(new Matrix().scaleU(scale));
  rotatedMatrix.multiply(new Matrix().translate(-x, -y));
  return rotatedMatrix;
};
export const polygonCenter = (points: IPoint[]): IPoint => {
  const Xs = points.map(point => point.x);
  const Ys = points.map(point => point.y);
  const width = Math.max(...Xs) - Math.min(...Xs);
  const height = Math.max(...Ys) - Math.min(...Ys);
  return { x: width / 2, y: height / 2 };
};
export const doPolygonsOverlap = (polygon1: IPoint[], polygon2: IPoint[]) =>
  polygonOverlap(polygon1.map(({ x, y }) => [x, y]), polygon2.map(({ x, y }) => [x, y]));

export const polygonArea = (points: IPoint[]) =>
  Math.abs(
    points.reduce(
      (det, _, i, { length }) =>
        det + (points[i].x * points[(i + 1) % length].y - points[i].y * points[(i + 1) % length].x),
      0
    )
  ) / 2;

export const polygonWidth = (points: IPoint[]) => {
  const xs = points.map(point => point.x);
  return Math.floor(Math.max(...xs) - Math.min(...xs));
};
export const polygonHeight = (points: IPoint[]) => {
  const ys = points.map(point => point.x);
  return Math.floor(Math.max(...ys) - Math.min(...ys));
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

export const polygonsBounds = (polygons: IPoint[][]): IPoint[] =>
  polygonBounds(Array.prototype.concat(...polygons));

export const isPolygonWithinRectangle = (polygon: IPoint[], rectangle: IPoint[]) => {
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

export interface IVerifyPackOptions {
  polygonHitboxScale?: number;
}
export const verifyPack = (
  polygons: IPoint[][],
  rectangle: IPoint[],
  { polygonHitboxScale = 1 }: IVerifyPackOptions = {}
) => {
  const adjustedPolygons =
    polygonHitboxScale !== 1
      ? polygons.map(polygon =>
          scaleMatrixAroundPoint(polygonCenter(polygon), polygonHitboxScale).applyToArray(polygon)
        )
      : polygons;

  return (
    polygons.every(polygon => isPolygonWithinRectangle(polygon, rectangle)) &&
    !(
      adjustedPolygons.length > 1 &&
      adjustedPolygons.some((polygon, index) =>
        adjustedPolygons
          .filter((_, arrIndex) => index !== arrIndex)
          .some(otherPolygon => doPolygonsOverlap(polygon, otherPolygon))
      )
    )
  );
};

export const packUtilization = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][]
) => {
  const rectanglePolygon: IPoint[] = [
    { x: 0, y: 0 },
    { x: rectangleWidth, y: 0 },
    { x: rectangleWidth, y: rectangleHeight },
    { x: 0, y: rectangleHeight }
  ];
  const rectangleArea = polygonArea(rectanglePolygon);
  const utilization =
    1 -
    polygons.reduce((memo, points) => memo - polygonArea(points), rectangleArea) / rectangleArea;
  return utilization;
};

export const radiansToDegrees = (radians: number) => radians * 180 / Math.PI;
