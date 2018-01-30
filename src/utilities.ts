export class PackAnimalException {
  public error: Error;
  [key: string]: any;
  constructor(public message: string = "", meta: { [key: string]: any }) {
    this.meta = meta;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PackAnimalException);
    }
  }
}
