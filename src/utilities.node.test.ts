/**
 * @jest-environment node
 */
import { btoa } from "./utilities";
describe("utilities: btoa in node", () => {
  it("works", () => {
    expect(btoa("Hello")).toEqual("SGVsbG8=");
  });
});
