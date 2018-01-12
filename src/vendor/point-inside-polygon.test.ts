import pointInsidePolygon from "./point-inside-polygon";

describe("pointInsidePolygon", () => {
  it("handles point inside", () => {
    expect(
      pointInsidePolygon([1, 1], [[0, 0], [2, 0], [2, 2], [0, 0]])
    ).toBeTruthy();
  });
  it("handles point outside", () => {
    expect(
      pointInsidePolygon([3, 3], [[0, 0], [2, 0], [2, 2], [0, 0]])
    ).toBeFalsy();
  });
});
