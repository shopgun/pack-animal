import { IPoint, packUtilization } from "./geometry";
import { centerPolygonTransforms, ITransform } from "./transform";

import { greedyPack } from "./algorithms";

export default (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  { algorithm = greedyPack, center = true, /* istanbul ignore next */ debug = false } = {}
): ITransform[] => {
  if (!polygons.length) {
    throw new Error("No polygons to pack.");
  }
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.time(algorithm.name);
  }
  let polygonTransforms = algorithm(rectangleWidth, rectangleHeight, polygons);
  if (center) {
    polygonTransforms = centerPolygonTransforms(rectangleWidth, rectangleHeight, polygonTransforms);
  }
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.timeEnd(algorithm.name);
    // tslint:disable-next-line
    console.log(
      Math.round(
        packUtilization(
          rectangleWidth,
          rectangleHeight,
          polygonTransforms.map(({ points }) => points)
        ) * 100
      ) + "%"
    );
  }
  return polygonTransforms;
};
