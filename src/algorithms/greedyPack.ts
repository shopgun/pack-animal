import { IPoint, IVerifyPackOptions, rotateMatrixAroundPoint, verifyPack } from "../geometry";
import { getPolygonTransform, ITransform } from "../transform";
import { Matrix } from "../vendor/matrix";

export enum RotationMode {
  Off,
  Simple = "SIMPLE",
  Advanced = "ADVANCED"
}

export interface IGreedyPackOptions {
  rotationMode?: RotationMode;
  polygonHitboxScale?: number;
  rectangleHitboxScale?: number;
}

enum MatrixAttribute {
  translateX = "translateX",
  translateY = "translateY"
}
const maxMatrix = (
  attribute: MatrixAttribute,
  matrix: Matrix,
  increment: number,
  points: IPoint[],
  verifier: (transformedPoints: IPoint[]) => boolean
): number => {
  let i = 0;
  let previousValue = null;
  let transformedPoints: IPoint[];
  const { scale, translate: { x, y } } = matrix.decompose();
  const initial = attribute === MatrixAttribute.translateX ? x : y;
  let value = initial;
  do {
    previousValue = value;
    value = initial + increment * i;
    const m = new Matrix()
      .translate(x, y)
      [attribute](value)
      .scaleU(scale.x);
    transformedPoints = m.applyToArray(points);
    i++;
  } while (verifier(transformedPoints));
  return previousValue;
};

export const greedyPack = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  { rotationMode = RotationMode.Simple, polygonHitboxScale }: IGreedyPackOptions = {}
): ITransform[] => {
  if (!polygons.length) {
    return [];
  }
  const rectangle: IPoint[] = [{ x: 0, y: 0 }, { x: rectangleWidth, y: rectangleHeight }];
  let polygonTransforms;
  const scaleIncrement = 0.025;
  const translateXIncrement = rectangleWidth * 0.01;
  const translateYIncrement = rectangleHeight * 0.01;
  const rotateIncrement = 1;

  const scaleInitial = 1;
  const rotateInitial = 0;
  const translateXInitial = 0;
  const translateYInitial = 0;
  let scale: number;
  let j = 0;
  const verifyPackOptions: IVerifyPackOptions = {
    polygonHitboxScale
  };
  do {
    scale = scaleInitial - scaleIncrement * j;
    polygonTransforms = polygons.reduce((memo: ITransform[], points: IPoint[]): ITransform[] => {
      const memoPoints = memo.map(transformPoly => transformPoly.points);
      const verifier = (newPoints: IPoint[]) =>
        verifyPack([...memoPoints, newPoints], rectangle, verifyPackOptions);

      let rotate = rotateInitial;
      let translateX = translateXInitial;
      let translateY = translateYInitial;
      let transformedPoints;
      let i;
      translateY = maxMatrix(
        MatrixAttribute.translateY,
        new Matrix().translate(translateX, translateY).scaleU(scale),
        translateYIncrement,
        points,
        verifier
      );

      translateX = maxMatrix(
        MatrixAttribute.translateX,
        new Matrix().translate(translateX, translateY).scaleU(scale),
        translateXIncrement,
        points,
        verifier
      );

      let finalMatrix = new Matrix();
      if (rotationMode === RotationMode.Advanced) {
        finalMatrix = new Matrix()
          .translate(translateX, translateY)
          .scale(scale, scale)
          .applyToArray(points)
          .reduce((memoMatrix, point) => {
            let previousRotate = null;
            i = 0;
            do {
              previousRotate = rotate;
              rotate = rotateInitial + rotateIncrement * i;
              const m = rotateMatrixAroundPoint(point, rotate, memoMatrix);
              m.multiply(new Matrix().translate(translateX, translateY).scale(scale, scale));
              transformedPoints = m.applyToArray(points);
              i++;
            } while (verifier(transformedPoints) && rotate <= 22.5);

            return rotateMatrixAroundPoint(point, previousRotate, memoMatrix);
          }, new Matrix());
      }

      if (rotationMode === RotationMode.Simple) {
        const width = Math.floor(
          Math.max(...points.map(point => point.x)) - Math.min(...points.map(point => point.x))
        );
        const height = Math.floor(
          Math.max(...points.map(point => point.y)) - Math.min(...points.map(point => point.y))
        );
        const center = { x: width / 2, y: height / 2 };
        let previousRotate = null;
        i = 0;
        do {
          previousRotate = rotate;
          rotate = rotateInitial + rotateIncrement * i;
          const m = rotateMatrixAroundPoint(center, rotate);
          m.multiply(new Matrix().translate(translateX, translateY).scale(scale, scale));
          transformedPoints = m.applyToArray(points);
          i++;
        } while (verifier(transformedPoints));

        finalMatrix = rotateMatrixAroundPoint(center, previousRotate);
      }

      finalMatrix.translate(translateX, translateY).scale(scale, scale);

      memo.push(getPolygonTransform(rectangleWidth, rectangleHeight, points, finalMatrix));
      return memo;
    }, []);
    j++;
  } while (
    !verifyPack(polygonTransforms.map(({ points }) => points), rectangle, verifyPackOptions)
  );

  return polygonTransforms;
};
