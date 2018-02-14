import { RotationMode } from "./";
import { staggerPack } from "./staggerPack";

describe("staggerPack", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy();
  });
  it("gives nothing for nothingg", () => {
    const polygonTransforms = staggerPack(0, 0, []);
    expect(polygonTransforms).toMatchSnapshot();
  });
  it("works", () => {
    expect(
      staggerPack(800, 742, [
        [{ x: 1, y: 1 }, { x: 1, y: 366 }, { x: 798, y: 366 }, { x: 798, y: 1 }],
        [{ x: 1, y: 1 }, { x: 41, y: 390 }, { x: 773, y: 390 }, { x: 798, y: 1 }],
        [{ x: 1, y: 1 }, { x: 41, y: 390 }, { x: 773, y: 390 }, { x: 798, y: 1 }]
      ])
    ).toMatchSnapshot();
  });
});
