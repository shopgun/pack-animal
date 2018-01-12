import {
  IPoint,
  ITransform,
  polygonArea,
  rotateMatrixAroundPoint,
  verifyPack
} from "../geometry";
import { Matrix } from "../vendor/matrix";

const polygonBounds = (points: IPoint[]) => {
  const left = Math.min(...points.map(point => point.x));
  const top = Math.min(...points.map(point => point.y));
  const right = Math.max(...points.map(point => point.x));
  const bottom = Math.max(...points.map(point => point.y));
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom }
  ];
};

export const greedyPack = (
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
  let transformPolygons;
  const rawPerfectUtilization = polygons.reduce(
    (memo, polygon) => memo - polygonArea(polygonBounds(polygon)) * 0.8,
    polygonArea(rectanglePolygon)
  );
  let scale = 1;
  let j = 0;
  do {
    scale = scale - 0.01 * j;
    transformPolygons = polygons.reduce(
      (memo: ITransform[], points: IPoint[]): ITransform[] => {
        const width = Math.floor(
          (Math.max(...points.map(point => point.x)) -
            Math.min(...points.map(point => point.x))) *
            scale
        );
        const height = Math.floor(
          (Math.max(...points.map(point => point.y)) -
            Math.min(...points.map(point => point.y))) *
            scale
        );
        const center = { x: width / 2, y: height / 2 };

        let rotate = 0;
        let translateX = 0;
        let translateY = 0;
        let transformPolygon;
        const translateXIncrement = 1;
        const translateYIncrement = 1;
        const rotateIncrement = 4;
        let i = 0;
        let previousTranslateY = null;
        do {
          previousTranslateY = translateY;
          translateY = translateY + translateYIncrement * i;
          const m = new Matrix();
          m.multiply(
            new Matrix().translate(translateX, translateY).scale(scale, scale)
          );
          transformPolygon = {
            cssTransform: m.toCSS(),
            matrix: m,
            points: m.applyToArray(points),
            rotate,
            scale,
            translateX,
            translateY
          };
          i++;
        } while (verifyPack([...memo, transformPolygon], rectangle));
        translateY = previousTranslateY;

        let previousTranslateX = null;
        do {
          previousTranslateX = translateX;
          translateX = translateX + translateXIncrement * i;
          const m = new Matrix();
          m.multiply(
            new Matrix().translate(translateX, translateY).scale(scale, scale)
          );
          transformPolygon = {
            cssTransform: m.toCSS(),
            matrix: m,
            points: m.applyToArray(points),
            rotate,
            scale,
            translateX,
            translateY
          };
          i++;
        } while (verifyPack([...memo, transformPolygon], rectangle));
        translateX = previousTranslateX;

        let previousRotate = null;
        do {
          previousRotate = rotate;
          rotate = rotate + rotateIncrement * i;
          const m = rotateMatrixAroundPoint(center, rotate);
          m.multiply(
            new Matrix().translate(translateX, translateY).scale(scale, scale)
          );
          transformPolygon = {
            cssTransform: m.toCSS(),
            matrix: m,
            points: m.applyToArray(points),
            rotate,
            scale,
            translateX,
            translateY
          };
          i++;
        } while (verifyPack([...memo, transformPolygon], rectangle));

        const finalMatrix = rotateMatrixAroundPoint(center, previousRotate);
        finalMatrix.multiply(
          new Matrix().translate(translateX, translateY).scale(scale, scale)
        );
        transformPolygon = {
          cssTransform: finalMatrix.toCSS(),
          matrix: finalMatrix,
          points: finalMatrix.applyToArray(points),
          rotate,
          scale,
          translateX,
          translateY
        };

        return [...memo, transformPolygon];
      },
      []
    );
    j++;
  } while (!verifyPack(transformPolygons, rectangle));

  return transformPolygons;
};
