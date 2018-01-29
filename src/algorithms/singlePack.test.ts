import { singlePack } from "./singlePack";

describe("greedyPack", () => {
  it("works", () => {
    const polygonTransforms = singlePack(800, 742, [
      [{ x: 1, y: 1 }, { x: 1, y: 366 }, { x: 798, y: 366 }, { x: 798, y: 1 }]
    ]);
    expect(polygonTransforms).toMatchSnapshot();
    const polygonTransforms2 = singlePack(200, 400, [
      [{ x: 1, y: 1 }, { x: 1, y: 366 }, { x: 798, y: 366 }, { x: 798, y: 1 }]
    ]);
    expect(polygonTransforms2).toMatchSnapshot();
    const polygonTransforms3 = singlePack(200, 400, [
      [{ x: 1, y: 1 }, { x: 200, y: 1 }, { x: 200, y: 200 }, { x: 1, y: 200 }]
    ]);
    expect(polygonTransforms3).toMatchSnapshot();
  });
});
