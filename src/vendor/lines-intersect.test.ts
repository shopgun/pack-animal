import linesIntersect from "./lines-intersect";

describe("linesIntersect", () => {
  it("handles lines intersecting/touching", () => {
    expect(linesIntersect(0, 0, 1, 1, 0, 1, 1, 0)).toBeTruthy();
    expect(linesIntersect(0, 0, 1, 1, 0, 0, 1, 1)).toBeTruthy();
    expect(linesIntersect(0, 0, 1, 1, 1, 1, 2, 2)).toBeTruthy();
    expect(linesIntersect(-1, -1, 1, 1, -1, 1, 1, -1)).toBeTruthy();
  });
  it("handles lines not intersecting", () => {
    expect(linesIntersect(0, 0, 1, 1, 0, 1, 1, 2)).toBeFalsy();
    expect(linesIntersect(0, 0, 1, 1, 2, 2, 3, 3)).toBeFalsy();
  });
  it("line segments intersect", () => {
    expect(linesIntersect(0, 0, 1, 0, 0.5, 0.5, 0.5, -0.5)).toBeTruthy();
  });

  it("line segments dont intersect", () => {
    expect(linesIntersect(0, 0, 1, 0, 0.0, 0.5, 1.0, 0.5)).toBeFalsy();
  });

  it("line segments are the same -> should intersect", () => {
    expect(linesIntersect(0, 0, 1, 0, 0, 0, 1, 0)).toBeTruthy();
  });

  it("line segments collinear -> should NOT intersect", () => {
    expect(linesIntersect(0, 0, 1, 0, 1.5, 0, 2.5, 0)).toBeFalsy();
  });

  it("line segments share point -> should intersect", () => {
    expect(linesIntersect(0, 0, 1, 0, 1, 0, 2, 0)).toBeTruthy();
  });

  it("line segments ... should intersect", () => {
    expect(linesIntersect(0, 0, 2, 0, 0.5, -0.5, 0.5, 1.5)).toBeTruthy();
  });

  it("lines intersect simple", () => {
    expect(linesIntersect(0, 0, 1, 1, 0, 1, 1, 0)).toBeTruthy();
  });
});
