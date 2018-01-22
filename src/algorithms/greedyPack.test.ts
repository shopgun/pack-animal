import { RotationMode } from "./";
import { greedyPack } from "./greedyPack";

describe("greedyPack", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy();
  });
  it("gives nothing for nothingg", () => {
    const polygonTransforms = greedyPack(0, 0, []);
    expect(polygonTransforms).toMatchSnapshot();
  });
  it("works", () => {
    const polygonTransforms = greedyPack(800, 742, [
      [{ x: 1, y: 1 }, { x: 1, y: 366 }, { x: 798, y: 366 }, { x: 798, y: 1 }],
      [{ x: 1, y: 1 }, { x: 41, y: 390 }, { x: 773, y: 390 }, { x: 798, y: 1 }]
    ]);
    expect(polygonTransforms).toMatchSnapshot();
    const polygonTransforms2 = greedyPack(
      800,
      742,
      [
        [{ x: 1, y: 1 }, { x: 1, y: 366 }, { x: 798, y: 366 }, { x: 798, y: 1 }],
        [{ x: 1, y: 1 }, { x: 41, y: 390 }, { x: 773, y: 390 }, { x: 798, y: 1 }]
      ],
      { rotationMode: RotationMode.Advanced }
    );
    expect(polygonTransforms2).toMatchSnapshot();
  });
});
