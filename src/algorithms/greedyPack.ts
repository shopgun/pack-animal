import {
  IPoint,
  IPolygon,
  IVerifyPackOptions,
  polygonArea,
  polygonCenter,
  polygonHeight,
  rotateMatrixAroundPoint,
  verifyPack
} from "../geometry";
import { average } from "../maths";
import { getPolygonTransform, ITransform } from "../transform";
import { btoa, noop, PackAnimalException, setArrayOrder } from "../utilities";
import { Matrix } from "../vendor/matrix";
export enum RotationMode {
  Off = "OFF",
  Simple = "SIMPLE",
  Advanced = "ADVANCED"
}

export interface IGreedyPackOptions {
  rotationMode?: RotationMode;
  normalizePolygons?: boolean;
  polygonHitboxScale?: number;
  debug?: (message?: any, ...optionalParams: any[]) => void;
  averageArea?: number;
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
  const {
    scale,
    translate: { x, y }
  } = matrix.decompose();
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
  polygonList: IPolygon[],
  {
    normalizePolygons = true,
    rotationMode = RotationMode.Simple,
    polygonHitboxScale,
    debug: dbug = noop,
    averageArea: averageAreaOption = 0
  }: IGreedyPackOptions = {}
): ITransform[] => {
  const polygons = polygonList.map(({ points }) => points);
  // Wrap debug function to include current algorithm.
  const debug = (...args: any[]) => dbug("greedyPack:", ...args);
  // Write out said algorithm entry.
  debug();
  const length = polygons.length;
  if (!length) {
    return [];
  }
  const rectangle: IPoint[] = [{ x: 0, y: 0 }, { x: rectangleWidth, y: rectangleHeight }];
  let polygonTransforms: ITransform[];
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
  const averageArea = averageAreaOption || average(polygons.map(points => polygonArea(points)));
  const polygonsOrder = Array.from({ length }, (_, i) => i).sort(
    (a, b) =>
      polygonHeight(polygons[b]) * ((averageArea / polygonArea(polygons[b]) - 1) / 2 + 1) -
      polygonHeight(polygons[a]) * ((averageArea / polygonArea(polygons[a]) - 1) / 2 + 1)
  );
  do {
    scale = scaleInitial - scaleIncrement * j;
    if (scale <= 0) {
      throw new PackAnimalException(
        "greedyPack failure to pack, please open an issue at https://github.com/shopgun/pack-animal/issues and include this data:\n" +
          btoa(
            JSON.stringify({
              polygons,
              rectangleHeight,
              rectangleWidth
            })
          ),
        {
          polygons,
          rectangleHeight,
          rectangleWidth,
          scale
        }
      );
    }
    polygonTransforms = polygonsOrder.reduce((memo: ITransform[], polyI: number): ITransform[] => {
      const points = polygons[polyI];
      if (!points.length) {
        throw new PackAnimalException("No pointless polygons allowed.", { points, polygons });
      }
      const memoPoints = memo.map(transformPoly => transformPoly.points);
      const verifier = (newPoints: IPoint[]) =>
        verifyPack([...memoPoints, newPoints], rectangle, verifyPackOptions);
      const normalizedScale = normalizePolygons
        ? scale * ((averageArea / polygonArea(points) - 1) / 2 + 1)
        : scale;
      let rotate = rotateInitial;
      let translateX = translateXInitial;
      let translateY = translateYInitial;
      let transformedPoints;
      let i;

      if (rectangleHeight > rectangleWidth) {
        translateX = maxMatrix(
          MatrixAttribute.translateX,
          new Matrix().translate(translateX, translateY).scaleU(normalizedScale),
          translateXIncrement,
          points,
          verifier
        );
        translateY = maxMatrix(
          MatrixAttribute.translateY,
          new Matrix().translate(translateX, translateY).scaleU(normalizedScale),
          translateYIncrement,
          points,
          verifier
        );
      } else {
        translateY = maxMatrix(
          MatrixAttribute.translateY,
          new Matrix().translate(translateX, translateY).scaleU(normalizedScale),
          translateYIncrement,
          points,
          verifier
        );
        translateX = maxMatrix(
          MatrixAttribute.translateX,
          new Matrix().translate(translateX, translateY).scaleU(normalizedScale),
          translateXIncrement,
          points,
          verifier
        );
      }

      let finalMatrix = new Matrix();
      if (rotationMode === RotationMode.Advanced) {
        finalMatrix = new Matrix()
          .translate(translateX, translateY)
          .scale(scale, scale)
          .applyToArray(points)
          .reduce((memoMatrix, point) => {
            let previousRotate = null;
            rotate = rotateInitial;
            i = 0;
            do {
              previousRotate = rotate;
              rotate = rotateInitial + rotateIncrement * i;
              const m = rotateMatrixAroundPoint(point, rotate, memoMatrix);
              m.multiply(new Matrix().translate(translateX, translateY).scaleU(normalizedScale));
              transformedPoints = m.applyToArray(points);
              i++;
            } while (verifier(transformedPoints) && rotate <= 1080);

            return rotateMatrixAroundPoint(point, previousRotate, memoMatrix);
          }, new Matrix());
      }

      if (rotationMode === RotationMode.Simple) {
        const center = polygonCenter(points);
        let previousRotate = null;
        rotate = rotateInitial;
        i = 0;
        do {
          previousRotate = rotate;
          rotate = rotateInitial + rotateIncrement * i;
          const m = rotateMatrixAroundPoint(center, rotate);
          m.multiply(new Matrix().translate(translateX, translateY).scaleU(normalizedScale));
          transformedPoints = m.applyToArray(points);
          i++;
        } while (verifier(transformedPoints));

        finalMatrix = rotateMatrixAroundPoint(center, previousRotate);
      }

      finalMatrix.translate(translateX, translateY).scaleU(normalizedScale);

      memo.push(getPolygonTransform(rectangleWidth, rectangleHeight, points, finalMatrix));
      return memo;
    }, []);
    j++;
  } while (
    !verifyPack(polygonTransforms.map(({ points }) => points), rectangle, verifyPackOptions)
  );

  return setArrayOrder(polygonsOrder, polygonTransforms);
};
