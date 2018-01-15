import {
  IPoint,
  ITransform,
  polygonArea,
  rotateMatrixAroundPoint,
  verifyPack
} from "../geometry";
import { Matrix } from "../vendor/matrix";

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
  const scaleIncrement = 0.001;
  const translateXIncrement = 1;
  const translateYIncrement = 1;
  const rotateIncrement = 4;

  let scale = 1;
  let j = 0;
  do {
    scale = scale - scaleIncrement * j;
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
        const memoPoints = memo.map(transformPoly => transformPoly.points);
        const center = { x: width / 2, y: height / 2 };

        let rotate = 0;
        let translateX = 0;
        let translateY = 0;
        let transformPolygon;
        let transformedPoints;
        let i;
        let previousTranslateY = null;
        i = 0;
        do {
          previousTranslateY = translateY;
          translateY = translateY + translateYIncrement * i;
          const m = new Matrix();
          m.multiply(
            new Matrix().translate(translateX, translateY).scale(scale, scale)
          );
          transformedPoints = m.applyToArray(points);
          i++;
        } while (verifyPack([...memoPoints, transformedPoints], rectangle));
        translateY = previousTranslateY;

        let previousTranslateX = null;
        i = 0;
        do {
          previousTranslateX = translateX;
          translateX = translateX + translateXIncrement * i;
          const m = new Matrix();
          m.multiply(
            new Matrix().translate(translateX, translateY).scale(scale, scale)
          );
          transformedPoints = m.applyToArray(points);
          i++;
        } while (verifyPack([...memoPoints, transformedPoints], rectangle));
        translateX = previousTranslateX;

        let previousRotate = null;
        i = 0;
        do {
          previousRotate = rotate;
          rotate = rotate + rotateIncrement * i;
          const m = rotateMatrixAroundPoint(center, rotate);
          m.multiply(
            new Matrix().translate(translateX, translateY).scale(scale, scale)
          );
          transformedPoints = m.applyToArray(points);
          i++;
        } while (verifyPack([...memoPoints, transformedPoints], rectangle));
        const finalMatrix = rotateMatrixAroundPoint(center, previousRotate);
        finalMatrix.translate(translateX, translateY).scale(scale, scale);
        transformPolygon = {
          cssTransform: finalMatrix.toCSS(),
          matrix: finalMatrix,
          points: finalMatrix.applyToArray(points),
          rotate,
          scale,
          translateX,
          translateY
        };
        memo.push(transformPolygon);
        return memo;
      },
      []
    );
    j++;
  } while (
    !verifyPack(transformPolygons.map(({ points }) => points), rectangle)
  );

  return transformPolygons;
};
