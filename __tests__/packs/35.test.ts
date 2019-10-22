// This test corresponds to the bad pack in the issue of the same number
// https://github.com/shopgun/pack-animal/issues?q=label%3A%22bad+pack%22
import packAnimal from "../../src";
import { packUtilization } from "../../src/geometry";

describe("Bad pack #35", () => {
  const input: any = [
    296,
    183,
    [
      [{ x: 0, y: 0 }, { x: 1251, y: 0 }, { x: 1251, y: 3089 }, { x: 0, y: 3089 }, { x: 0, y: 0 }],
      [{ x: 0, y: 0 }, { x: 2816, y: 0 }, { x: 2816, y: 2905 }, { x: 0, y: 2905 }, { x: 0, y: 0 }],
      [{ x: 0, y: 0 }, { x: 1155, y: 0 }, { x: 1155, y: 2519 }, { x: 0, y: 2519 }, { x: 0, y: 0 }],
      [{ x: 0, y: 0 }, { x: 2340, y: 0 }, { x: 2340, y: 1322 }, { x: 0, y: 1322 }, { x: 0, y: 0 }],
      [{ x: 0, y: 0 }, { x: 3379, y: 0 }, { x: 3379, y: 1867 }, { x: 0, y: 1867 }, { x: 0, y: 0 }]
    ],
    { margin: 6, rotate: true, jitter: { rotate: 0 } }
  ];
  it("Utilizes the rectangle satisfyingly", () => {
    const packedPolygons = packAnimal.apply(void 0, input).map(({ points }: any) => points);
    expect(packUtilization(input[0], input[1], packedPolygons)).toBeGreaterThanOrEqual(0.4);
  });
});
