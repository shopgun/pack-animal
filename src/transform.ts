import {
  IPoint,
  polygonCenter,
  polygonsBounds,
  radiansToDegrees,
  rotateMatrixAroundPoint,
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

const Mash = (r: string) => {
  let n = 4022871197;
  let t;
  let s;
  const e = 0.02519603282416938;
  for (let u = 0; u < r.length; u++) {
    s = r.charCodeAt(u);
    const f = e * (n += s) - Math.trunc(n * e);
    n = 4294967296 * ((t = f * Math.trunc(e * n)) - Math.trunc(t)) + Math.trunc(t);
  }
  return Math.trunc(n) * 2.3283064365386963e-10;
};
/* istanbul ignore next */
const Alea = (seed: any = +new Date() + Math.random()) => {
  let a = Mash(" ");
  let b = Mash(" ");
  let c = Mash(" ");
  let x = 1;
  seed = seed.toString();
  a -= Mash(seed);
  b -= Mash(seed);
  c -= Mash(seed);
  if (a < 0) {
    a++;
  }
  if (b < 0) {
    b++;
  }
  if (c < 0) {
    c++;
  }
  return () => {
    const y = x * 2.3283064365386963e-10 + a * 2091639;
    a = b;
    b = c;
    c = y - (x = Math.trunc(y));
    return c;
  };
};

export interface IJitterOptions {
  position?: number;
  rotate?: number;
  scale?: number;
}
export const jitterPolygonTransforms = (
  jitter: IJitterOptions,
  rectangleWidth: number,
  rectangleHeight: number,
  polygonTransforms: ITransform[]
): ITransform[] => {
  const seed = polygonTransforms
    .map(({ points }) => points.map(({ x, y }) => `${x}${y}`).join(""))
    .join("");
  const { rotate = 0, scale = 0, position = 0 } = jitter;
  return polygonTransforms.map(({ matrix, points }, index) => {
    const seededRandom = Alea(index + seed);
    const randomInRange = (min: number, max: number) => seededRandom() * (max - min) + min;
    const center = polygonCenter(matrix.inverse().applyToArray(points));
    return getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      matrix.inverse().applyToArray(points),
      rotateMatrixAroundPoint(
        center,
        randomInRange(-rotate, rotate),
        scaleMatrixAroundPoint(center, randomInRange(1 - scale, 1 + scale), matrix)
      ).translate(randomInRange(-position, position), randomInRange(-position, position))
    );
  });
};
