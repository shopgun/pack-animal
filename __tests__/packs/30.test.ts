// This test corresponds to the bad pack in the issue of the same number
// https://github.com/shopgun/pack-animal/issues?q=label%3A%22bad+pack%22
import packAnimal from "../../src";
import { packUtilization } from "../../src/geometry";

describe("Bad pack #29", () => {
  it("Utilizes the rectangle satisfyingly", () => {
    const input: any[] = [
      296,
      307,
      [
        [{ x: 0, y: 0 }, { x: 800, y: 0 }, { x: 800, y: 203 }, { x: 0, y: 203 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 800, y: 0 }, { x: 800, y: 184 }, { x: 0, y: 184 }, { x: 0, y: 0 }],
        [{ x: 0, y: 0 }, { x: 800, y: 0 }, { x: 800, y: 123 }, { x: 0, y: 123 }, { x: 0, y: 0 }]
      ],
      { margin: 6, rotate: true, jitter: { rotate: 0 } }
    ];
    const packedPolygons = packAnimal.apply(this, input).map(({ points }) => points);
    expect(packUtilization(input[0], input[1], packedPolygons)).toBeGreaterThanOrEqual(0.4);
  });
});
