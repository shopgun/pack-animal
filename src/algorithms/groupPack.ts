import { linePack } from ".";
import packAnimal from "../.";

import { getPolygonTransform, ITransform } from "../transform";

import { IPolygon, polygonArea, polygonHeight, polygonsBounds, polygonWidth } from "../geometry";
import { Matrix } from "../vendor/matrix";

import { average } from "../maths";
import { noop } from "../utilities";

const packRatio = (polygonTransforms: ITransform[]) => {
  const bounds = polygonsBounds(polygonTransforms.map(t => t.points));
  return polygonWidth(bounds) / polygonHeight(bounds);
};

export const groupPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonGroups: IPolygon[][],
  { /* istanbul ignore next */ debug: dbug = noop } = {}
): ITransform[] => {
  const rectangleRatio = rectangleWidth / rectangleHeight;
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("groupPack:", ...args);
  // Write out said algorithm entry.
  debug();
  const averageArea = average(
    Array.prototype.concat(...polygonGroups).map(({ points }) => polygonArea(points))
  );

  const packs = polygonGroups.map(polygonGroup => ({
    polygons: polygonGroup,
    transforms: packAnimal(
      rectangleHeight,
      rectangleWidth,
      polygonGroup.map(({ points }) => points),
      {
        averageArea,
        center: true,
        debug: dbug !== noop,
        maximize: false
      }
    )
  }));
  const packsBounds = packs.map(polygonTransforms =>
    polygonsBounds(
      polygonTransforms.transforms.map((polygonTransform: ITransform) => polygonTransform.points)
    )
  );
  const packedPacks = [
    linePack(
      rectangleWidth,
      rectangleHeight,
      packsBounds.map((points, index) => ({ points, index })),
      false,
      {
        alignBottom: false,
        averageArea: average(packsBounds.map(packBounds => polygonArea(packBounds))),
        debug
      }
    ),
    linePack(
      rectangleWidth,
      rectangleHeight,
      packsBounds.map((points, index) => ({ points, index })),
      true,
      { debug, averageArea: average(packsBounds.map(packBounds => polygonArea(packBounds))) }
    )
  ].sort(
    (a, b) => Math.abs(packRatio(a) - rectangleRatio) - Math.abs(packRatio(b) - rectangleRatio)
  )[0];

  const transforms = packedPacks.reduce((memo: ITransform[], packTransform, index) => {
    const pack = packs[index];
    pack.polygons.forEach((polygon, polygonGroupPolygonIndex) => {
      const polyTransform = pack.transforms[polygonGroupPolygonIndex];
      const points = polyTransform.matrix.inverse().applyToArray(polyTransform.points);
      const sumTransform = getPolygonTransform(
        rectangleWidth,
        rectangleHeight,
        points,
        Matrix.from(
          polyTransform.matrix.a,
          polyTransform.matrix.b,
          polyTransform.matrix.c,
          polyTransform.matrix.d,
          polyTransform.matrix.e + packTransform.matrix.e,
          polyTransform.matrix.f + packTransform.matrix.f
        )
      );

      memo[polygon.index] = sumTransform;
    });
    return memo;
  }, []);
  return transforms;
};
