export interface IPoint {
  x: number;
  y: number;
}

export interface ITransform {
  rotate: number;
  scale: number;
  translateX: number;
  translateY: number;
}

const randomPack = (
  squareWidth: number,
  squareHeight: number,
  polygons: IPoint[][]
) =>
  polygons.map(points => ({
    rotate: Math.round(Math.random() * 360),
    scale: 1,
    translateX: Math.round(Math.random() * squareWidth / 2),
    translateY: Math.round(Math.random() * squareHeight / 2)
  }));

export default (
  squareWidth: number,
  squareHeight: number,
  polygons: IPoint[][],
  { algorithm = randomPack } = {}
): ITransform[] => {
  return algorithm(squareWidth, squareHeight, polygons);
};
