import { polygonBounds, polygonArea } from "./geometry";

describe("geometry: polygonBounds", () => {
  it("gives a bounding box polygon from any polygon", () => {
    expect(
      polygonBounds([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }])
    ).toEqual([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }]);
  });
});
describe("geometry: polygonArea", () => {
  it("calculates total area from any polygon", () => {
    expect(
      polygonArea([
        { x: 0, y: 0 },
        { x: 0, y: 4 },
        { x: 4, y: 4 },
        { x: 4, y: 0 }
      ])
    ).toEqual(16);
  });
});
