import polygonOverlap from "polygon-overlap";
import { Matrix } from "transformation-matrix-js";

const doPolygonsOverlap = (polygon1: IPoint[], polygon2: IPoint[]) =>
  polygonOverlap(
    polygon1.map(({ x, y }) => [x, y]),
    polygon2.map(({ x, y }) => [x, y])
  );

export interface IPoint {
  x: number;
  y: number;
}

export interface ITransform {
  rotate: number;
  scale: number;
  translateX: number;
  translateY: number;
  matrix: string;
  points: IPoint[];
}

const polygonArea = (points: IPoint[]) => {
  const l = points.length;
  let det = 0;

  if (points[0] !== points[points.length - 1]) {
    points = points.concat(points[0]);
  }

  for (let i = 0; i < l; i++) {
    det += points[i].x * points[i + 1].y - points[i].y * points[i + 1].x;
  }

  return Math.abs(det) / 2;
};

const isPolygonWithinRectangle = (polygon: IPoint[], rectangle: IPoint[]) => {
  for (const { x, y } of polygon) {
    if (x < rectangle[0].x || x > rectangle[1].x) {
      return false;
    }
    if (y < rectangle[0].y || y > rectangle[1].y) {
      return false;
    }
  }
  return true;
};

const randomPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][]
) => {
  const rectangle: IPoint[] = [
    { x: 0, y: 0 },
    { x: rectangleWidth, y: rectangleHeight }
  ];
  const rectanglePolygon: IPoint[] = [
    { x: 0, y: 0 },
    { x: rectangleWidth, y: 0 },
    { x: rectangleWidth, y: rectangleHeight },
    { x: 0, y: rectangleHeight }
  ];
  const polygonsLength = polygons.length;
  let transformPolygons: ITransform[];

  let i = 0;
  let scale = 1;
  do {
    scale = scale > 0.5 ? scale - 0.001 : 1;
    transformPolygons = polygons.map(points => {
      const width = Math.max(...points.map(point => point.x));
      const height = Math.max(...points.map(point => point.y));
      const area = polygonArea(points);
      const rotate = Math.round(Math.random() * 180 - 90);
      const translateX = Math.round(Math.random() * rectangleWidth / 2);
      const translateY = Math.round(Math.random() * rectangleHeight / 2);
      const m = new Matrix();

      m.multiply(new Matrix().translate(width / 2, height / 2));
      m.multiply(new Matrix().rotateDeg(rotate));
      m.multiply(new Matrix().translate(-(width / 2), -(height / 2)));

      m.multiply(
        new Matrix().translate(translateX, translateY).scale(scale, scale)
      );
      return {
        cssTransform: m.toCSS(),
        matrix: m,
        points: m.applyToArray(points),
        rotate,
        scale,
        translateX,
        translateY
      };
    });
    i++;
  } while (
    !transformPolygons.every(({ points }) =>
      isPolygonWithinRectangle(points, rectangle)
    ) ||
    transformPolygons.some((transformPolygon, index) =>
      doPolygonsOverlap(
        transformPolygons[index].points,
        transformPolygons[(index + 1) % polygonsLength].points
      )
    )
  );
  const rectangleArea = polygonArea(rectanglePolygon);
  console.log({
    utilization:
      Math.round(
        transformPolygons.reduce(
          (memo, { points }) => memo - polygonArea(points),
          rectangleArea
        ) /
          rectangleArea *
          100
      ) + "%"
  });

  return transformPolygons;
};

export default (
  squareWidth: number,
  squareHeight: number,
  polygons: IPoint[][],
  { algorithm = randomPack } = {}
): ITransform[] => {
  return algorithm(squareWidth, squareHeight, polygons);
};
