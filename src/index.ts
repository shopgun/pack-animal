import { IPoint, ITransform, packUtilization } from "./geometry";

import { bogoPack, greedyPack } from "./algorithms";

export default (
  squareWidth: number,
  squareHeight: number,
  polygons: IPoint[][],
  { algorithm = greedyPack, /* istanbul ignore next */ debug = false } = {}
): ITransform[] => {
  if (!polygons.length) {
    throw new Error("No polygons to pack.");
  }
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.time(algorithm.name);
  }
  const polygonTranforms = algorithm(squareWidth, squareHeight, polygons);
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.timeEnd(algorithm.name);
    // tslint:disable-next-line
    console.log(
      Math.round(
        packUtilization(
          squareWidth,
          squareHeight,
          polygonTranforms.map(({ points }) => points)
        ) * 100
      ) + "%"
    );
  }
  return polygonTranforms;
};
