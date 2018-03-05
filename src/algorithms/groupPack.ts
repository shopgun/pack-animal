import { linePack } from ".";
import packAnimal from "../.";

import { getPolygonTransform, ITransform } from "../transform";

import {
  IPoint,
  IPolygon,
  polygonArea,
  polygonHeight,
  polygonsBounds,
  polygonWidth
} from "../geometry";

import { average } from "../maths";
import { noop } from "../utilities";
import { Matrix } from "../vendor/matrix";

const packRatio = (polygonTransforms: ITransform[]) => {
  const bounds = polygonsBounds(polygonTransforms.map(t => t.points));
  return polygonWidth(bounds) / polygonHeight(bounds);
};

export const groupPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonGroups: IPolygon[][],
  { debug: dbug = noop } = {}
): ITransform[] => {
  const rectangleRatio = rectangleWidth / rectangleHeight;
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("groupPack:", ...args);
  // Write out said algorithm entry.
  debug();
  const averageArea = average(
    Array.prototype.concat(...polygonGroups).map(({ points }) => polygonArea(points))
  );
  const normalizedScaleFromPoints = (points: IPoint[]) =>
    (averageArea / polygonArea(points) - 1) / 2 + 1;

  const packs = polygonGroups.map(polygonGroup => ({
    polygons: polygonGroup,
    transforms: packAnimal(
      rectangleWidth,
      rectangleHeight,
      polygonGroup.map(({ points }) => points),
      { debug: true, averageArea, maximize: false, center: true }
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
      { debug, averageArea: average(packsBounds.map(packBounds => polygonArea(packBounds))) }
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
      const scale = normalizedScaleFromPoints(points);
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
  //  return Array.prototype.concat(...packs);
  /*
    return polygonGroups.reduce((memo: ITransform[], polygonGroup) => [...memo, ...polygonGroup.map(polygon => getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      polygon,
      new Matrix()
    ))], []
    );
    */
};
