import { IPoint, ITransform } from "./geometry";
import { Matrix } from "./vendor/matrix";

export const getPolygonTransform = (
  rectangleWidth: number,
  rectangleHeight: number,
  points: IPoint[],
  matrix: Matrix
): ITransform => {
  const simpleTransform = matrix.decompose();
  const scale = simpleTransform.scale.x;
  const width = Math.floor(
    Math.max(...points.map(point => point.x)) -
      Math.min(...points.map(point => point.x))
  );
  const height = Math.floor(
    Math.max(...points.map(point => point.y)) -
      Math.min(...points.map(point => point.y))
  );

  const relativeHeight = height * scale / rectangleHeight;
  const relativeWidth = width * scale / rectangleWidth;
  const translateXRelative = simpleTransform.translate.x / width;
  const translateYRelative = simpleTransform.translate.y / height;
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
          `rotate(${simpleTransform.rotation}deg)`
        ].join(" ")}
      `,
    matrix,
    points: matrix.applyToArray(points),
    rotate: simpleTransform.rotation,
    scale,
    svgTransform: matrix.toCSS(),
    translateX: simpleTransform.translate.x,
    translateY: simpleTransform.translate.y
  };
};
