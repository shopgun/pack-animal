// import { Matrix } from "./vendor/matrix";

import {
  IPoint,
  IPolygon,
  packUtilization,
  //  polygonBounds,
  polygonHeight,
  polygonWidth
  //  rotateMatrixAroundPoint
} from "./geometry";

import { /* average, */ standardDeviation } from "./maths";
import { IPostProcessTransformsOptions, ITransform, postProcessTransforms } from "./transform";
import { noop, PackAnimalException } from "./utilities";

import { greedyPack, groupPack, linePack, patternPack, singlePack } from "./algorithms";
import { IGreedyPackOptions, RotationMode } from "./algorithms/greedyPack";

export interface IPackAnimalOptions {
  debug?: boolean;
  algorithmOptions?: IGreedyPackOptions;
  recursion?: number;
  averageArea?: number;
  isGroupPack?: boolean;
}

const packAnimal = (
  rectangleWidth: number,
  rectangleHeight: number,
  polygonList: IPoint[][],
  packAnimalOptions: IPackAnimalOptions & IPostProcessTransformsOptions = {}
): ITransform[] => {
  const polygons: IPolygon[] = polygonList.map((points: IPoint[], index) => ({ points, index }));
  const {
    center = true,
    rotate = true,
    margin = 0,
    maximize = true,
    postPackPolygonScale,
    jitter,
    algorithmOptions = {},
    //    recursion = 0,
    averageArea = 0,
    isGroupPack = false,
    /* istanbul ignore next */ debug: dbug = false
  } = packAnimalOptions;
  const debug = dbug ? console.log : noop;
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
    polygons.map(({ points }) => polygonWidth(points) / polygonHeight(points))
  );

  interface IPolygonGroups {
    [key: string]: IPolygon[];
  }
  const polygonsGroupedByRatio: IPolygonGroups = polygons.reduce(
    (memo: IPolygonGroups, polygon) => {
      const ratio = polygonWidth(polygon.points) / polygonHeight(polygon.points);
      const groupRatio = ratio > 1.15 ? "landscape" : ratio < 0.85 ? "portrait" : "square";
      return {
        ...memo,
        [groupRatio]: [...(memo[groupRatio] || []), polygon]
      };
    },
    {}
  );
  const groupedPolygons: IPolygon[][] = Object.keys(polygonsGroupedByRatio).map(
    key => polygonsGroupedByRatio[key]
  );
  if (polygons.length === 1) {
    polygonTransforms = singlePack(rectangleWidth, rectangleHeight, polygons, {
      averageArea,
      debug,
      rotate
    });
  } else if (polygons.length > 1 && aspectRatioDeviation < 1 / 2) {
    polygonTransforms = patternPack(rectangleWidth, rectangleHeight, polygons, {
      averageArea,
      debug
    });
  } else if (
    groupedPolygons.length > 1 &&
    groupedPolygons.some(polygonsGroup => polygonsGroup.length > 1) &&
    !isGroupPack
  ) {
    polygonTransforms = groupPack(rectangleWidth, rectangleHeight, groupedPolygons, {
      debug
    });
  } else {
    polygonTransforms = greedyPack(rectangleWidth, rectangleHeight, polygons, {
      debug,
      ...algorithmOptions,
      averageArea,
      ...(rotate ? {} : { rotationMode: RotationMode.Off })
    });
  }
  polygonTransforms = postProcessTransforms(rectangleWidth, rectangleHeight, polygonTransforms, {
    center,
    jitter,
    margin,
    maximize,
    postPackPolygonScale
  });

  const utilization = packUtilization(
    rectangleWidth,
    rectangleHeight,
    polygonTransforms.map(({ points }) => points)
  );
  /* istanbul ignore next */
  if (dbug) {
    // tslint:disable-next-line
    console.timeEnd("packAnimal");
    // tslint:disable-next-line
    console.log(Math.round(utilization * 100) + "%");
  }
  if (true && utilization < 0.3) {
    let newTransforms = [
      linePack(rectangleWidth, rectangleHeight, polygons, false, { debug, averageArea }),
      linePack(rectangleWidth, rectangleHeight, polygons, true, { debug, averageArea })
    ].sort(
      (a, b) =>
        packUtilization(rectangleWidth, rectangleHeight, a.map(({ points }) => points)) -
        packUtilization(rectangleWidth, rectangleHeight, b.map(({ points }) => points))
    )[1];
    newTransforms = postProcessTransforms(rectangleWidth, rectangleHeight, newTransforms, {
      center,
      jitter,
      margin,
      maximize,
      postPackPolygonScale
    });
    const newUtilization = packUtilization(
      rectangleWidth,
      rectangleHeight,
      newTransforms.map(({ points }) => points)
    );
    // Only use the desperate linepack if it's actually "better".
    if (newUtilization > utilization) {
      /* istanbul ignore next */
      if (dbug) {
        // tslint:disable-next-line
        console.log(Math.round(newUtilization * 100) + "%");
      }
      return newTransforms;
    }
  }
  return polygonTransforms;
};

export default packAnimal;
