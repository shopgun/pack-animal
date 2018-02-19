import { linePack } from "./linePack";
import { staggerPack } from "./staggerPack";

import { IPoint, polygonArea, polygonHeight, polygonsBounds, polygonWidth } from "../geometry";
import { getPolygonTransform, ITransform } from "../transform";
import { noop } from "../utilities";
import { Matrix } from "../vendor/matrix";

const packRatio = (polygonTransforms: ITransform[]) => {
  const bounds = polygonsBounds(polygonTransforms.map(t => t.points));
  return polygonWidth(bounds) / polygonHeight(bounds);
};
const patternFlipperX = new Matrix().applyToArray.bind(new Matrix().flipX());
const patternFlipperY = new Matrix().applyToArray.bind(new Matrix().flipY());
const rotateArray = (n: number, array: any[]) => {
  return array.slice(n, array.length).concat(array.slice(0, n));
};

export const patternPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  { debug = noop } = {}
): ITransform[] => {
  const rectangleRatio = rectangleWidth / rectangleHeight;
  debug("patternPack:");

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
    (memo, pattern) => [
      ...memo,
      pattern,
      patternFlipperX(pattern),
      patternFlipperY(pattern),
      ...pattern
        .map((_, index) => rotateArray(index + 1, pattern))
        .reduce(
          (memo2, pattern2) => [
            ...memo2,
            pattern2,
            patternFlipperX(pattern2),
            patternFlipperY(pattern2)
          ],
          []
        )
    ],
    [[]]
  );
  const patternsForPack = patterns.filter(pattern => pattern.length === polygons.length);
  if (patternsForPack.length) {
    const averageArea =
      polygons.reduce((memo, points) => memo + polygonArea(points), 0) / polygons.length;
    const averageRatio =
      polygons.reduce((memo, points) => memo + polygonWidth(points) / polygonHeight(points), 0) /
      polygons.length;

    const normalizedScaleFromPoints = (points: IPoint[]) =>
      (averageArea / polygonArea(points) - 1) / 2 + 1;
    const maxWidth = Math.max(
      ...polygons.map(points => polygonWidth(points) * normalizedScaleFromPoints(points))
    );
    const maxHeight = Math.max(
      ...polygons.map(points => polygonHeight(points) * normalizedScaleFromPoints(points))
    );
    const line = linePack(rectangleWidth, rectangleHeight, polygons, averageRatio > 1, { debug });
    return patternsForPack.reduce((bestPack: ITransform[], pattern) => {
      const horizontalOffset = maxWidth;
      const verticalOffset = maxHeight;
      const newPack = polygons.map((polygon, index) => {
        const normalizingScale = normalizedScaleFromPoints(polygon);
        const { x, y } = pattern[index];
        const horizontalCorrection = maxWidth - polygonWidth(polygon) * normalizingScale / 2;
        const verticalCorrection = maxHeight - polygonHeight(polygon) * normalizingScale / 2;

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
      const bestRatio = packRatio(bestPack);
      if (Math.abs(newRatio - rectangleRatio) < Math.abs(bestRatio - rectangleRatio)) {
        debug(JSON.stringify(pattern));
        return newPack;
      }
      return bestPack;
    }, line);
  }
  return staggerPack(rectangleWidth, rectangleHeight, polygons, { debug });
  /*
  return polygons.map(polygon =>
    getPolygonTransform(rectangleWidth, rectangleHeight, polygon, new Matrix())
  );
  */
};
