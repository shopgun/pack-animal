import packAnimal from ".";
import { bogoPack } from "./algorithms/bogoPack";

describe("packAnimal", () => {
  it("needs polygons to pack", () => {
    expect(() => packAnimal(0, 0, [])).toThrow();
  });
  it("doesn't like pointless polygons", () => {
    expect(() => packAnimal(0, 0, [[]])).toThrow();
  });
  it("can take an alternative algorithm", () => {
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { algorithm: bogoPack }
      )
    ).toBeTruthy();
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { center: false }
      )
    ).toMatchSnapshot();
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { postPackPolygonScale: 0.9 }
      )
    ).toMatchSnapshot();
    expect(
      packAnimal(50, 50, [
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
      ])
    ).toMatchSnapshot();
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { jitter: { position: 50, scale: 0.2 } }
      )
    ).toMatchSnapshot();
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { jitter: { rotate: 20 } }
      )
    ).toMatchSnapshot();
    expect(
      packAnimal(50, 50, [[{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]])
    ).toMatchSnapshot();
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { margin: 5 }
      )
    ).toMatchSnapshot();
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { rotate: false }
      )
    ).toMatchSnapshot();
  });
});
