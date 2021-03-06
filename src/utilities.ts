export class PackAnimalException {
  public error!: Error;
  public meta: any;
  [key: string]: any;
  constructor(public message: string = "", meta: { [key: string]: any }) {
    this.meta = meta;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PackAnimalException);
    }
  }
}

export const noop = (..._: any[]): void => undefined;

export const numberRange = (start: number, end: number) =>
  new Array(end + 1 - start).fill(0).map((_: number, i: number) => i + start);

export const permutator = <T>(list: T[], maxLen: number): T[][] => {
  // Copy initial values as arrays
  // Our permutation generator
  const generate = (perm: T[][], currLen: number): T[][] => {
    // Reached desired length
    if (currLen === maxLen) {
      return perm;
    }
    // For each existing permutation
    for (let i = 0, len = perm.length; i < len; i++) {
      const currPerm = perm.shift() || [];
      // Create new permutation
      for (const k of list) {
        perm.push([...currPerm, k]);
      }
    }
    // Recurse
    return generate(perm, currLen + 1);
  };
  // Start with size 1 because of initial values
  return generate(list.map(val => [val]), 1);
};

export const rotateArray = (n: number, array: any[]) =>
  array.slice(n, array.length).concat(array.slice(0, n));

export function setArrayOrder(order: number[], array: any[]) {
  const { length } = array;
  if (order.length !== length) {
    throw new Error("Both arrays passed to setArrayOrder must be of same length");
  }
  return array.reduce((out, element, index) => {
    out[order[index]] = element;
    return out;
  }, Array.from({ length }));
}

export const btoa = (str: string): string => {
  if (typeof window !== "undefined" && window && window.btoa) {
    // This only handles ASCII - I'm sure that'll never be a problem...
    return window.btoa(str);
  } else {
    return Buffer.from(str.toString()).toString("base64");
  }
};
