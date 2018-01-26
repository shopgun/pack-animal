import {
  IPoint,
  polygonCenter,
  polygonsBounds,
  radiansToDegrees,
  scaleMatrixAroundPoint
} from "./geometry";
import { Matrix } from "./vendor/matrix";

export interface ITransform {
  cssText: string;
  rotate: number;
  scale: number;
  translateX: number;
  translateY: number;
  matrix: Matrix;
  points: IPoint[];
  svgTransform: string;
}

export const getPolygonTransform = (
  rectangleWidth: number,
  rectangleHeight: number,
  points: IPoint[],
  matrix: Matrix
): ITransform => {
  const simpleTransform = matrix.decompose();
  const scale = simpleTransform.scale.x;
  const width = Math.floor(
    Math.max(...points.map(point => point.x)) - Math.min(...points.map(point => point.x))
  );
  const height = Math.floor(
    Math.max(...points.map(point => point.y)) - Math.min(...points.map(point => point.y))
  );

  const relativeHeight = height * scale / rectangleHeight;
  const relativeWidth = width * scale / rectangleWidth;
  const translateXRelative = simpleTransform.translate.x / (width * scale);
  const translateYRelative = simpleTransform.translate.y / (height * scale);
  const degreesRotation = radiansToDegrees(simpleTransform.rotation);
  return {
    cssText: `
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        width: ${relativeWidth * 100}%;
        height: ${relativeHeight * 100}%;
        transform: ${[
          `translateX(${translateXRelative * 100}%)`,
          `translateY(${translateYRelative * 100}%)`,
          `rotate(${degreesRotation}deg)`
        ].join(" ")}
      `,
    matrix,
    points: matrix.applyToArray(points),
    rotate: degreesRotation,
    scale,
    svgTransform: matrix.toCSS(),
    translateX: simpleTransform.translate.x,
    translateY: simpleTransform.translate.y
  };
};

export const centerPolygonTransforms = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonTransforms: ITransform[]
): ITransform[] => {
  const packBounds = polygonsBounds(polygonTransforms.map(({ points }) => points));
  const centeringTranslateX = (packBounds[2].x - packBounds[0].x - rectangleWidth) / 2;
  const centeringTranslateY = (packBounds[2].y - packBounds[0].y - rectangleHeight) / 2;
  const translateXpoz =
    centeringTranslateX + packBounds[2].x <= rectangleWidth &&
    centeringTranslateX + packBounds[0].x > 0;
  const translateYpoz =
    centeringTranslateY + packBounds[2].y <= rectangleHeight &&
    centeringTranslateY + packBounds[0].y > 0;
  return polygonTransforms.map(({ matrix, points }) =>
    getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      matrix.inverse().applyToArray(points),
      Matrix.from(
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        translateXpoz ? matrix.e + centeringTranslateX : matrix.e - centeringTranslateX,
        translateYpoz ? matrix.f + centeringTranslateY : matrix.f - centeringTranslateY
      )
    )
  );
};

export const scalePolygonTransforms = (
  scale: number,
  rectangleWidth: number,
  rectangleHeight: number,
  polygonTransforms: ITransform[]
): ITransform[] =>
  polygonTransforms.map(({ matrix, points }) =>
    getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      matrix.inverse().applyToArray(points),
      scaleMatrixAroundPoint(polygonCenter(matrix.inverse().applyToArray(points)), scale, matrix)
    )
  );
