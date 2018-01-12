import { IPoint, ITransform } from "./geometry";

import { bogoPack, greedyPack } from "./algorithms";

export default (
  squareWidth: number,
  squareHeight: number,
  polygons: IPoint[][],
  { algorithm = greedyPack } = {}
): ITransform[] => algorithm(squareWidth, squareHeight, polygons);
