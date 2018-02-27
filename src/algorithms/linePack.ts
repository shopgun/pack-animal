import { IPoint, polygonArea, polygonHeight, polygonWidth } from "../geometry";
import { average } from "../maths";
import { getPolygonTransform, ITransform } from "../transform";
import { noop } from "../utilities";
import { Matrix } from "../vendor/matrix";

export const linePack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  vertical: boolean = false,
  { debug = noop } = {}
): ITransform[] => {
  debug("linePack:");
  const averageArea = average(polygons.map(points => polygonArea(points)));

  const normalizedScaleFromPoints = (points: IPoint[]) =>
    (averageArea / polygonArea(points) - 1) / 2 + 1;
  const maxWidth = Math.max(
    ...polygons.map(points => polygonWidth(points) * normalizedScaleFromPoints(points))
  );
  const maxHeight = Math.max(
    ...polygons.map(points => polygonHeight(points) * normalizedScaleFromPoints(points))
  );

  // TODO: if we're at this point, we have a 1xY or Xx1 grid and are not twoferpacking
  // We should use a separate packing algorithm specialized for these scenarios, as grids
  // can look quite stiff or unnaturally spaced when presented with only a single row or column.
  let horizontalOffset = 0;
  let verticalOffset = 0;
  const polygonTransforms = polygons.map(polygon => {
    const normalizingScale = normalizedScaleFromPoints(polygon);
    const horizontalCorrection = vertical
      ? maxWidth - polygonWidth(polygon) * normalizingScale / 2
      : 0;
    const verticalCorrection = !vertical
      ? maxHeight - polygonHeight(polygon) * normalizingScale / 2
      : 0;

    const polygonTransform = getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      polygon,
      new Matrix()
        .translate(horizontalOffset + horizontalCorrection, verticalOffset + verticalCorrection)
        .scaleU(normalizingScale)
    );
    if (vertical) {
      verticalOffset += polygonHeight(polygon) * normalizingScale;
    } else {
      horizontalOffset += polygonWidth(polygon) * normalizingScale;
    }
    return polygonTransform;
  });
  return polygonTransforms;
};
