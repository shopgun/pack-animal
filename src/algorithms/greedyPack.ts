import { IPoint, rotateMatrixAroundPoint, verifyPack } from "../geometry";
import { getPolygonTransform, ITransform } from "../transform";
import { Matrix } from "../vendor/matrix";

export const greedyPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][]
): ITransform[] => {
  if (!polygons.length) {
    return [];
  }
  const rectangle: IPoint[] = [{ x: 0, y: 0 }, { x: rectangleWidth, y: rectangleHeight }];
  let polygonTransforms;
  const scaleIncrement = 0.01;
  const translateXIncrement = rectangleWidth * 0.01;
  const translateYIncrement = rectangleHeight * 0.01;
  const rotateIncrement = 4;

  const scaleInitial = 1;
  const rotateInitial = 0;
  const translateXInitial = 0;
  const translateYInitial = 0;
  let scale: number;
  let j = 0;

  do {
    scale = scaleInitial - scaleIncrement * j;
    polygonTransforms = polygons.reduce((memo: ITransform[], points: IPoint[]): ITransform[] => {
      const width = Math.floor(
        (Math.max(...points.map(point => point.x)) - Math.min(...points.map(point => point.x))) *
          scale
      );
      const height = Math.floor(
        (Math.max(...points.map(point => point.y)) - Math.min(...points.map(point => point.y))) *
          scale
      );
      const memoPoints = memo.map(transformPoly => transformPoly.points);
      const center = { x: width / 2, y: height / 2 };

      let rotate = rotateInitial;
      let translateX = translateXInitial;
      let translateY = translateYInitial;
      let transformedPoints;
      let i;
      let previousTranslateY = null;
      i = 0;
      do {
        previousTranslateY = translateY;
        translateY = translateYInitial + translateYIncrement * i;
        const m = new Matrix();
        m.multiply(new Matrix().translate(translateX, translateY).scale(scale, scale));
        transformedPoints = m.applyToArray(points);
        i++;
      } while (verifyPack([...memoPoints, transformedPoints], rectangle));
      translateY = previousTranslateY;

      let previousTranslateX = null;
      i = 0;
      do {
        previousTranslateX = translateX;
        translateX = translateXInitial + translateXIncrement * i;
        const m = new Matrix();
        m.multiply(new Matrix().translate(translateX, translateY).scale(scale, scale));
        transformedPoints = m.applyToArray(points);
        i++;
      } while (verifyPack([...memoPoints, transformedPoints], rectangle));
      translateX = previousTranslateX;

      let previousRotate = null;
      i = 0;
      do {
        previousRotate = rotate;
        rotate = rotateInitial + rotateIncrement * i;
        const m = rotateMatrixAroundPoint(center, rotate);
        m.multiply(new Matrix().translate(translateX, translateY).scale(scale, scale));
        transformedPoints = m.applyToArray(points);
        i++;
      } while (verifyPack([...memoPoints, transformedPoints], rectangle));

      const finalMatrix = rotateMatrixAroundPoint(center, previousRotate);
      finalMatrix.translate(translateX, translateY).scale(scale, scale);

      memo.push(getPolygonTransform(rectangleWidth, rectangleHeight, points, finalMatrix));
      return memo;
    }, []);
    j++;
  } while (!verifyPack(polygonTransforms.map(({ points }) => points), rectangle));

  return polygonTransforms;
};
