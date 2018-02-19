import packAnimal from ".";

describe("packAnimal", () => {
  it("needs polygons to pack", () => {
    expect(() => packAnimal(0, 0, [])).toThrow();
  });
  it("doesn't like pointless polygons", () => {
    expect(() => packAnimal(0, 0, [[]])).toThrow();
  });
  it("doesn't like undersize rectangles", () => {
    expect(() => packAnimal(-1, 0, [[{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]])).toThrow();
    expect(() => packAnimal(0, -1, [[{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]])).toThrow();
  });
  it("center option can be disabled", () => {
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
  });
  it("postPackPolygonScale option works", () => {
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
  });
  it("it works", () => {
    expect(
      packAnimal(50, 50, [
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
      ])
    ).toMatchSnapshot();
    expect(
      packAnimal(50, 50, [[{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]])
    ).toMatchSnapshot();
    expect(
      packAnimal(50, 50, [
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
        [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
      ])
    ).toMatchSnapshot();
  });
  it("jitter option works", () => {
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
  });
  it("margin option works", () => {
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { margin: 2 }
      )
    ).toMatchSnapshot();
  });
  it("rotation can be disabled", () => {
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
  it("maximizing can be disabled", () => {
    expect(
      packAnimal(
        50,
        50,
        [
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
          [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }]
        ],
        { maximize: false }
      )
    ).toMatchSnapshot();
  });
});
