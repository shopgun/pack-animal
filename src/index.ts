import { IPoint, packUtilization } from "./geometry";
import {
  centerPolygonTransforms,
  IJitterOptions,
  ITransform,
  jitterPolygonTransforms,
  marginalizePolygonTransforms,
  scalePolygonTransforms
} from "./transform";
import { PackAnimalException } from "./utilities";

import { greedyPack, singlePack } from "./algorithms";
import { IGreedyPackOptions } from "./algorithms/greedyPack";

export interface IPackAnimalOptions {
  algorithm?: (...args: any[]) => ITransform[];
  center?: boolean;
  rotate?: boolean;
  margin?: number;
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
    rotate = true,
    margin = 0,
    postPackPolygonScale,
    jitter,
    algorithmOptions = {},
    /* istanbul ignore next */ debug = false
  }: IPackAnimalOptions = {}
): ITransform[] => {
  if (!polygons || !polygons.length) {
    throw new PackAnimalException("No polygons to pack, there must be at least one.", { polygons });
  }
  if (rectangleWidth < 0 || rectangleHeight < 0) {
    throw new PackAnimalException("Rectangle width/height too small, must be positive", {
      rectangleHeight,
      rectangleWidth
    });
  }
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.time(algorithm.name);
  }
  let polygonTransforms: ITransform[];
  if (polygons.length === 1) {
    polygonTransforms = singlePack(rectangleWidth, rectangleHeight, polygons, { rotate });
  } else {
    polygonTransforms = algorithm(rectangleWidth, rectangleHeight, polygons, {
      ...algorithmOptions,
      ...(rotate ? {} : { rotationMode: "OFF" })
    });
  }
  if (
    center &&
    polygons.length !== 1 /* ignore `center`, single polys are already centered by singlePack*/
  ) {
    polygonTransforms = centerPolygonTransforms(rectangleWidth, rectangleHeight, polygonTransforms);
  }
  if (margin) {
    polygonTransforms = marginalizePolygonTransforms(
      margin,
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
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
