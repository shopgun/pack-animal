import { Matrix } from "./vendor/matrix";

import {
  IPoint,
  packUtilization,
  polygonBounds,
  polygonHeight,
  polygonWidth,
  rotateMatrixAroundPoint
} from "./geometry";

import { average, standardDeviation } from "./maths";
import {
  centerPolygonTransforms,
  getPolygonTransform,
  IJitterOptions,
  ITransform,
  jitterPolygonTransforms,
  marginalizePolygonTransforms,
  maximizePolygonTransforms,
  scalePolygonTransforms
} from "./transform";
import { noop, PackAnimalException } from "./utilities";

import { greedyPack, patternPack, singlePack } from "./algorithms";
import { IGreedyPackOptions } from "./algorithms/greedyPack";

export interface IPackAnimalOptions {
  center?: boolean;
  rotate?: boolean;
  margin?: number;
  maximize?: boolean;
  postPackPolygonScale?: number;
  debug?: boolean;
  algorithmOptions?: IGreedyPackOptions;
  jitter?: IJitterOptions;
  recursion?: number;
}

const packAnimal = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygons: IPoint[][],
  packAnimalOptions: IPackAnimalOptions = {}
): ITransform[] => {
  const {
    center = true,
    rotate = true,
    margin = 0,
    maximize = true,
    postPackPolygonScale,
    jitter,
    algorithmOptions = {},
    recursion = 0,
    /* istanbul ignore next */ debug = false
  } = packAnimalOptions;
  if (!polygons || !polygons.length) {
    throw new PackAnimalException("No polygons to pack, there must be at least one.", { polygons });
  }
  if (rectangleWidth < 0 || rectangleHeight < 0) {
    throw new PackAnimalException("Rectangle width/height too small, must be positive", {
      rectangleHeight,
      rectangleWidth
    });
  }
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.time("packAnimal");
  }
  let polygonTransforms: ITransform[];
  const aspectRatioDeviation = standardDeviation(
    polygons.map(polygon => polygonWidth(polygon) / polygonHeight(polygon))
  );
  if (polygons.length === 1) {
    polygonTransforms = singlePack(rectangleWidth, rectangleHeight, polygons, { rotate });
  } else if (polygons.length > 1 && aspectRatioDeviation < 1 / 3) {
    polygonTransforms = patternPack(rectangleWidth, rectangleHeight, polygons, {
      debug: /* istanbul ignore next */ debug ? console.log : noop
    });
  } else {
    polygonTransforms = greedyPack(rectangleWidth, rectangleHeight, polygons, {
      ...algorithmOptions,
      ...(rotate ? {} : { rotationMode: "OFF" })
    });
  }
  if (
    center &&
    polygons.length !== 1 /* ignore `center`, single polys are already centered by singlePack*/
  ) {
    polygonTransforms = centerPolygonTransforms(rectangleWidth, rectangleHeight, polygonTransforms);
  }
  if (maximize) {
    polygonTransforms = maximizePolygonTransforms(
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
  }
  if (margin) {
    polygonTransforms = marginalizePolygonTransforms(
      margin,
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
  }
  if (postPackPolygonScale) {
    polygonTransforms = scalePolygonTransforms(
      postPackPolygonScale,
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
  }
  if (jitter) {
    polygonTransforms = jitterPolygonTransforms(
      jitter,
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
  }
  if (maximize) {
    polygonTransforms = maximizePolygonTransforms(
      rectangleWidth,
      rectangleHeight,
      polygonTransforms
    );
  }

  const utilization = packUtilization(
    rectangleWidth,
    rectangleHeight,
    polygonTransforms.map(({ points }) => points)
  );
  /* istanbul ignore next */
  if (debug) {
    // tslint:disable-next-line
    console.timeEnd("packAnimal");
    // tslint:disable-next-line
    console.log(Math.round(utilization * 100) + "%");
  }

  if (utilization < 0.65 && recursion < 1) {
    const polygonRatios = polygons.map(poly => polygonWidth(poly) / polygonHeight(poly));
    const averageRatio = average(polygonRatios);
    let polygonsToRotate = polygons.map((_, index) => {
      const polygonRatio = polygonRatios[index];
      if ((averageRatio > 1 && polygonRatio > 1) || (averageRatio < 1 && polygonRatio < 1)) {
        return false;
      }
      if (polygonRatio < 1.1 && polygonRatio > 0.9) {
        return false;
      }
      return true;
    });
    polygonsToRotate = polygonsToRotate.every(i => !i)
      ? polygonsToRotate.map(
          (_, index) => true && (polygonRatios[index] > 1.1 && polygonRatios[index] < 0.9)
        )
      : polygonsToRotate;
    const rotatedPolygons = polygons.map((polygon, index) => {
      if (!polygonsToRotate[index]) {
        return polygon;
      }
      const newBounds = polygonBounds(new Matrix().rotateDeg(90).applyToArray(polygon));
      return new Matrix()
        .translateX(-newBounds[0].x)
        .translateY(-newBounds[0].y)
        .rotateDeg(90)
        .applyToArray(polygon);
    });
    const newPack = packAnimal(rectangleWidth, rectangleHeight, rotatedPolygons, {
      ...packAnimalOptions,
      recursion: 1
    });
    const newTransforms = newPack.map((polygonTransform, index) => {
      if (!polygonsToRotate[index]) {
        return polygonTransform;
      }
      const { matrix, points } = polygonTransform;
      const originalPoints = matrix.inverse().applyToArray(points);
      const preBounds = polygonBounds(points);
      const newTranslateX = polygonWidth(originalPoints) + -preBounds[0].y - preBounds[0].x;
      const newTranslateY = -preBounds[0].x + preBounds[0].y;
      const newMatrix = rotateMatrixAroundPoint(preBounds[0], 90, matrix)
        .translateX(-newTranslateY)
        .translateY(-newTranslateX);
      return getPolygonTransform(rectangleWidth, rectangleHeight, originalPoints, newMatrix);
    });
    const newUtilization = packUtilization(
      rectangleWidth,
      rectangleHeight,
      newTransforms.map(({ points }) => points)
    );
    // Only use the new pack with potentially unsightly rotations if the utilization is somewhat better.
    if (newUtilization - 0.05 > utilization) {
      return newTransforms;
    }
  }
  return polygonTransforms;
};

export default packAnimal;
