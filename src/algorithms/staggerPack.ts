import { linePack } from "./linePack";

import { IPoint, IPolygon, polygonArea, polygonHeight, polygonWidth } from "../geometry";
import { average, standardDeviation } from "../maths";
import { getPolygonTransform, ITransform } from "../transform";
import { noop, numberRange, permutator } from "../utilities";
import { Matrix } from "../vendor/matrix";

export const staggerPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonList: IPolygon[],
  { debug: dbug = noop, averageArea: averageAreaOption = 0 } = {}
): ITransform[] => {
  const polygons = polygonList.map(({ points }) => points);
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("staggerPack:", ...args);
  // Write out said algorithm entry.
  debug();
  // find desired grid dimensions
  /*
Given cellCount and gridRatio, find gridWidth and gridHeight such that:
gridWidth * gridHeight ≥ cellCount
gridWidth / gridHeight ≈ gridRatio
  */
  const cellCount = polygons.length;
  const rectangleRatio = rectangleWidth / rectangleHeight;
  debug({ rectangleRatio });
  const permutations = permutator(numberRange(1, cellCount), 2);

  const averageArea = averageAreaOption || average(polygons.map(points => polygonArea(points)));

  const normalizedScaleFromPoints = (points: IPoint[]) =>
    (averageArea / polygonArea(points) - 1) / 2 + 1;
  const maxWidth = Math.max(
    ...polygons.map(points => polygonWidth(points) * normalizedScaleFromPoints(points))
  );
  const maxHeight = Math.max(
    ...polygons.map(points => polygonHeight(points) * normalizedScaleFromPoints(points))
  );
  const minWidth = Math.min(
    ...polygons.map(points => polygonWidth(points) * normalizedScaleFromPoints(points))
  );
  const minHeight = Math.min(
    ...polygons.map(points => polygonHeight(points) * normalizedScaleFromPoints(points))
  );
  const averageRatio = average(
    polygons.map(points => polygonWidth(points) / polygonHeight(points))
  );
  const averageRatioInv = 1 + (1 - averageRatio);
  const averageRatios = [averageRatio, averageRatioInv].sort();

  const gridDimensionsToRatio = (w: number, h: number) => {
    let totalWidth: number;
    let totalHeight: number;
    if (w === 1) {
      totalWidth = maxWidth;
      totalHeight = polygons.reduce(
        (memo, points) => memo + polygonHeight(points) * normalizedScaleFromPoints(points),
        0
      );
    }
    if (h === 1) {
      totalHeight = maxHeight;
      totalWidth = polygons.reduce(
        (memo, points) => memo + polygonWidth(points) * normalizedScaleFromPoints(points),
        0
      );
    }
    if (w >= h) {
      totalWidth = maxWidth * w + (polygons.length >= w ? maxWidth * 0.5 : 0);
      totalHeight = maxHeight + maxHeight * 0.5 * (h - 1);
    } else {
      totalWidth = maxWidth + maxWidth * 0.5 * (w - 1);
      totalHeight = maxHeight * h + (polygons.length >= h ? maxHeight * 0.5 : 0);
    }
    return totalWidth / totalHeight;
  };

  const [gridWidth, gridHeight] = permutations.reduce((bestPermutation, currentPermutation) => {
    const count = currentPermutation[0] * currentPermutation[1];
    const ratio = gridDimensionsToRatio(currentPermutation[0], currentPermutation[1]);
    debug({ w: currentPermutation[0], h: currentPermutation[1], ratio });
    if (count < cellCount) {
      debug("discarded small grid");
      return bestPermutation;
    }
    if (count - cellCount >= currentPermutation[0]) {
      debug("discarded empty row grid");
      return bestPermutation;
    }
    if (
      count > 4 &&
      currentPermutation[0] > 2 &&
      count !== cellCount &&
      currentPermutation[0] !== count &&
      currentPermutation[1] !== count &&
      count - cellCount === currentPermutation[0] - 1
    ) {
      debug("discard grid that would have an orphan");
      return bestPermutation;
    }
    // compare previous(best) permutations if present
    if (bestPermutation[0] && bestPermutation[1]) {
      const bestRatio = gridDimensionsToRatio(bestPermutation[0], bestPermutation[1]);
      return Math.abs(ratio - rectangleRatio) < Math.abs(bestRatio - rectangleRatio)
        ? currentPermutation
        : bestPermutation;
    }
    return currentPermutation;
  }, []);
  debug({ gridHeight, gridWidth });
  const isVerticalGrid = gridHeight > gridWidth;
  debug(standardDeviation([rectangleRatio, averageRatio]));
  const twoferPack =
    polygons.length === 2 && standardDeviation([rectangleRatio, averageRatio]) < 0.25;
  debug({ twoferPack });
  if (!twoferPack) {
    if (gridWidth === 1 || gridHeight === 1) {
      return linePack(rectangleHeight, rectangleWidth, polygonList, gridWidth === 1, { debug });
    }
  }

  const horizontalOffset = maxWidth - (isVerticalGrid ? maxWidth / 2 : 0);
  const verticalOffset = maxHeight - (!isVerticalGrid ? maxHeight / 2 : 0);
  debug({
    horizontalOffset,
    verticalOffset
  });
  const polygonTransforms = polygons.map((polygon, index) => {
    const normalizingScale = normalizedScaleFromPoints(polygon);
    const x = index % gridWidth;
    const y = Math.floor(index / gridWidth);
    const horizontalStagger =
      !isVerticalGrid || twoferPack
        ? +!!(y % 2) * (maxWidth * (0.5 * (twoferPack ? averageRatios[0] : 1)))
        : 0;
    const verticalStagger =
      isVerticalGrid || twoferPack
        ? +!!(x % 2) * (maxHeight * (0.5 * (twoferPack ? averageRatios[0] : 1)))
        : 0;
    debug({
      horizontalStagger,
      verticalStagger
    });
    const horizontalCorrection = maxWidth - polygonWidth(polygon) * normalizingScale / 2;
    const verticalCorrection = maxHeight - polygonHeight(polygon) * normalizingScale / 2;
    debug({
      horizontalCorrection,
      verticalCorrection
    });

    return getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      polygon,
      new Matrix()
        .translate(
          x * horizontalOffset +
            horizontalStagger +
            horizontalCorrection +
            -(twoferPack && index === 1 && !isVerticalGrid
              ? minWidth * (0.5 * averageRatios[0])
              : 0),
          y * verticalOffset +
            verticalStagger +
            verticalCorrection +
            -(twoferPack && index === 1 && isVerticalGrid
              ? minHeight * (0.5 * averageRatios[0])
              : 0)
        )
        .scaleU(normalizingScale)
    );
  });
  return polygonTransforms;
};
