import { btoa } from "./utilities";
describe("utilities: btoa in jsdom", () => {
  it("works", () => {
    expect(btoa("Hello")).toEqual("SGVsbG8=");
  });
});
