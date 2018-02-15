import { IPoint, packUtilization, polygonHeight, polygonWidth } from "./geometry";
import { standardDeviation } from "./maths";
import {
  centerPolygonTransforms,
  IJitterOptions,
  ITransform,
  jitterPolygonTransforms,
  marginalizePolygonTransforms,
  maximizePolygonTransforms,
  scalePolygonTransforms
} from "./transform";
import { noop, PackAnimalException } from "./utilities";

import { greedyPack, singlePack, staggerPack } from "./algorithms";
import { IGreedyPackOptions } from "./algorithms/greedyPack";

export interface IPackAnimalOptions {
  center?: boolean;
  rotate?: boolean;
  margin?: number;
  maximize?: boolean;
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
    center = true,
    rotate = true,
    margin = 0,
    maximize = true,
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
    console.time("packAnimal");
  }
  let polygonTransforms: ITransform[];
  const aspectRatioDeviation = standardDeviation(
    polygons.map(polygon => polygonWidth(polygon) / polygonHeight(polygon))
  );
  if (polygons.length === 1) {
    polygonTransforms = singlePack(rectangleWidth, rectangleHeight, polygons, { rotate });
  } else if (polygons.length > 1 && aspectRatioDeviation < 0.25) {
    polygonTransforms = staggerPack(rectangleWidth, rectangleHeight, polygons, {
      debug: /* istanbul ignore next */ debug ? console.log : noop
    });
  } else {
    polygonTransforms = greedyPack(rectangleWidth, rectangleHeight, polygons, {
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
  if (maximize) {
    polygonTransforms = maximizePolygonTransforms(
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
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
  if (maximize) {
    polygonTransforms = maximizePolygonTransforms(
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
  }
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.timeEnd("packAnimal");
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
