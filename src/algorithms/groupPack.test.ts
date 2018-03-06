import { groupPack } from "./groupPack";

describe("groupPack", () => {
  it("works", () => {
    expect(
      groupPack(
        800,
        742,
        [
          [
            [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 8 }, { x: 0, y: 8 }],
            [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 12 }, { x: 0, y: 12 }]
          ],
          [
            [{ x: 0, y: 0 }, { x: 12, y: 0 }, { x: 12, y: 1 }, { x: 0, y: 1 }],
            [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 2 }, { x: 0, y: 2 }]
          ],
          [
            [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }],
            [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 8 }, { x: 0, y: 8 }]
          ]
        ].map((group, groupIndex) =>
          group.map((points, index) => ({
            index: (index + 1) * (groupIndex + 1) - 1,
            points
          }))
        )
      )
    ).toMatchSnapshot();
  });
});
