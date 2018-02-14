import { IPoint, polygonArea, polygonHeight, polygonWidth } from "../geometry";
import { getPolygonTransform, ITransform } from "../transform";
import { noop, numberRange, permutator } from "../utilities";
import { Matrix } from "../vendor/matrix";

export const staggerPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  { debug = noop } = {}
): ITransform[] => {
  // find desired grid dimensions
  /*
Given cellCount and gridRatio, find gridWidth and gridHeight such that:
gridWidth * gridHeight ≥ cellCount
gridWidth / gridHeight ≈ gridRatio
  */
  const cellCount = polygons.length;
  const rectangleRatio = rectangleWidth / rectangleHeight;
  const permutations = permutator(numberRange(1, cellCount), 2);

  const averageArea =
    polygons.reduce((memo, points) => memo + polygonArea(points), 0) / polygons.length;

  const normalizedScaleFromPoints = (points: IPoint[]) =>
    (averageArea / polygonArea(points) - 1) / 2 + 1;
  const averageWidth =
    polygons.reduce(
      (memo, points) => memo + polygonWidth(points) * normalizedScaleFromPoints(points),
      0
    ) / polygons.length;
  const averageHeight =
    polygons.reduce(
      (memo, points) => memo + polygonHeight(points) * normalizedScaleFromPoints(points),
      0
    ) / polygons.length;
  const averageRatio =
    polygons.reduce((memo, points) => memo + polygonWidth(points) / polygonHeight(points), 0) /
    polygons.length;
  const averageRatioInv = 1 + (1 - averageRatio);
  const averageRatios = [averageRatio, averageRatioInv].sort();
  debug(averageRatios);
  debug({ averageRatio, averageWidth, averageHeight });
  const gridDimensionsToRatio = (w: number, h: number) => averageWidth * w / (averageHeight * h);

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
  const isVerticalGrid = gridHeight > gridWidth;

  const horizontalOffset = averageWidth * (gridHeight > 1 ? averageRatios[+!isVerticalGrid] : 1);
  const verticalOffset = averageHeight * (gridWidth > 1 ? averageRatios[+!!isVerticalGrid] : 1);
  const polygonTransforms = polygons.map((polygon, index) => {
    const normalizingScale = normalizedScaleFromPoints(polygon);
    const x = index % gridWidth;
    const y = Math.floor(index / gridWidth);
    const horizontalStagger = !isVerticalGrid ? (y % 2) * (averageWidth / 2) * averageRatios[1] : 0;
    const verticalStagger = isVerticalGrid ? (x % 2) * (averageHeight / 2) * averageRatios[1] : 0;
    const horizontalCorrection = averageWidth - polygonWidth(polygon) * normalizingScale / 2;
    const verticalCorrection = averageHeight - polygonHeight(polygon) * normalizingScale / 2;
    return getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      polygon,
      new Matrix()
        .translate(
          x * horizontalOffset + horizontalStagger + horizontalCorrection,
          y * verticalOffset + verticalStagger + verticalCorrection
        )
        .scaleU(normalizingScale)
    );
  });
  return polygonTransforms;
};
