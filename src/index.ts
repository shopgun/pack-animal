import { IPoint, ITransform } from "./geometry";

import { bogoPack, greedyPack } from "./algorithms";

export default (
  squareWidth: number,
  squareHeight: number,
  polygons: IPoint[][],
  { algorithm = greedyPack } = {}
): ITransform[] => {
  if (!polygons.length) {
    throw new Error("No polygons to pack.");
  }
  return algorithm(squareWidth, squareHeight, polygons);
};
