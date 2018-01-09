import { IPoint } from "./index";

class Point2D implements IPoint {
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public add(that: IPoint) {
    return new Point2D(this.x + that.x, this.y + that.y);
  }
  public addEquals(that: IPoint) {
    this.x += that.x;
    this.y += that.y;
    return this;
  }
  public scalarAdd(scalar: number) {
    return new Point2D(this.x + scalar, this.y + scalar);
  }
  public scalarAddEquals(scalar: number) {
    this.x += scalar;
    this.y += scalar;
    return this;
  }
  public subtract(that: IPoint) {
    return new Point2D(this.x - that.x, this.y - that.y);
  }
  public subtractEquals(that: IPoint) {
    this.x -= that.x;
    this.y -= that.y;
    return this;
  }
  public scalarSubtract(scalar: number) {
    return new Point2D(this.x - scalar, this.y - scalar);
  }
  public scalarSubtractEquals(scalar: number) {
    this.x -= scalar;
    this.y -= scalar;
    return this;
  }
  public multiply(scalar: number) {
    return new Point2D(this.x * scalar, this.y * scalar);
  }
  public multiplyEquals(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  public divide(scalar: number) {
    return new Point2D(this.x / scalar, this.y / scalar);
  }
  public divideEquals(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }
  public eq(that: IPoint) {
    return this.x === that.x && this.y === that.y;
  }
  public lt(that: IPoint) {
    return this.x < that.x && this.y < that.y;
  }
  public lte(that: IPoint) {
    return this.x <= that.x && this.y <= that.y;
  }
  public gt(that: IPoint) {
    return this.x > that.x && this.y > that.y;
  }
  public gte(that: IPoint) {
    return this.x >= that.x && this.y >= that.y;
  }
  public lerp(that: IPoint, t: number) {
    return new Point2D(
      this.x + (that.x - this.x) * t,
      this.y + (that.y - this.y) * t
    );
  }
  public distanceFrom(that: IPoint) {
    const dx = this.x - that.x;
    const dy = this.y - that.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  public min(that: IPoint) {
    return new Point2D(Math.min(this.x, that.x), Math.min(this.y, that.y));
  }
  public max(that: IPoint) {
    return new Point2D(Math.max(this.x, that.x), Math.max(this.y, that.y));
  }
  public toString() {
    return this.x + "," + this.y;
  }
  public setXY(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public setFromPoint(that: IPoint) {
    this.x = that.x;
    this.y = that.y;
  }
  public swap(that: IPoint) {
    const x = this.x;
    const y = this.y;
    this.x = that.x;
    this.y = that.y;
    that.x = x;
    that.y = y;
  }
}
class Vector2D {
  public static fromPoints = (p1: IPoint, p2: IPoint) =>
    new Vector2D(p2.x - p1.x, p2.y - p1.y);
  public x: number;
  public y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  public dot(that: Vector2D) {
    return this.x * that.x + this.y * that.y;
  }
  public cross(that: Vector2D) {
    return this.x * that.y - this.y * that.x;
  }
  public unit() {
    return this.divide(this.length());
  }
  public unitEquals() {
    this.divideEquals(this.length());
    return this;
  }
  public add(that: Vector2D) {
    return new Vector2D(this.x + that.x, this.y + that.y);
  }
  public addEquals(that: Vector2D) {
    this.x += that.x;
    this.y += that.y;
    return this;
  }
  public subtract(that: Vector2D) {
    return new Vector2D(this.x - that.x, this.y - that.y);
  }
  public subtractEquals(that: Vector2D) {
    this.x -= that.x;
    this.y -= that.y;
    return this;
  }
  public multiply(scalar: number) {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }
  public multiplyEquals(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  public divide(scalar: number) {
    return new Vector2D(this.x / scalar, this.y / scalar);
  }
  public divideEquals(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;
    return this;
  }
  public perp() {
    return new Vector2D(-this.y, this.x);
  }
}

export class Intersection {
  public points: IPoint[] = [];
  public status = "";
  constructor(status: string) {
    this.status = status;
  }

  public appendPoint(point: IPoint) {
    this.points.push(point);
  }
  public appendPoints(points: IPoint[]) {
    this.points = this.points.concat(points);
  }
}
/*****
 *
 *   class methods
 *
 *****/
/*
export const intersectShapes = (shape1, shape2) => {
  const ip1 = shape1.getIntersectionParams();
  const ip2 = shape2.getIntersectionParams();
  let result;

  if (ip1 != null && ip2 != null) {
    if (ip1.name === "Path") {
      result = intersectPathShape(shape1, shape2);
    } else if (ip2.name === "Path") {
      result = intersectPathShape(shape2, shape1);
    } else {
      let method;
      let params;

      if (ip1.name < ip2.name) {
        method = "intersect" + ip1.name + ip2.name;
        params = ip1.params.concat(ip2.params);
      } else {
        method = "intersect" + ip2.name + ip1.name;
        params = ip2.params.concat(ip1.params);
      }
      
      if (!(method in Intersection)) {
        throw new Error("Intersection not available: " + method);
      }
      result = Intersection[method].apply(null, params);
    }
  } else {
    result = new Intersection("No Intersection");
  }

  return result;
};
*/
/*****
 *
 *   intersectPathShape
 *
 *****/
export const intersectPathShape = (path, shape) => path.intersectShape(shape);

/*****
 *
 *   intersectCircleCircle
 *
 *****/
export const intersectCircleCircle = (c1, r1, c2, r2) => {
  let result;

  // Determine minimum and maximum radii where circles can intersect
  const rMax = r1 + r2;
  const rMin = Math.abs(r1 - r2);

  // Determine actual distance between circle circles
  const cDist = c1.distanceFrom(c2);

  if (cDist > rMax) {
    result = new Intersection("Outside");
  } else if (cDist < rMin) {
    result = new Intersection("Inside");
  } else {
    result = new Intersection("Intersection");

    const a = (r1 * r1 - r2 * r2 + cDist * cDist) / (2 * cDist);
    const h = Math.sqrt(r1 * r1 - a * a);
    const p = c1.lerp(c2, a / cDist);
    const b = h / cDist;

    result.points.push(
      new Point2D(p.x - b * (c2.y - c1.y), p.y + b * (c2.x - c1.x))
    );
    result.points.push(
      new Point2D(p.x + b * (c2.y - c1.y), p.y - b * (c2.x - c1.x))
    );
  }

  return result;
};

/*****
 *
 *   intersectCircleLine
 *
 *****/
export const intersectCircleLine = (c, r, a1, a2) => {
  let result;
  const a = (a2.x - a1.x) * (a2.x - a1.x) + (a2.y - a1.y) * (a2.y - a1.y);
  const b = 2 * ((a2.x - a1.x) * (a1.x - c.x) + (a2.y - a1.y) * (a1.y - c.y));
  const cc =
    c.x * c.x +
    c.y * c.y +
    a1.x * a1.x +
    a1.y * a1.y -
    2 * (c.x * a1.x + c.y * a1.y) -
    r * r;
  const deter = b * b - 4 * a * cc;

  if (deter < 0) {
    result = new Intersection("Outside");
  } else if (deter === 0) {
    result = new Intersection("Tangent");
    // NOTE: should calculate this point
  } else {
    const e = Math.sqrt(deter);
    const u1 = (-b + e) / (2 * a);
    const u2 = (-b - e) / (2 * a);

    if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
      result =
        (u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)
          ? new Intersection("Outside")
          : new Intersection("Inside");
    } else {
      result = new Intersection("Intersection");

      if (0 <= u1 && u1 <= 1) {
        result.points.push(a1.lerp(a2, u1));
      }

      if (0 <= u2 && u2 <= 1) {
        result.points.push(a1.lerp(a2, u2));
      }
    }
  }

  return result;
};

/*****
 *
 *   intersectCirclePolygon
 *
 *****/
export const intersectCirclePolygon = (c, r, points) => {
  const result = new Intersection("No Intersection");
  const length = points.length;
  let inter;

  for (let i = 0; i < length; i++) {
    const a1 = points[i];
    const a2 = points[(i + 1) % length];

    inter = intersectCircleLine(c, r, a1, a2);
    result.appendPoints(inter.points);
  }

  result.status = result.points.length > 0 ? "Intersection" : inter.status;

  return result;
};

/*****
 *
 *   intersectCircleRectangle
 *
 *****/
export const intersectCircleRectangle = (c, r, r1, r2) => {
  const min = r1.min(r2);
  const max = r1.max(r2);
  const topRight = new Point2D(max.x, min.y);
  const bottomLeft = new Point2D(min.x, max.y);

  const inter1 = intersectCircleLine(c, r, min, topRight);
  const inter2 = intersectCircleLine(c, r, topRight, max);
  const inter3 = intersectCircleLine(c, r, max, bottomLeft);
  const inter4 = intersectCircleLine(c, r, bottomLeft, min);

  const result = new Intersection("No Intersection");

  result.appendPoints(inter1.points);
  result.appendPoints(inter2.points);
  result.appendPoints(inter3.points);
  result.appendPoints(inter4.points);

  result.status = result.points.length > 0 ? "Intersection" : inter1.status;

  return result;
};

/*****
 *
 *   intersectLineLine
 *
 *****/
export const intersectLineLine = (a1, a2, b1, b2) => {
  let result;

  const uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
  const ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
  const uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

  if (uB !== 0) {
    const ua = uaT / uB;
    const ub = ubT / uB;

    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
      result = new Intersection("Intersection");
      result.points.push(
        new Point2D(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y))
      );
    } else {
      result = new Intersection("No Intersection");
    }
  } else {
    result =
      uaT === 0 || ubT === 0
        ? new Intersection("Coincident")
        : new Intersection("Parallel");
  }

  return result;
};

/*****
 *
 *   intersectLinePolygon
 *
 *****/
export const intersectLinePolygon = (a1, a2, points) => {
  const result = new Intersection("No Intersection");
  const length = points.length;

  for (let i = 0; i < length; i++) {
    const b1 = points[i];
    const b2 = points[(i + 1) % length];
    const inter = intersectLineLine(a1, a2, b1, b2);
    result.appendPoints(inter.points);
  }

  if (result.points.length > 0) {
    result.status = "Intersection";
  }
  return result;
};

/*****
 *
 *   intersectLineRectangle
 *
 *****/
export const intersectLineRectangle = (a1, a2, r1, r2) => {
  const min = r1.min(r2);
  const max = r1.max(r2);
  const topRight = new Point2D(max.x, min.y);
  const bottomLeft = new Point2D(min.x, max.y);

  const inter1 = intersectLineLine(min, topRight, a1, a2);
  const inter2 = intersectLineLine(topRight, max, a1, a2);
  const inter3 = intersectLineLine(max, bottomLeft, a1, a2);
  const inter4 = intersectLineLine(bottomLeft, min, a1, a2);

  const result = new Intersection("No Intersection");

  result.appendPoints(inter1.points);
  result.appendPoints(inter2.points);
  result.appendPoints(inter3.points);
  result.appendPoints(inter4.points);

  if (result.points.length > 0) {
    result.status = "Intersection";
  }
  return result;
};

/*****
 *
 *   intersectPolygonPolygon
 *
 *****/
export const intersectPolygonPolygon = (
  points1: IPoint[],
  points2: IPoint[]
) => {
  const result = new Intersection("No Intersection");
  const length = points1.length;
  for (let i = 0; i < length; i++) {
    const a1 = points1[i];
    const a2 = points1[(i + 1) % length];
    const inter = intersectLinePolygon(a1, a2, points2);

    result.appendPoints(inter.points);
  }

  if (result.points.length > 0) {
    result.status = "Intersection";
  }
  return result;
};

/*****
 *
 *   intersectPolygonRectangle
 *
 *****/
export const intersectPolygonRectangle = (points, r1, r2) => {
  const min = r1.min(r2);
  const max = r1.max(r2);
  const topRight = new Point2D(max.x, min.y);
  const bottomLeft = new Point2D(min.x, max.y);

  const inter1 = intersectLinePolygon(min, topRight, points);
  const inter2 = intersectLinePolygon(topRight, max, points);
  const inter3 = intersectLinePolygon(max, bottomLeft, points);
  const inter4 = intersectLinePolygon(bottomLeft, min, points);

  const result = new Intersection("No Intersection");

  result.appendPoints(inter1.points);
  result.appendPoints(inter2.points);
  result.appendPoints(inter3.points);
  result.appendPoints(inter4.points);

  if (result.points.length > 0) {
    result.status = "Intersection";
  }

  return result;
};

/*****
 *
 *   intersectRayRay
 *
 *****/
export const intersectRayRay = (a1, a2, b1, b2) => {
  let result;

  const uaT = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
  const ubT = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
  const uB = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

  if (uB !== 0) {
    const ua = uaT / uB;

    result = new Intersection("Intersection");
    result.points.push(
      new Point2D(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y))
    );
  } else {
    result =
      uaT === 0 || ubT === 0
        ? new Intersection("Coincident")
        : new Intersection("Parallel");
  }

  return result;
};

/*****
 *
 *   intersectRectangleRectangle
 *
 *****/
export const intersectRectangleRectangle = (a1, a2, b1, b2) => {
  const min = a1.min(a2);
  const max = a1.max(a2);
  const topRight = new Point2D(max.x, min.y);
  const bottomLeft = new Point2D(min.x, max.y);

  const inter1 = intersectLineRectangle(min, topRight, b1, b2);
  const inter2 = intersectLineRectangle(topRight, max, b1, b2);
  const inter3 = intersectLineRectangle(max, bottomLeft, b1, b2);
  const inter4 = intersectLineRectangle(bottomLeft, min, b1, b2);

  const result = new Intersection("No Intersection");

  result.appendPoints(inter1.points);
  result.appendPoints(inter2.points);
  result.appendPoints(inter3.points);
  result.appendPoints(inter4.points);

  if (result.points.length > 0) {
    result.status = "Intersection";
  }
  return result;
};

export default Intersection;
