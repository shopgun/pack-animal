import {
  doPolygonsOverlap,
  IPoint,
  ITransform,
  isPolygonWithinRectangle,
  polygonArea,
  rotateMatrixAroundPoint,
  verifyPack
} from "../geometry";
import { Matrix } from "../vendor/matrix";

export const bogoPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][]
): ITransform[] => {
  if (!polygons.length) {
    return [];
  }
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
  let transformPolygons: ITransform[];

  let i = 0;
  let scale = 1;
  do {
    scale = scale > 0.5 ? scale - 0.0005 : 1;
    transformPolygons = polygons.map(points => {
      const width = Math.max(...points.map(point => point.x));
      const height = Math.max(...points.map(point => point.y));
      const rotate = Math.round(Math.random() * 180 - 90);
      const translateX = Math.round(Math.random() * rectangleWidth / 2);
      const translateY = Math.round(Math.random() * rectangleHeight / 2);
      const m = rotateMatrixAroundPoint(
        { x: width / 2, y: height / 2 },
        rotate
      );

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
  } while (!verifyPack(transformPolygons, rectangle));

  return transformPolygons;
};
