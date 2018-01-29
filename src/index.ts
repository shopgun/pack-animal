import { IPoint, packUtilization } from "./geometry";
import {
  centerPolygonTransforms,
  IJitterOptions,
  ITransform,
  jitterPolygonTransforms,
  scalePolygonTransforms
} from "./transform";

import { greedyPack, singlePack } from "./algorithms";
import { IGreedyPackOptions } from "./algorithms/greedyPack";

export interface IPackAnimalOptions {
  algorithm?: (...args: any[]) => ITransform[];
  center?: boolean;
  postPackPolygonScale?: number;
  debug?: boolean;
  algorithmOptions?: IGreedyPackOptions;
  jitter?: IJitterOptions;
}

export default (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  {
    algorithm = greedyPack,
    center = true,
    postPackPolygonScale,
    jitter,
    algorithmOptions = {},
    /* istanbul ignore next */ debug = false
  }: IPackAnimalOptions = {}
): ITransform[] => {
  if (!polygons.length) {
    throw new Error("No polygons to pack.");
  }
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.time(algorithm.name);
  }
  let polygonTransforms: ITransform[];
  if (polygons.length === 1) {
    polygonTransforms = singlePack(rectangleWidth, rectangleHeight, polygons);
  } else {
    polygonTransforms = algorithm(rectangleWidth, rectangleHeight, polygons, algorithmOptions);
  }
  if (
    center &&
    polygons.length !== 1 /* ignore `center`, single polys are already centered by singlePack*/
  ) {
    polygonTransforms = centerPolygonTransforms(rectangleWidth, rectangleHeight, polygonTransforms);
  }
  if (postPackPolygonScale) {
    polygonTransforms = scalePolygonTransforms(
      postPackPolygonScale,
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
  }
  if (jitter) {
    polygonTransforms = jitterPolygonTransforms(
      jitter,
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
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
