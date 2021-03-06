import { isPolygonWithinRectangle, packUtilization, polygonArea, polygonBounds } from "./geometry";

describe("geometry: polygonBounds", () => {
  it("gives a bounding box polygon from any polygon", () => {
    expect(polygonBounds([{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 2.5, y: 5 }])).toEqual([
      { x: 0, y: 0 },
      { x: 5, y: 0 },
      { x: 5, y: 5 },
      { x: 0, y: 5 }
    ]);
  });
});
describe("geometry: polygonArea", () => {
  it("calculates total area from any polygon", () => {
    expect(polygonArea([{ x: 0, y: 0 }, { x: 0, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 0 }])).toEqual(
      16
    );
  });
});
describe("geometry: isPolygonWithinRectangle", () => {
  it("dislikes pointless polygons", () => {
    expect(() => isPolygonWithinRectangle([], [])).toThrow();
  });
});
describe("geometry: packUtilization", () => {
  it("calculates area utilization of polygons in rectangle", () => {
    expect(
      packUtilization(800, 742, [
        [
          { x: 562.83, y: 453.34 },
          { x: 504.37, y: 519.2 },
          { x: 512.14, y: 682.37 },
          { x: 575.41, y: 740.46 },
          { x: 739.69, y: 733.06 },
          { x: 799.26, y: 666.8299999999999 },
          { x: 794.8199999999999, y: 509.95 },
          { x: 726, y: 445.57 }
        ],
        [
          { x: 296.37, y: 445.57 },
          { x: 308.21, y: 560.64 },
          { x: 296.37, y: 740.46 },
          { x: 496.53999999999996, y: 740.46 },
          { x: 496.53999999999996, y: 445.57 }
        ],
        [
          { x: 0.37, y: 534.61 },
          { x: 0.37, y: 734.78 },
          { x: 295.26, y: 734.78 },
          { x: 295.26, y: 695.9300000000001 },
          { x: 236.43, y: 718.5 },
          { x: 263.07, y: 681.13 },
          { x: 251.23, y: 636.36 },
          { x: 269.36, y: 593.07 },
          { x: 295.26, y: 677.4300000000001 },
          { x: 295.26, y: 534.61 }
        ],
        [
          { x: 0.37, y: 326.85 },
          { x: 0.37, y: 397.89 },
          { x: 27.009999999999998, y: 394.56 },
          { x: 24.419999999999998, y: 508.89 },
          { x: 0.37, y: 404.55 },
          { x: 0.37, y: 529.98 },
          { x: 295.26, y: 529.98 },
          { x: 295.26, y: 326.85 }
        ],
        [
          { x: 631.3652546097812, y: 104.4224268168694 },
          { x: 629.4777974194814, y: 125.82806171412918 },
          { x: 648.3542831423874, y: 143.05279064531783 },
          { x: 610.0110938204541, y: 171.2912649777315 },
          { x: 582.2043082486331, y: 369.1468251122973 },
          { x: 597.6524825763552, y: 397.47245855517565 },
          { x: 747.8761486044514, y: 418.5850179708175 },
          { x: 768.1350591138255, y: 399.38768625588455 },
          { x: 795.4269042120944, y: 205.19611797566262 },
          { x: 768.4183461622583, y: 155.44305985790834 },
          { x: 774.0094075463616, y: 128.95338955797465 }
        ]
      ])
    ).toMatchSnapshot();
  });
});
