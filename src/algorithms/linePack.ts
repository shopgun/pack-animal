import { IPolygon, polygonArea, polygonHeight, polygonWidth } from "../geometry";
import { average } from "../maths";
import { getPolygonTransform, ITransform } from "../transform";
import { noop } from "../utilities";
import { Matrix } from "../vendor/matrix";

export const linePack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonList: IPolygon[],
  vertical: boolean = false,
  { debug: dbug = noop, averageArea: averageAreaOption = 0, alignBottom = true, margin = 0 } = {}
): ITransform[] => {
  const polygons = polygonList.map(({ points }) => points);
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("linePack:", ...args);
  // Write out said algorithm entry.
  debug();

  const polygonAreas = polygons.map(polygon => polygonArea(polygon));
  const averageArea = averageAreaOption || average(polygonAreas);
  const polygonNormalizingScales = polygons.map(
    (_, i) => (averageArea / polygonAreas[i] - 1) / 2 + 1
  );
  const polygonWidths = polygons.map(
    (polygon, i) => polygonWidth(polygon) * polygonNormalizingScales[i] + margin
  );
  const polygonHeights = polygons.map(
    (polygon, i) => polygonHeight(polygon) * polygonNormalizingScales[i]
  );

  if (vertical) {
    const maxWidth = Math.max(
      ...polygons.map((_, i) => polygonWidths[i] * polygonNormalizingScales[i])
    );

    let verticalOffset = 0;
    return polygons.map((polygon, i) => {
      const normalizingScale = polygonNormalizingScales[i];
      const horizontalCorrection = maxWidth - polygonWidths[i] / 2;
      const matrix = new Matrix()
        .translate(horizontalCorrection, verticalOffset)
        .scaleU(normalizingScale);
      const polygonTransform = getPolygonTransform(
        rectangleWidth,
        rectangleHeight,
        polygon,
        matrix
      );
      verticalOffset += polygonHeights[i];
      return polygonTransform;
    });
  } else {
    const maxHeight = Math.max(
      ...polygons.map((_, i) => polygonHeights[i] * polygonNormalizingScales[i])
    );

    let horizontalOffset = 0;
    return polygons.map((polygon, i) => {
      const normalizingScale = polygonNormalizingScales[i];
      const verticalCorrection = alignBottom
        ? maxHeight - polygonHeights[i]
        : maxHeight - polygonHeights[i] / 2;
      const matrix = new Matrix()
        .translate(horizontalOffset, verticalCorrection)
        .scaleU(normalizingScale);
      const polygonTransform = getPolygonTransform(
        rectangleWidth,
        rectangleHeight,
        polygon,
        matrix
      );
      horizontalOffset += polygonWidths[i];
      return polygonTransform;
    });
  }
};
