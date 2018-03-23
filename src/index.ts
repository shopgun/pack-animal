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
import {
  IPostProcessTransformsOptions,
  ITransform,
  packRatio,
  postProcessTransforms
} from "./transform";
import { noop, PackAnimalException } from "./utilities";

import { greedyPack, linePack, patternPack, singlePack } from "./algorithms";
import { IGreedyPackOptions } from "./algorithms/greedyPack";

export interface IPackAnimalOptions {
  debug?: boolean;
  algorithmOptions?: IGreedyPackOptions;
  recursion?: number;
  isGroupPack?: boolean;
  averageArea?: number;
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
    //    isGroupPack = false,
    averageArea = 0,
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
  /*
  interface IPolygonGroups {
    [key: string]: IPolygon[];
  }
  const polygonsGroupedByRatio: IPolygonGroups = polygons.reduce(
    (memo: IPolygonGroups, polygon) => {
      const ratio = polygonWidth(polygon.points) / polygonHeight(polygon.points);
      const groupRatio = ratio > 1.2 ? "landscape" : ratio < 0.8 ? "portrait" : "square";
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

  if (!isGroupPack && groupedPolygons.length > 1) {
    polygonTransforms = groupPack(rectangleWidth, rectangleWidth, groupedPolygons, {
      debug
    });
  } else*/ if (
    polygons.length === 1
  ) {
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
  } else {
    polygonTransforms = greedyPack(rectangleWidth, rectangleHeight, polygons, {
      debug,
      ...algorithmOptions,
      averageArea,
      ...(rotate ? {} : { rotationMode: "OFF" })
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
  if (utilization < 0.2) {
    const rectangleRatio = rectangleWidth / rectangleHeight;
    let newTransforms = [
      linePack(rectangleWidth, rectangleHeight, polygons, false, { debug, averageArea }),
      linePack(rectangleWidth, rectangleHeight, polygons, true, { debug, averageArea })
    ].sort(
      (a, b) => Math.abs(packRatio(a) - rectangleRatio) - Math.abs(packRatio(b) - rectangleRatio)
    )[0];
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
    // Only use the new pack with potentially unsightly rotations if the utilization is somewhat better.
    if (newUtilization - 0.05 > utilization) {
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
