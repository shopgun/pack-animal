import {
  IPolygon,
  polygonArea,
  polygonBounds,
  polygonCenter,
  polygonHeight,
  polygonWidth,
  rotateMatrixAroundPoint,
  scaleMatrixAroundPoint
} from "../geometry";
import { getPolygonTransform, ITransform } from "../transform";
import { noop, PackAnimalException } from "../utilities";
import { Matrix } from "../vendor/matrix";

export const singlePack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonList: IPolygon[],
  { debug: dbug = noop, rotate = true, averageArea = 0 } = {}
): ITransform[] => {
  const polygons = polygonList.map(({ points }) => points);
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("singlePack:", ...args);
  // Write out said algorithm entry.
  debug();

  const polygon = polygons[0];
  if (!polygon.length) {
    throw new PackAnimalException("Pointless polygon not allowed.", { polygons });
  }
  const width = polygonWidth(polygon);
  const height = polygonHeight(polygon);
  const centerPoint = polygonCenter(polygon);
  const ratio = width / height;
  const rectangleRatio = rectangleWidth / rectangleHeight;

  const rotateDegrees =
    rotate &&
    // Don't rotate square-ish things
    (ratio < 0.9 || ratio > 1.1) &&
    // Rotate only if poly and rectangle aren't both landscape or portrait
    ((ratio > 1 && rectangleRatio < 1) || (ratio < 1 && rectangleRatio > 1))
      ? 90
      : 0;

  const scale =
    averageArea > 0
      ? (averageArea / polygonArea(polygon) - 1) / 2 + 1
      : rotateDegrees
        ? Math.min(1, rectangleWidth / height, rectangleHeight / width)
        : Math.min(1, rectangleWidth / width, rectangleHeight / height);

  const bounds = polygonBounds(polygon);
  const centeringTranslateX = (bounds[2].x - bounds[0].x - rectangleWidth) / 2;
  const centeringTranslateY = (bounds[2].y - bounds[0].y - rectangleHeight) / 2;
  const translateXpoz =
    centeringTranslateX + bounds[2].x <= rectangleWidth && centeringTranslateX + bounds[0].x > 0;
  const translateYpoz =
    centeringTranslateY + bounds[2].y <= rectangleHeight && centeringTranslateY + bounds[0].y > 0;
  return [
    getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      polygon,
      scaleMatrixAroundPoint(
        centerPoint,
        scale,
        rotateMatrixAroundPoint(
          centerPoint,
          rotateDegrees,
          new Matrix().translate(
            translateXpoz ? centeringTranslateX : -centeringTranslateX,
            translateYpoz ? centeringTranslateY : -centeringTranslateY
          )
        )
      )
    )
  ];
};
