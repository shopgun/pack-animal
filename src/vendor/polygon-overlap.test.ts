import polygonOverlap from "./polygon-overlap";

describe("polygonOverlap", () => {
  it("detects collision", () => {
    const p0 = [[0, 0], [1, 0], [1, 1]];
    const p1 = [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5]];
    expect(polygonOverlap(p0, p1)).toBeTruthy();
    expect(polygonOverlap(p1, p0)).toBeTruthy();
  });
  it("detects edge touch", () => {
    const p0 = [[0, 0], [1, 0], [1, 1]];
    const p1 = [[0, 1], [2, 0], [3, 2]];
    expect(polygonOverlap(p0, p1)).toBeTruthy();
    expect(polygonOverlap(p1, p0)).toBeTruthy();
  });
  it("doesn't detect noncollision", () => {
    const p0 = [[0, 0], [1, 0], [1, 1]];
    const p1 = [[1.5, 1.5], [2.5, 1.5], [2.5, 2.5]];
    expect(polygonOverlap(p0, p1)).toBeFalsy();
    expect(polygonOverlap(p1, p0)).toBeFalsy();
  });
  it("polys overlap inside", () => {
    const poly0 = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
    const poly1 = [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]];
    expect(polygonOverlap(poly0, poly1)).toBeTruthy();
  });

  it("polys overlap intersect", () => {
    const p0 = [[0, 0], [2, 0], [2, 1], [0, 1], [0, 0]];
    const p1 = [[0.5, -0.5], [1.5, -0.5], [1.5, 1.5], [0.5, 1.5], [0.5, -0.5]];
    expect(polygonOverlap(p0, p1)).toBeTruthy();
  });

  it("polys dont overlap", () => {
    const poly0 = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
    const poly1 = [[2, 2], [3, 2], [3, 3], [2, 3], [2, 2]];
    expect(polygonOverlap(poly0, poly1)).toBeFalsy();
  });

  it("polys should overlap (from real example)", () => {
    const tile = [
      [-90, 66.51326044311186],
      [0, 66.51326044311186],
      [0, 85.0511287798066],
      [-90, 85.0511287798066],
      [-90, 66.51326044311186]
    ];

    const poly = [[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]];

    expect(polygonOverlap(tile, poly)).toBeTruthy();
    expect(polygonOverlap(poly, tile)).toBeTruthy();
  });

  it("polys overlap simple", () => {
    const p0 = [[0, 0], [1, 0], [1, 1]];
    const p1 = [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5]];
    expect(polygonOverlap(p0, p1)).toBeTruthy();
  });
});
