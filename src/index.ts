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
    rotate: ~~(Math.random() * 360),
    scale: 1,
    translateX: ~~(Math.random() * squareWidth / 2),
    translateY: ~~(Math.random() * squareHeight / 2)
  }));

export default (
  squareWidth: number,
  squareHeight: number,
  polygons: IPoint[][],
  { algorithm = randomPack } = {}
): ITransform[] => {
  return algorithm(squareWidth, squareHeight, polygons);
};
