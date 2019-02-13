import { average } from "../maths";
import { linePack } from "./linePack";
import { staggerPack } from "./staggerPack";

import { IPoint, IPolygon, polygonArea, polygonHeight, polygonWidth } from "../geometry";
import { getPolygonTransform, ITransform, packRatio } from "../transform";
import { noop } from "../utilities";
import { Matrix } from "../vendor/matrix";

const patternFlipperX = new Matrix().applyToArray.bind(new Matrix().flipX());
const patternFlipperY = new Matrix().applyToArray.bind(new Matrix().flipY());

const patterns: IPoint[][] = [
  /*
      X
       X
  */
  [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }],
  [{ x: 0, y: 0 }, { x: 0.25, y: 0.75 }],
  [{ x: 0, y: 0 }, { x: 0.75, y: 0.25 }],
  /*
      X X
       X
  */
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 0.5 }],
  [{ x: 0, y: 0 }, { x: 1.5, y: 0 }, { x: 0.75, y: 0.25 }],
  [{ x: 0, y: 0 }, { x: 0.9, y: 0 }, { x: 0.45, y: 0.9 }],
  /*
      X
       X
      X
  */
  [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }],
  /*
      X
       X
        X
  */
  [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }],
  [{ x: 0, y: 0 }, { x: 0.25, y: 0.75 }, { x: 0.5, y: 1.5 }], // verticaler
  [{ x: 0, y: 0 }, { x: 0.2, y: 0.8 }, { x: 0.4, y: 1.6 }], // more verticaler
  [{ x: 0, y: 0 }, { x: 0.75, y: 0.25 }, { x: 1.5, y: 0.5 }], // horizontaler
  /*
      X X
       X X
  */
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1.5, y: 0.5 }],
  [{ x: 0, y: 0 }, { x: 1.5, y: 0 }, { x: 0.75, y: 0.25 }, { x: 2.25, y: 0.25 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 0.75 }, { x: 1.5, y: 0.75 }],
  /*
      X
       X
      X
       X
  */
  [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 0, y: 1 }, { x: 0.5, y: 1.5 }],
  /*
      X X X
       X X
  */
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1.5, y: 0.5 }],
  [{ x: 0, y: 0 }, { x: 1.5, y: 0 }, { x: 3, y: 0 }, { x: 0.75, y: 0.25 }, { x: 2.25, y: 0.25 }],
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0.5, y: 0.75 }, { x: 1.5, y: 0.75 }],
  /*
      X
       X
      X
       X
      X
  */
  [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 0, y: 1 }, { x: 0.5, y: 1.5 }, { x: 0, y: 2 }],
  [{ x: 0, y: 0 }, { x: 0.75, y: 0.5 }, { x: 0, y: 1 }, { x: 0.75, y: 1.5 }, { x: 0, y: 2 }],
  [{ x: 0, y: 0 }, { x: 0.5, y: 0.75 }, { x: 0, y: 1.5 }, { x: 0.5, y: 2.25 }, { x: 0, y: 3 }],
  /*
      X X
       X
      X X
  */
  [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0.5, y: 0.5 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  // noop
  []
].reduce(
  // Add reversed version of every pattern?
  (memo: IPoint[][], pattern) => [
    ...memo,
    pattern,
    patternFlipperX(pattern),
    patternFlipperY(pattern),
    pattern.reverse()
  ],
  [[]]
);

export const patternPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonList: IPolygon[],
  { debug: dbug = noop, averageArea: averageAreaOption = 0 } = {}
): ITransform[] => {
  const polygons = polygonList.map(({ points }) => points);
  const rectangleRatio = rectangleWidth / rectangleHeight;
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("patternPack:", ...args);
  // Write out said algorithm entry.
  debug();

  const patternsForPack = patterns.filter(pattern => pattern.length === polygons.length);
  debug(patternsForPack);
  const averageArea = averageAreaOption || average(polygons.map(points => polygonArea(points)));
  if (!patternsForPack.length) {
    return staggerPack(rectangleWidth, rectangleHeight, polygonList, {
      averageArea,
      debug
    });
  }

  const normalizedScaleFromPoints = (points: IPoint[]) =>
    (averageArea / polygonArea(points) - 1) / 2 + 1;
  const maxWidth = Math.max(
    ...polygons.map(points => polygonWidth(points) * normalizedScaleFromPoints(points))
  );
  const maxHeight = Math.max(
    ...polygons.map(points => polygonHeight(points) * normalizedScaleFromPoints(points))
  );
  const line = [
    linePack(rectangleWidth, rectangleHeight, polygonList, false, { debug, averageArea }),
    linePack(rectangleWidth, rectangleHeight, polygonList, true, { debug, averageArea })
  ].sort(
    (a, b) => Math.abs(packRatio(a) - rectangleRatio) - Math.abs(packRatio(b) - rectangleRatio)
  )[0];

  let bestRatio = packRatio(line);
  let bestRatioDelta = Math.abs(bestRatio - rectangleRatio);
  const horizontalOffset = maxWidth;
  const verticalOffset = maxHeight;
  return patternsForPack.reduce((bestPack: ITransform[], pattern) => {
    const newPack = polygons.map((polygon, index) => {
      const normalizingScale = normalizedScaleFromPoints(polygon);
      const { x, y } = pattern[index];
      const horizontalCorrection = maxWidth - (polygonWidth(polygon) * normalizingScale) / 2;
      const verticalCorrection = maxHeight - (polygonHeight(polygon) * normalizingScale) / 2;

      return getPolygonTransform(
        rectangleWidth,
        rectangleHeight,
        polygon,
        new Matrix()
          .translate(
            x * horizontalOffset + horizontalCorrection,
            y * verticalOffset + verticalCorrection
          )
          .scaleU(normalizingScale)
      );
    });
    const newRatio = packRatio(newPack);
    if (Math.abs(newRatio - rectangleRatio) < bestRatioDelta) {
      bestRatio = newRatio;
      bestRatioDelta = Math.abs(bestRatio - rectangleRatio);
      debug(JSON.stringify(pattern));
      return newPack;
    }
    return bestPack;
  }, line);
};
