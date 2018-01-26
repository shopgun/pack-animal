/*!
  2D Transformation Matrix v2.7.4
  (c) Epistemex.com 2014-2017
  License: MIT
*/

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * The matrix can synchronize a canvas 2D context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * To synchronize a DOM element you can use [`toCSS()`]{@link Matrix#toCSS} or [`toCSS3D()`]{@link Matrix#toCSS3D}.
 * together with for example the `style.transform` property.
 * @license MIT license (header required)
 * @copyright Epistemex.com 2014-2017
 */
export class Matrix {
  public static fromTriangles(
    t1: {
      px: number;
      py: number;
      qx: number;
      qy: number;
      rx: number;
      ry: number;
    },
    t2: {
      px: number;
      py: number;
      qx: number;
      qy: number;
      rx: number;
      ry: number;
    },
    context?: CanvasRenderingContext2D
  ): Matrix;
  public static fromTriangles(
    t1: number[],
    t2: number[],
    context?: CanvasRenderingContext2D
  ): Matrix;
  public static fromTriangles(
    t1: Array<{ x: number; y: number }>,
    t2: Array<{ x: number; y: number }>,
    context?: CanvasRenderingContext2D
  ): Matrix;
  public static fromTriangles(t1: any, t2: any, context?: CanvasRenderingContext2D): Matrix {
    /**
     * Returns a new matrix that transforms a triangle `t1` into another triangle
     * `t2`, or throws an exception if it is impossible.
     *
     * Note: the method can take both arrays as well as literal objects.
     * Just make sure that both arguments (`t1`, `t2`) are of the same type.
     */
    const m1 = new Matrix();
    const m2 = new Matrix(context);
    let r1;
    let r2;
    let rx1;
    let ry1;
    let rx2;
    let ry2;

    if (Array.isArray(t1)) {
      if (typeof t1[0] === "number") {
        rx1 = t1[4];
        ry1 = t1[5];
        rx2 = t2[4];
        ry2 = t2[5];
        r1 = [t1[0] - rx1, t1[1] - ry1, t1[2] - rx1, t1[3] - ry1, rx1, ry1];
        r2 = [t2[0] - rx2, t2[1] - ry2, t2[2] - rx2, t2[3] - ry2, rx2, ry2];
      } else {
        rx1 = t1[2].x;
        ry1 = t1[2].y;
        rx2 = t2[2].x;
        ry2 = t2[2].y;
        r1 = [t1[0].x - rx1, t1[0].y - ry1, t1[1].x - rx1, t1[1].y - ry1, rx1, ry1];
        r2 = [t2[0].x - rx2, t2[0].y - ry2, t2[1].x - rx2, t2[1].y - ry2, rx2, ry2];
      }
    } else {
      r1 = [t1.px - t1.rx, t1.py - t1.ry, t1.qx - t1.rx, t1.qy - t1.ry, t1.rx, t1.ry];
      r2 = [t2.px - t2.rx, t2.py - t2.ry, t2.qx - t2.rx, t2.qy - t2.ry, t2.rx, t2.ry];
    }

    m1.setTransform.apply(m1, r1);
    m2.setTransform.apply(m2, r2);

    return m2.multiply(m1.inverse());
  }

  public static fromSVGTransformList(
    tList: SVGTransformList,
    context: CanvasRenderingContext2D,
    dom: HTMLElement
  ) {
    /**
     * Create a matrix from a transform list from an SVG shape. The list
     * can be for example baseVal (i.e. `shape.transform.baseVal`).
     *
     * The resulting matrix has all transformations from that list applied
     * in the same order as the list.
     */
    const m = new Matrix(context, dom);
    let i = 0;

    while (i < tList.numberOfItems) {
      m.multiply(tList.getItem(i++).matrix);
    }

    return m;
  }

  public static from(a: number, b: number, c: number, d: number, e: number, f: number): Matrix;
  public static from(a: Matrix): Matrix;
  public static from(a: { x: number; y: number }, b: number, c: number, d: number): Matrix;
  public static from(
    a: any,
    b?: any,
    c?: any,
    d?: any,
    e?: any,
    f?: any,
    context?: CanvasRenderingContext2D,
    dom?: HTMLElement
  ) {
    /**
     * Create and transform a new matrix based on given matrix values, or
     * provide SVGMatrix or a (2D) WebKitCSSMatrix or another
     * instance of a generic Matrix.
     */
    const m = new Matrix(context, dom);
    let scale;
    let dist;
    let q;

    if (typeof a === "number") {
      m.setTransform(a, b, c, d, e, f);
    } else if (typeof a.x === "number") {
      // vector

      q = Math.sqrt(a.x * a.x + a.y * a.y);
      scale = dist = 1;

      if (d) {
        scale = q;
      } else {
        dist = q;
      }

      m
        .translate(b || 0, c || 0)
        .rotateFromVector(a)
        .scaleU(scale)
        .translate(dist, 0);
    } else {
      if (typeof a.is2D === "boolean" && !a.is2D) {
        throw new Error("Cannot use 3D DOMMatrix.");
      }
      if (b) {
        m.context = b;
      }
      if (c) {
        m.element = c;
      }
      m.multiply(a);
    }

    return m;
  }
  public a: number;
  public b: number;
  public c: number;
  public d: number;
  public e: number;
  public f: number;
  public context: CanvasRenderingContext2D;
  private useCSS3D: boolean = false;
  private px: string;
  private st: { [index: string]: any };
  private el: HTMLElement;
  [key: string]: any;

  constructor(context?: CanvasRenderingContext2D, element?: HTMLElement) {
    this.a = this.d = 1;
    this.b = this.c = this.e = this.f = 0;

    // sync context
    if (context) {
      (this.context = context).setTransform(1, 0, 0, 1, 0, 0);
    }
    if (element) {
      this.el = element;
    }
  }
  get element(): HTMLElement {
    return this.el;
  }
  set element(el) {
    if (!this.el) {
      this.px = this._getPX();
      this.useCSS3D = false;
    }
    this.el = el;
    this.st = this.el.style;
    this.st[this.px] = this.toCSS();
  }

  /**
   * Concatenates transforms of this matrix onto the given child matrix and
   * returns a new matrix. This instance is used on left side.
   */
  public concat(cm: Matrix | SVGMatrix) {
    return this.clone().multiply(cm);
  }

  /**
   * Flips the horizontal values.
   */
  public flipX() {
    return this.transform(-1, 0, 0, 1, 0, 0);
  }

  /**
   * Flips the vertical values.
   */
  public flipY() {
    return this.transform(1, 0, 0, -1, 0, 0);
  }

  /**
   * Reflects incoming (velocity) vector on the normal which will be the
   * current transformed x axis. Call when a trigger condition is met.
   */
  public reflectVector(x: number, y: number): { x: number; y: number } {
    const v = this.applyToPoint(0, 1);
    const d = (v.x * x + v.y * y) * 2;

    x -= d * v.x;
    y -= d * v.y;

    return { x, y };
  }

  /**
   * Short-hand to reset current matrix to an identity matrix.
   */
  public reset() {
    return this.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Rotates current matrix by angle (accumulative).
   */
  public rotate(angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return this.transform(cos, sin, -sin, cos, 0, 0);
  }

  /**
   * Converts a vector given as `x` and `y` to angle, and
   * rotates (accumulative). x can instead contain an object with
   * properties x and y and if so, y parameter will be ignored.
   */
  public rotateFromVector(x: { x: number; y: number }): Matrix;
  public rotateFromVector(x: number, y: number): Matrix;
  public rotateFromVector(x: any, y?: any) {
    return this.rotate(typeof x === "number" ? Math.atan2(y, x) : Math.atan2(x.y, x.x));
  }

  /**
   * Helper method to make a rotation based on an angle in degrees.
   * @param {number} angle - angle in degrees
   * @returns {Matrix}
   */
  public rotateDeg(angle: number): Matrix {
    return this.rotate(angle * Math.PI / 180);
  }

  /**
   * Scales current matrix uniformly and accumulative.
   */
  public scaleU(f: number): Matrix {
    return this.transform(f, 0, 0, f, 0, 0);
  }

  /**
   * Scales current matrix accumulative.
   */
  public scale(sx: number, sy: number): Matrix {
    return this.transform(sx, 0, 0, sy, 0, 0);
  }

  /**
   * Scales current matrix on x axis accumulative.
   */
  public scaleX(sx: number): Matrix {
    return this.transform(sx, 0, 0, 1, 0, 0);
  }

  /**
   * Scales current matrix on y axis accumulative.
   */
  public scaleY(sy: number): Matrix {
    return this.transform(1, 0, 0, sy, 0, 0);
  }

  /**
   * Converts a vector given as `x` and `y` to normalized scale.
   */
  public scaleFromVector(x: number, y: number): Matrix {
    return this.scaleU(Math.sqrt(x * x + y * y));
  }

  /**
   * Apply shear to the current matrix accumulative.
   */
  public shear(sx: number, sy: number): Matrix {
    return this.transform(1, sy, sx, 1, 0, 0);
  }

  /**
   * Apply shear for x to the current matrix accumulative.
   */
  public shearX(sx: number): Matrix {
    return this.transform(1, 0, sx, 1, 0, 0);
  }

  /**
   * Apply shear for y to the current matrix accumulative.
   */
  public shearY(sy: number): Matrix {
    return this.transform(1, sy, 0, 1, 0, 0);
  }

  /**
   * Apply skew to the current matrix accumulative. Angles in radians.
   * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
   */
  public skew(ax: number, ay: number): Matrix {
    return this.shear(Math.tan(ax), Math.tan(ay));
  }

  /**
   * Apply skew to the current matrix accumulative. Angles in degrees.
   * Also see [`skew()`]{@link Matrix#skew}.
   */
  public skewDeg(ax: number, ay: number): Matrix {
    return this.shear(Math.tan(ax / 180 * Math.PI), Math.tan(ay / 180 * Math.PI));
  }

  /**
   * Apply skew for x to the current matrix accumulative. Angles in radians.
   * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
   */
  public skewX(ax: number): Matrix {
    return this.shearX(Math.tan(ax));
  }

  /**
   * Apply skew for y to the current matrix accumulative. Angles in radians.
   * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
   */
  public skewY(ay: number): Matrix {
    return this.shearY(Math.tan(ay));
  }

  /**
   * Set current matrix to new absolute matrix.
   */
  public setTransform(a: number, b: number, c: number, d: number, e: number, f: number): Matrix {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this._x();
  }

  /**
   * Translate current matrix accumulative.
   */
  public translate(tx: number, ty: number): Matrix {
    return this.transform(1, 0, 0, 1, tx, ty);
  }

  /**
   * Translate current matrix on x axis accumulative.
   */
  public translateX(tx: number): Matrix {
    return this.transform(1, 0, 0, 1, tx, 0);
  }

  /**
   * Translate current matrix on y axis accumulative.
   */
  public translateY(ty: number): Matrix {
    return this.transform(1, 0, 0, 1, 0, ty);
  }

  /**
   * Multiplies current matrix with new matrix values. Also see [`multiply()`]{@link Matrix#multiply}.
   */
  public transform(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number): Matrix {
    const a1 = this.a;
    const b1 = this.b;
    const c1 = this.c;
    const d1 = this.d;
    const e1 = this.e;
    const f1 = this.f;

    /* matrix column order is:
     *   a c e
     *   b d f
     *   0 0 1
     */
    this.a = a1 * a2 + c1 * b2;
    this.b = b1 * a2 + d1 * b2;
    this.c = a1 * c2 + c1 * d2;
    this.d = b1 * c2 + d1 * d2;
    this.e = a1 * e2 + c1 * f2 + e1;
    this.f = b1 * e2 + d1 * f2 + f1;

    return this._x();
  }

  /**
   * Multiplies current matrix with source matrix.
   */
  public multiply(m: Matrix | SVGMatrix) {
    return this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  /**
   * Divide this matrix on input matrix which must be invertible.
   * @param {Matrix} m - matrix to divide on (divisor)
   * @throws Exception if input matrix is not invertible
   * @returns {Matrix}
   */
  public divide(m: Matrix): Matrix {
    return this.multiply(m.inverse());
  }

  /**
   * Divide current matrix on scalar value != 0.
   */
  public divideScalar(d: number) {
    if (!d) {
      throw new Error("Division on zero");
    }

    this.a /= d;
    this.b /= d;
    this.c /= d;
    this.d /= d;
    this.e /= d;
    this.f /= d;

    return this._x();
  }

  /**
   * Get an inverse matrix of current matrix. The method returns a new
   * matrix with values you need to use to get to an identity matrix.
   * Context from parent matrix is not applied to the returned matrix.
   */
  public inverse(cloneContext: boolean = false, cloneDOM: boolean = false) {
    const m = new Matrix(
      cloneContext ? this.context : undefined,
      cloneDOM ? this.element : undefined
    );
    const dt = this.determinant();

    if (!dt) {
      throw new Error("Matrix not invertible.");
    }

    m.a = this.d / dt;
    m.b = -this.b / dt;
    m.c = -this.c / dt;
    m.d = this.a / dt;
    m.e = (this.c * this.f - this.d * this.e) / dt;
    m.f = -(this.a * this.f - this.b * this.e) / dt;

    return m;
  }

  /**
   * Interpolate this matrix with another and produce a new matrix.
   * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
   * 1 is equal to the second matrix. The `t` value is not clamped.
   *
   * Context from parent matrix is not applied to the returned matrix.
   *
   * Note: this interpolation is naive. For animation containing rotation,
   * shear or skew use the [`interpolateAnim()`]{@link Matrix#interpolateAnim} method instead
   * to avoid unintended flipping.
   */
  public interpolate(
    m2: Matrix | SVGMatrix,
    t: number,
    context?: CanvasRenderingContext2D,
    dom?: HTMLElement
  ) {
    const m = new Matrix(context, dom);

    m.a = this.a + (m2.a - this.a) * t;
    m.b = this.b + (m2.b - this.b) * t;
    m.c = this.c + (m2.c - this.c) * t;
    m.d = this.d + (m2.d - this.d) * t;
    m.e = this.e + (m2.e - this.e) * t;
    m.f = this.f + (m2.f - this.f) * t;

    return m._x();
  }

  /**
   * Interpolate this matrix with another and produce a new matrix.
   * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
   * 1 is equal to the second matrix. The `t` value is not constrained.
   *
   * Context from parent matrix is not applied to the returned matrix.
   *
   * To obtain easing `t` can be preprocessed using easing-functions
   * before being passed to this method.
   *
   * Note: this interpolation method uses decomposition which makes
   * it suitable for animations (in particular where rotation takes
   * places).
   *
   * @param {Matrix} m2 - the matrix to interpolate with.
   * @param {number} t - interpolation [0.0, 1.0]
   * @param {CanvasRenderingContext2D} [context] - optional context to affect
   * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
   * @returns {Matrix} - new Matrix instance with the interpolated result
   */
  public interpolateAnim(
    m2: Matrix,
    t: number,
    context?: CanvasRenderingContext2D,
    dom?: HTMLElement
  ) {
    const m = new Matrix(context, dom);
    const d1 = this.decompose();
    const d2 = m2.decompose();
    const t1 = d1.translate;
    const t2 = d2.translate;
    const s1 = d1.scale;

    // QR order (t-r-s-sk)
    m.translate(t1.x + (t2.x - t1.x) * t, t1.y + (t2.y - t1.y) * t);
    m.rotate(d1.rotation + (d2.rotation - d1.rotation) * t);
    m.scale(s1.x + (d2.scale.x - s1.x) * t, s1.y + (d2.scale.y - s1.y) * t);
    // todo test skew scenarios

    return m._x();
  }

  /**
   * Decompose the current matrix into simple transforms using either
   * QR (default) or LU decomposition.
   *
   * @param {boolean} [useLU=false] - set to true to use LU rather than QR decomposition
   * @returns {*} - an object containing current decomposed values (translate, rotation, scale, skew)
   * @see {@link https://en.wikipedia.org/wiki/QR_decomposition|More on QR decomposition}
   * @see {@link https://en.wikipedia.org/wiki/LU_decomposition|More on LU decomposition}
   */
  public decompose(
    useLU: boolean = false
  ): {
    rotation: number;
    scale: { x: number; y: number };
    skew: { x: number; y: number };
    translate: { x: number; y: number };
  } {
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    const acos = Math.acos;
    const atan = Math.atan;
    const sqrt = Math.sqrt;
    const pi = Math.PI;
    const translate = { x: this.e, y: this.f };
    let rotation = 0;
    let scale = { x: 1, y: 1 };
    let skew = { x: 0, y: 0 };
    const determ = a * d - b * c; // determinant(), skip DRY here...
    let r;
    let s;

    if (useLU) {
      if (a) {
        skew = { x: atan(c / a), y: atan(b / a) };
        scale = { x: a, y: determ / a };
      } else if (b) {
        rotation = pi * 0.5;
        scale = { x: b, y: determ / b };
        skew.x = atan(d / b);
      } else {
        // a = b = 0
        scale = { x: c, y: d };
        skew.x = pi * 0.25;
      }
    } else {
      // Apply the QR-like decomposition.
      if (a || b) {
        r = sqrt(a * a + b * b);
        rotation = b > 0 ? acos(a / r) : -acos(a / r);
        scale = { x: r, y: determ / r };
        skew.x = atan((a * c + b * d) / (r * r));
      } else if (c || d) {
        s = sqrt(c * c + d * d);
        rotation = pi * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
        scale = { x: determ / s, y: s };
        skew.y = atan((a * c + b * d) / (s * s));
      } else {
        // a = b = c = d = 0
        scale = { x: 0, y: 0 };
      }
    }

    return {
      rotation,
      scale,
      skew,
      translate
    };
  }

  /**
   * Returns the determinant of the current matrix.
   */
  public determinant() {
    return this.a * this.d - this.b * this.c;
  }

  /**
   * Apply current matrix to `x` and `y` of a point.
   * Returns a point object.
   * @returns {{x: number, y: number}} A new transformed point object
   */
  public applyToPoint(x: number, y: number) {
    return {
      x: x * this.a + y * this.c + this.e,
      y: x * this.b + y * this.d + this.f
    };
  }

  /**
   * Apply current matrix to array with point objects or point pairs.
   * Returns a new array with points in the same format as the input array.
   *
   * A point object is an object literal:
   *
   *     {x: x, y: y}
   *
   * so an array would contain either:
   *
   *     [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
   *
   * or
   *
   *     [x1, y1, x2, y2, ... xn, yn]
   *
   * @param {Array} points - array with point objects or pairs
   * @returns {Array} A new array with transformed points
   */
  public applyToArray(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }>;
  public applyToArray(points: number[]): number[];
  public applyToArray(points: any) {
    if (typeof points[0] === "number") {
      const mxPoints = [];
      const l = points.length;
      let i = 0;

      while (i < l) {
        const p = this.applyToPoint(points[i++], points[i++]);
        mxPoints.push(p.x, p.y);
      }
      return mxPoints;
    }
    return points.map((p: { x: number; y: number }) => this.applyToPoint(p.x, p.y));
  }

  /**
   * Apply current matrix to a typed array with point pairs. Although
   * the input array may be an ordinary array, this method is intended
   * for more performant use where typed arrays are used. The returned
   * array is regardless always returned as a `Float32Array`.
   *
   * @returns {*} A new typed array with transformed points
   */
  public applyToTypedArray(points: number[], use64: boolean = false) {
    let i = 0;
    let p;
    const l = points.length;
    const mxPoints = use64 ? new Float64Array(l) : new Float32Array(l);

    while (i < l) {
      p = this.applyToPoint(points[i], points[i + 1]);
      mxPoints[i++] = p.x;
      mxPoints[i++] = p.y;
    }

    return mxPoints;
  }

  /**
   * Apply to any canvas 2D context object. This does not affect the
   * context that optionally was referenced in constructor unless it is
   * the same context.
   *
   * @param {CanvasRenderingContext2D} context - target context
   * @returns {Matrix}
   */
  public applyToContext(context: CanvasRenderingContext2D): Matrix {
    context.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
    return this;
  }

  /**
   * Apply to any DOM element. This does not affect the DOM element
   * that optionally was referenced in constructor unless it is
   * the same element.
   *
   * The method will auto-detect the correct browser prefix if any.
   */
  public applyToElement(element: HTMLElement, use3D: boolean = false): Matrix {
    if (!this.px) {
      this.px = this._getPX();
    }
    const elementStyle: { [index: string]: any } = element.style;
    elementStyle[this.px] = use3D ? this.toCSS3D() : this.toCSS();
    return this;
  }

  /**
   * Instead of creating a new instance of a Matrix or SVGMatrix
   * the current settings of this instance can be applied to an external
   * object of a different (or same) type. You can also pass in an
   * empty literal object.
   *
   * Note that the properties a-f will be set regardless of if they
   * already exist or not.
   */
  public applyToObject(obj: any): Matrix {
    obj.a = this.a;
    obj.b = this.b;
    obj.c = this.c;
    obj.d = this.d;
    obj.e = this.e;
    obj.f = this.f;
    return this;
  }

  /**
   * Returns true if matrix is an identity matrix (no transforms applied).
   * @returns {boolean}
   */
  public isIdentity() {
    return this.a === 1 && !this.b && !this.c && this.d === 1 && !this.e && !this.f;
  }

  /**
   * Returns true if matrix is invertible
   */
  public isInvertible() {
    return !this._q(this.determinant(), 0);
  }

  /**
   * The method is intended for situations where scale is accumulated
   * via multiplications, to detect situations where scale becomes
   * "trapped" with a value of zero. And in which case scale must be
   * set explicitly to a non-zero value.
   */
  public isValid() {
    return !(this.a * this.d);
  }

  /**
   * Compares current matrix with another matrix. Returns true if equal
   * (within epsilon tolerance).
   * @param {Matrix|SVGMatrix} m - matrix to compare this matrix with
   * @returns {boolean}
   */
  public isEqual(m: Matrix | SVGMatrix) {
    const q = this._q;

    return (
      q(this.a, m.a) &&
      q(this.b, m.b) &&
      q(this.c, m.c) &&
      q(this.d, m.d) &&
      q(this.e, m.e) &&
      q(this.f, m.f)
    );
  }

  /**
   * Clones current instance and returning a new matrix.
   * @param {boolean} [noContext=false] don't clone context reference if true
   * @returns {Matrix} - a new Matrix instance with identical transformations as this instance
   */
  public clone(noContext: boolean = false) {
    return new Matrix(noContext ? undefined : this.context).multiply(this);
  }

  /**
   * Returns an array with current matrix values.
   */
  public toArray() {
    return [this.a, this.b, this.c, this.d, this.e, this.f];
  }

  /**
   * Returns a binary 32-bit floating point typed array.
   */
  public toTypedArray() {
    return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]);
  }

  /**
   * Generates a string that can be used with CSS `transform`.
   * @example
   *     element.style.transform = m.toCSS();
   */
  public toCSS() {
    return `matrix(${this.toArray()})`;
  }

  /**
   * Generates a `matrix3d()` string that can be used with CSS `transform`.
   * Although the matrix is for 2D use you may see performance benefits
   * on some devices using a 3D CSS transform instead of a 2D.
   * @example
   *     element.style.transform = m.toCSS3D();
   * @returns {string}
   */
  public toCSS3D() {
    const n2 = ",0,0,";
    return `matrix3d(${this.a},${this.b + n2 + this.c},${this.d + n2 + n2},1,0,${this.e},${
      this.f
    },0,1)`;
  }

  /**
   * Returns a JSON compatible string of current matrix.
   */
  public toJSON() {
    return `{
      "a":${this.a},
      "b":${this.b},
      "c":${this.c},
      "d":${this.d},
      "e":${this.e},
      "f":${this.f}
    }`;
  }

  /**
   * Returns a string with current matrix as comma-separated list.
   */
  public toString(fixLen: number = 4) {
    fixLen = fixLen || 4;
    return (
      "a=" +
      this.a.toFixed(fixLen) +
      " b=" +
      this.b.toFixed(fixLen) +
      " c=" +
      this.c.toFixed(fixLen) +
      " d=" +
      this.d.toFixed(fixLen) +
      " e=" +
      this.e.toFixed(fixLen) +
      " f=" +
      this.f.toFixed(fixLen)
    );
  }

  /**
   * Returns a string with current matrix as comma-separated values
   * string with line-end (CR+LF).
   */
  public toCSV() {
    return this.toArray().join() + "\r\n";
  }

  /**
   * Convert current matrix into a `SVGMatrix`. If `SVGMatrix` is not
   * supported, a `null` is returned.
   *
   * @returns {SVGMatrix}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix|MDN / SVGMatrix}
   */
  public toSVGMatrix(): SVGMatrix {
    const svgMatrix = document
      .createElementNS("http://www.w3.org/2000/svg", "svg")
      .createSVGMatrix();
    svgMatrix.a = this.a;
    svgMatrix.b = this.b;
    svgMatrix.c = this.c;
    svgMatrix.d = this.d;
    svgMatrix.e = this.e;
    svgMatrix.f = this.f;

    return svgMatrix;
  }

  /**
   * Compares floating point values with some tolerance (epsilon)
   * @private
   */
  private _q(f1: number, f2: number) {
    return Math.abs(f1 - f2) < 1e-14;
  }

  /**
   * Apply current absolute matrix to context if defined, to sync it.
   */
  private _x(): Matrix {
    if (this.context) {
      this.context.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
    }
    if (this.st) {
      this.st[this.px] = this.useCSS3D ? this.toCSS3D() : this.toCSS(); // can be optimized pre-storing func ref.
    }
    return this;
  }
  private _getPX(): string {
    const style: { [index: string]: any } = document.createElement("div").style;
    return (
      ["t", "oT", "msT", "mozT", "webkitT", "khtmlT"].find(
        p => typeof style[p + "ransform"] !== "undefined"
      ) || "transform"
    );
  }
}
