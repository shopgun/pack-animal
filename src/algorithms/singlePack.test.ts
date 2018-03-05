import { singlePack } from "./singlePack";

describe("greedyPack", () => {
  it("works", () => {
    const polygonTransforms = singlePack(
      800,
      742,
      [[{ x: 1, y: 1 }, { x: 1, y: 366 }, { x: 798, y: 366 }, { x: 798, y: 1 }]].map(
        (points, index) => ({ points, index })
      )
    );
    expect(polygonTransforms).toMatchSnapshot();
    const polygonTransforms2 = singlePack(
      200,
      400,
      [[{ x: 1, y: 1 }, { x: 1, y: 366 }, { x: 798, y: 366 }, { x: 798, y: 1 }]].map(
        (points, index) => ({ points, index })
      )
    );
    expect(polygonTransforms2).toMatchSnapshot();
    const polygonTransforms3 = singlePack(
      200,
      400,
      [[{ x: 1, y: 1 }, { x: 200, y: 1 }, { x: 200, y: 200 }, { x: 1, y: 200 }]].map(
        (points, index) => ({ points, index })
      )
    );
    expect(polygonTransforms3).toMatchSnapshot();
    expect(
      singlePack(
        200,
        400,
        [[{ x: 1, y: 1 }, { x: 200, y: 1 }, { x: 200, y: 200 }, { x: 1, y: 200 }]].map(
          (points, index) => ({ points, index })
        ),
        { rotate: false }
      )
    ).toMatchSnapshot();
  });
});
