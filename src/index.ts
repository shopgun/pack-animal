import { IPoint, packUtilization } from "./geometry";
import { centerPolygonTransforms, ITransform } from "./transform";

import { greedyPack } from "./algorithms";
import { IGreedyPackOptions } from "./algorithms/greedyPack";

export interface IPackAnimalOptions {
  algorithm?: (...args: any[]) => ITransform[];
  center?: boolean;
  debug?: boolean;
  algorithmOptions?: IGreedyPackOptions;
}

export default (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  {
    algorithm = greedyPack,
    center = true,
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
  let polygonTransforms = algorithm(rectangleWidth, rectangleHeight, polygons, algorithmOptions);
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
