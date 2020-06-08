import { linePack } from "./linePack";

describe("linePack", () => {
  it("works", () => {
    const polygonTransforms = linePack(
      800,
      742,
      [[{ x: 1, y: 1 }, { x: 1, y: 366 }, { x: 798, y: 366 }, { x: 798, y: 1 }]].map(
        (points, index) => ({ points, index })
      )
    );
    expect(polygonTransforms).toMatchSnapshot();

    const polygonTransforms2 = linePack(
      720,
      300,
      [
        [{ x: 0, y: 0 }, { x: 138, y: 0 }, { x: 138, y: 324 }, { x: 0, y: 324 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 163, y: 0 }, { x: 163, y: 349 }, { x: 0, y: 349 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 148, y: 0 }, { x: 148, y: 364 }, { x: 0, y: 364 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 150, y: 0 }, { x: 150, y: 350 }, { x: 0, y: 350 }, { x: 0, y: 0 }]
      ].map((points, index) => ({ points, index })),
      720 > 300,
      { margin: 12 }
    );
    expect(polygonTransforms2).toMatchSnapshot();
  });
});
