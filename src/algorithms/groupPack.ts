import { linePack } from ".";
import packAnimal from "../.";

import { centerPolygonTransforms, getPolygonTransform, ITransform } from "../transform";

import {
  IPoint,
  IPolygon,
  polygonArea,
  polygonCenter,
  polygonHeight,
  polygonsBounds
} from "../geometry";
import { Matrix } from "../vendor/matrix";

import { average } from "../maths";
import { noop } from "../utilities";

export const groupPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonGroups: IPolygon[][],
  { /* istanbul ignore next */ debug: dbug = noop } = {}
): ITransform[] => {
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("groupPack:", ...args);
  // Write out said algorithm entry.
  debug();
  const averageArea = average(
    Array.prototype.concat(...polygonGroups).map(({ points }) => polygonArea(points))
  );
  const verticalRectangle = rectangleHeight > rectangleWidth;
  const allPolys = Array.prototype.concat(...polygonGroups);
  const subPackCenters: IPoint[] = [];
  let packedWidth = 0;
  let packedHeight = 0;
  const packs = polygonGroups.map(polygonGroup => {
    const subPackWidth = !verticalRectangle
      ? rectangleWidth * (polygonGroup.length / allPolys.length)
      : rectangleWidth;
    const subPackHeight = verticalRectangle
      ? rectangleHeight * (polygonGroup.length / allPolys.length)
      : rectangleHeight;
    subPackCenters.push({
      x: verticalRectangle ? subPackWidth / 2 : packedWidth + subPackWidth / 2,
      y: !verticalRectangle ? subPackHeight / 2 : packedHeight + subPackHeight / 2
    });
    packedWidth += subPackWidth;
    packedHeight += subPackHeight;
    return {
      polygons: polygonGroup,
      transforms: centerPolygonTransforms(
        subPackWidth,
        subPackHeight,
        packAnimal(subPackWidth, subPackHeight, polygonGroup.map(({ points }) => points), {
          averageArea,
          center: true,
          debug: dbug !== noop,
          isGroupPack: true,
          maximize: false,
          rotate: false
        })
      )
    };
  });
  const packsBounds = packs.map(polygonTransforms =>
    polygonsBounds(polygonTransforms.transforms.map(polygonTransform => polygonTransform.points))
  );
  const packedPacks = linePack(
    rectangleWidth,
    rectangleHeight,
    packsBounds.map((points, index) => ({ points, index })),
    rectangleWidth < rectangleHeight,
    {
      alignBottom: false,
      averageArea: average(packsBounds.map(packBounds => polygonArea(packBounds))),
      debug
    }
  );

  const transforms = packedPacks.reduce((memo: ITransform[], packTransform, index) => {
    const pack = packs[index];
    const packedPackCenter = polygonCenter(
      polygonsBounds(pack.transforms.map(transform => transform.points))
    );
    const polygonsCenter = polygonCenter(
      polygonsBounds(pack.polygons.map(polygon => polygon.points))
    );
    const calculatedPackCenter = subPackCenters[index];
    const horizontalCorrection = packedPackCenter.x - polygonsCenter.x;
    const verticalCorrection = packedPackCenter.y - polygonsCenter.y;
    pack.polygons.forEach((polygon, polygonGroupPolygonIndex) => {
      const polyTransform = pack.transforms[polygonGroupPolygonIndex];
      const points = polyTransform.matrix.inverse().applyToArray(polyTransform.points);
      const averagePolygonScale = average(
        pack.transforms.map(transform => transform.matrix.decompose().scale.x)
      );
      const packScale = packTransform.matrix.decompose().scale.x;
      const packToPolyScaleMultiplier = packScale / averagePolygonScale;
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
