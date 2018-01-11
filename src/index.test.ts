import packAnimal from ".";
import { bogoPack } from "./algorithms/bogoPack";
/**
 * Dummy test
 */
describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy();
  });

  it("packAnimal runs at all", () => {
    expect(packAnimal(0, 0, [])).toBeTruthy();
  });

  it("packAnimal can take an alternative algorithm", () => {
    expect(packAnimal(0, 0, [], { algorithm: bogoPack })).toBeTruthy();
    expect(packAnimal(0, 0, [[]], { algorithm: bogoPack })).toBeTruthy();
  });
});
