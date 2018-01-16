import { IPoint, ITransform, packUtilization } from "./geometry";

import { bogoPack, greedyPack } from "./algorithms";

export default (
  squareWidth: number,
  squareHeight: number,
  polygons: IPoint[][],
  { algorithm = greedyPack, debug = false } = {}
): ITransform[] => {
  if (!polygons.length) {
    throw new Error("No polygons to pack.");
  }
  if (debug) {
    console.time(algorithm.name);
  }
  const polygonTranforms = algorithm(squareWidth, squareHeight, polygons);
  if (debug) {
    console.timeEnd(algorithm.name);
    console.log(packUtilization(squareWidth, squareHeight, polygonTranforms));
  }
  return polygonTranforms;
};
