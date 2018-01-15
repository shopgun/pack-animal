import { bogoPack } from "./bogoPack";

describe("bogoPack", () => {
  it("doesn't fail", () => {
    expect(
      bogoPack(100, 100, [
        [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 50 }],
        [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 }, { x: 0, y: 50 }],
        [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 50 }]
      ])
    ).toBeTruthy();
  });
  it("handles empty polygon list", () => {
    expect(bogoPack(0, 0, [])).toBeTruthy();
  });
});
