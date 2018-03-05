import { IPoint, IPolygon, polygonArea, polygonHeight, polygonWidth } from "../geometry";
import { average } from "../maths";
import { getPolygonTransform, ITransform } from "../transform";
import { noop } from "../utilities";
import { Matrix } from "../vendor/matrix";

export const linePack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonList: IPolygon[],
  vertical: boolean = false,
  { debug: dbug = noop, averageArea = 0 } = {}
): ITransform[] => {
  const polygons = polygonList.map(({ points }) => points);
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("linePack:", ...args);
  // Write out said algorithm entry.
  debug();
  if (vertical) {
    return verticalLinePack(rectangleWidth, rectangleHeight, polygons, { averageArea });
  }
  return horizontalLinePack(rectangleWidth, rectangleHeight, polygons, { averageArea });
};

const verticalLinePack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  { averageArea: averageAreaOption = 0 } = {}
): ITransform[] => {
  const averageArea = averageAreaOption || average(polygons.map(points => polygonArea(points)));

  const normalizedScaleFromPoints = (points: IPoint[]) =>
    (averageArea / polygonArea(points) - 1) / 2 + 1;
  const maxWidth = Math.max(
    ...polygons.map(points => polygonWidth(points) * normalizedScaleFromPoints(points))
  );

  let verticalOffset = 0;
  return polygons.map(polygon => {
    const normalizingScale = normalizedScaleFromPoints(polygon);
    const horizontalCorrection = maxWidth - polygonWidth(polygon) * normalizingScale / 2;
    const matrix = new Matrix()
      .translate(horizontalCorrection, verticalOffset)
      .scaleU(normalizingScale);
    const polygonTransform = getPolygonTransform(rectangleWidth, rectangleHeight, polygon, matrix);
    verticalOffset += polygonHeight(polygon) * normalizingScale;
    return polygonTransform;
  });
};
const horizontalLinePack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  { averageArea: averageAreaOption = 0 } = {}
): ITransform[] => {
  const averageArea = averageAreaOption || average(polygons.map(points => polygonArea(points)));

  const normalizedScaleFromPoints = (points: IPoint[]) =>
    (averageArea / polygonArea(points) - 1) / 2 + 1;
  const maxHeight = Math.max(
    ...polygons.map(points => polygonHeight(points) * normalizedScaleFromPoints(points))
  );

  const alignBottom = true;

  let horizontalOffset = 0;
  return polygons.map(polygon => {
    const normalizingScale = normalizedScaleFromPoints(polygon);
    const verticalCorrection = alignBottom
      ? maxHeight - polygonHeight(polygon) * normalizingScale
      : maxHeight - polygonHeight(polygon) * normalizingScale / 2;
    const matrix = new Matrix()
      .translate(horizontalOffset, verticalCorrection)
      .scaleU(normalizingScale);
    const polygonTransform = getPolygonTransform(rectangleWidth, rectangleHeight, polygon, matrix);
    horizontalOffset += polygonWidth(polygon) * normalizingScale;
    return polygonTransform;
  });
};
