import { btoa, setArrayOrder } from "./utilities";
describe("utilities: btoa in jsdom", () => {
  it("works", () => {
    expect(btoa("Hello")).toEqual("SGVsbG8=");
  });
});

describe("utilities: setArrayOrder", () => {
  it("works", () => {
    expect(setArrayOrder([3, 2, 1, 0], ["a", "b", "c", "d"])).toEqual(["d", "c", "b", "a"]);
    expect(setArrayOrder([1, 2, 3, 0], ["a", "b", "c", "d"])).toEqual(["d", "a", "b", "c"]);
  });
  it("doesn't accept arrays of mismatched length", () => {
    expect(() => {
      setArrayOrder([3, 2, 1, 0], ["b", "c", "d"]);
    }).toThrow();
    expect(() => {
      setArrayOrder([2, 1, 0], ["a", "b", "c", "d"]);
    }).toThrow();
  });
});
