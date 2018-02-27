import {
  IPoint,
  polygonBounds,
  polygonCenter,
  polygonHeight,
  polygonsBounds,
  polygonWidth,
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
  zIndex: number;
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
  const transformedPoints = matrix.applyToArray(points);
  const simpleTransform = matrix.decompose();
  const scale = simpleTransform.scale.x;
  const width = polygonWidth(transformedPoints);
  const height = polygonHeight(transformedPoints);
  const center = polygonCenter(transformedPoints);
  const relativeHeight = height / rectangleHeight;
  const relativeWidth = width / rectangleWidth;
  const translateXRelative = simpleTransform.translate.x / width;
  const translateYRelative = simpleTransform.translate.y / height;
  const degreesRotation = radiansToDegrees(simpleTransform.rotation);
  // zIndex === bottommost y position
  const zIndex = parseInt(
    [`${center.y}`.padStart(10, "0"), `${center.x}`.padStart(10, "0")].join(""),
    10
  );
  return {
    cssText: `
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        width: ${relativeWidth * 100}%;
        height: ${relativeHeight * 100}%;
        z-index: ${zIndex};
        transform: ${[
          `translateX(${translateXRelative * 100}%)`,
          `translateY(${translateYRelative * 100}%)`,
          `rotate(${degreesRotation}deg)`
        ].join(" ")}
      `,
    matrix,
    points: transformedPoints,
    rotate: degreesRotation,
    scale,
    svgTransform: matrix.toCSS(),
    translateX: simpleTransform.translate.x,
    translateY: simpleTransform.translate.y,
    zIndex
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

export const marginalizePolygonTransforms = (
  margin: number,
  rectangleWidth: number,
  rectangleHeight: number,
  polygonTransforms: ITransform[]
): ITransform[] =>
  polygonTransforms.map(({ matrix, points }) => {
    const width = polygonWidth(points);
    const scale = (width - margin) / width;
    return getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      matrix.inverse().applyToArray(points),
      scaleMatrixAroundPoint(polygonCenter(matrix.inverse().applyToArray(points)), scale, matrix)
    );
  });

export const maximizePolygonTransforms = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonTransforms: ITransform[]
): ITransform[] => {
  const packBounds = polygonsBounds(polygonTransforms.map(({ points }) => points));
  const rectangleCenter = { x: rectangleWidth / 2, y: rectangleHeight / 2 };
  const width = polygonWidth(packBounds);
  const height = polygonHeight(packBounds);
  let scale: number;
  if (rectangleWidth / width >= rectangleHeight / height) {
    scale = rectangleHeight / height;
  } else {
    scale = rectangleWidth / width;
  }
  const polygonTransformz = polygonTransforms.map(({ matrix, points }) => {
    const polyCenter = polygonCenter(points);
    return getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      matrix.inverse().applyToArray(points),
      scaleMatrixAroundPoint(
        polygonCenter(matrix.inverse().applyToArray(points)),
        scale,
        Matrix.from(
          matrix.a,
          matrix.b,
          matrix.c,
          matrix.d,
          matrix.e + -(rectangleCenter.x - polyCenter.x) * (scale - 1),
          matrix.f + -(rectangleCenter.y - polyCenter.y) * (scale - 1)
        )
      )
    );
  });

  const newPackCenter = polygonCenter(
    polygonsBounds(polygonTransformz.map(({ points }) => points))
  );
  // recenter pack and return
  // maybe some day find out why this is necessary,
  // but this is quite cheap and I'm not smart enough.
  // probably just inaccuracy tho
  return polygonTransformz.map(({ matrix, points }) =>
    getPolygonTransform(
      rectangleWidth,
      rectangleHeight,
      matrix.inverse().applyToArray(points),
      Matrix.from(
        matrix.a,
        matrix.b,
        matrix.c,
        matrix.d,
        matrix.e + rectangleCenter.x - newPackCenter.x,
        matrix.f + rectangleCenter.y - newPackCenter.y
      )
    )
  );
};
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
