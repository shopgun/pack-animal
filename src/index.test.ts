import packAnimal from "../src/pack-animal";

/**
 * Dummy test
 */
describe("Dummy test", () => {
  it("works if true is truthy", () => {
    expect(true).toBeTruthy();
  });

  it("packAnimal runs at all", () => {
    expect(packAnimal(0, 0, [[]], {})).toBeTruthy();
  });
});
