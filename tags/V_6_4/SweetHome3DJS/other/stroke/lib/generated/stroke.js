var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* Generated from Java with JSweet 2.0.0 - http://www.jsweet.org */
var sun;
(function (sun) {
    var java2d;
    (function (java2d) {
        var pipe;
        (function (pipe) {
            /**
             * This class abstracts a number of features for which the Java 2D
             * implementation relies on proprietary licensed software libraries.
             * Access to those features is now achieved by retrieving the singleton
             * instance of this class and calling the appropriate methods on it.
             * The 3 primary features abstracted here include:
             * <dl>
             * <dt>Shape createStrokedShape(Shape, [BasicStroke attributes]);
             * <dd>This method implements the functionality of the method of the
             * same name on the {@link BasicStroke} class.
             * <dt>void strokeTo(Shape, [rendering parameters], PathConsumer2D);
             * <dd>This method performs widening of the source path on the fly
             * and sends the results to the given {@link PathConsumer2D} object.
             * This procedure avoids having to create an intermediate Shape
             * object to hold the results of the {@code createStrokedShape} method.
             * The main user of this method is the Java 2D non-antialiasing renderer.
             * <dt>AATileGenerator getAATileGenerator(Shape, [rendering parameters]);
             * <dd>This method returns an object which can iterate over the
             * specified bounding box and produce tiles of coverage values for
             * antialiased rendering.  The details of the operation of the
             * {@link AATileGenerator} object are explained in its class comments.
             * </dl>
             * Additionally, the following informational method supplies important
             * data about the implementation.
             * <dl>
             * <dt>float getMinimumAAPenSize()
             * <dd>This method provides information on how small the BasicStroke
             * line width can get before dropouts occur.  Rendering with a BasicStroke
             * is defined to never allow the line to have breaks, gaps, or dropouts
             * even if the width is set to 0.0f, so this information allows the
             * {@link SunGraphics2D} class to detect the "thin line" case and set
             * the rendering attributes accordingly.
             * </dl>
             * At startup the runtime will load a single instance of this class.
             * It searches the classpath for a registered provider of this API
             * and returns either the last one it finds, or the instance whose
             * class name matches the value supplied in the System property
             * {@code sun.java2d.renderer}.
             * Additionally, a runtime System property flag can be set to trace
             * all calls to methods on the {@code RenderingEngine} in use by
             * setting the sun.java2d.renderer.trace property to any non-null value.
             * <p>
             * Parts of the system that need to use any of the above features should
             * call {@code RenderingEngine.getInstance()} to obtain the properly
             * registered (and possibly trace-enabled) version of the RenderingEngine.
             * @class
             */
            var RenderingEngine = (function () {
                function RenderingEngine() {
                }
                /**
                 * Returns an instance of {@code RenderingEngine} as determined
                 * by the installation environment and runtime flags.
                 * <p>
                 * A specific instance of the {@code RenderingEngine} can be
                 * chosen by specifying the runtime flag:
                 * <pre>
                 * java -Dsun.java2d.renderer=&lt;classname&gt;
                 * </pre>
                 *
                 * If no specific {@code RenderingEngine} is specified on the command
                 * or Ductus renderer is specified, it will attempt loading the
                 * sun.dc.DuctusRenderingEngine class using Class.forName as a fastpath;
                 * if not found, use the ServiceLoader.
                 * If no specific {@code RenderingEngine} is specified on the command
                 * line then the last one returned by enumerating all subclasses of
                 * {@code RenderingEngine} known to the ServiceLoader is used.
                 * <p>
                 * Runtime tracing of the actions of the {@code RenderingEngine}
                 * can be enabled by specifying the runtime flag:
                 * <pre>
                 * java -Dsun.java2d.renderer.trace=&lt;any string&gt;
                 * </pre>
                 * @return {sun.java2d.pipe.RenderingEngine} an instance of {@code RenderingEngine}
                 * @since 1.7
                 */
                RenderingEngine.getInstance = function () {
                    return new sun.java2d.pisces.PiscesRenderingEngine();
                };
                /**
                 * Utility method to feed a {@link PathConsumer2D} object from a
                 * given {@link PathIterator}.
                 * This method deals with the details of running the iterator and
                 * feeding the consumer a segment at a time.
                 * @param {*} pi
                 * @param {*} consumer
                 */
                RenderingEngine.feedConsumer = function (pi, consumer) {
                    var coords = [0, 0, 0, 0, 0, 0];
                    while ((!pi.isDone())) {
                        switch ((pi.currentSegment(coords))) {
                            case java.awt.geom.PathIterator.SEG_MOVETO:
                                consumer.moveTo(coords[0], coords[1]);
                                break;
                            case java.awt.geom.PathIterator.SEG_LINETO:
                                consumer.lineTo(coords[0], coords[1]);
                                break;
                            case java.awt.geom.PathIterator.SEG_QUADTO:
                                consumer.quadTo(coords[0], coords[1], coords[2], coords[3]);
                                break;
                            case java.awt.geom.PathIterator.SEG_CUBICTO:
                                consumer.curveTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
                                break;
                            case java.awt.geom.PathIterator.SEG_CLOSE:
                                consumer.closePath();
                                break;
                        }
                        pi.next();
                    }
                    ;
                };
                return RenderingEngine;
            }());
            RenderingEngine.reImpl = null;
            pipe.RenderingEngine = RenderingEngine;
            RenderingEngine["__class"] = "sun.java2d.pipe.RenderingEngine";
        })(pipe = java2d.pipe || (java2d.pipe = {}));
    })(java2d = sun.java2d || (sun.java2d = {}));
})(sun || (sun = {}));
(function (sun) {
    var java2d;
    (function (java2d) {
        var pisces;
        (function (pisces) {
            var Helpers = (function () {
                function Helpers() {
                    throw Object.defineProperty(new Error("This is a non instantiable class"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Error', 'java.lang.Object'] });
                }
                Helpers.within$float$float$float = function (x, y, err) {
                    var d = y - x;
                    return (d <= err && d >= -err);
                };
                Helpers.within = function (x, y, err) {
                    if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof err === 'number') || err === null)) {
                        return sun.java2d.pisces.Helpers.within$float$float$float(x, y, err);
                    }
                    else if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof err === 'number') || err === null)) {
                        return sun.java2d.pisces.Helpers.within$double$double$double(x, y, err);
                    }
                    else
                        throw new Error('invalid overload');
                };
                Helpers.within$double$double$double = function (x, y, err) {
                    var d = y - x;
                    return (d <= err && d >= -err);
                };
                Helpers.quadraticRoots = function (a, b, c, zeroes, off) {
                    var ret = off;
                    var t;
                    if (a !== 0.0) {
                        var dis = b * b - 4 * a * c;
                        if (dis > 0) {
                            var sqrtDis = Math.sqrt(dis);
                            if (b >= 0) {
                                zeroes[ret++] = (2 * c) / (-b - sqrtDis);
                                zeroes[ret++] = (-b - sqrtDis) / (2 * a);
                            }
                            else {
                                zeroes[ret++] = (-b + sqrtDis) / (2 * a);
                                zeroes[ret++] = (2 * c) / (-b + sqrtDis);
                            }
                        }
                        else if (dis === 0.0) {
                            t = (-b) / (2 * a);
                            zeroes[ret++] = t;
                        }
                    }
                    else {
                        if (b !== 0.0) {
                            t = (-c) / b;
                            zeroes[ret++] = t;
                        }
                    }
                    return ret - off;
                };
                Helpers.cubicRootsInAB = function (d, a, b, c, pts, off, A, B) {
                    if (d === 0) {
                        var num_1 = Helpers.quadraticRoots(a, b, c, pts, off);
                        return Helpers.filterOutNotInAB(pts, off, num_1, A, B) - off;
                    }
                    a /= d;
                    b /= d;
                    c /= d;
                    var sq_A = a * a;
                    var p = 1.0 / 3 * (-1.0 / 3 * sq_A + b);
                    var q = 1.0 / 2 * (2.0 / 27 * a * sq_A - 1.0 / 3 * a * b + c);
                    var cb_p = p * p * p;
                    var D = q * q + cb_p;
                    var num;
                    if (D < 0) {
                        var phi = 1.0 / 3 * Math.acos(-q / Math.sqrt(-cb_p));
                        var t = 2 * Math.sqrt(-p);
                        pts[off + 0] = (t * Math.cos(phi));
                        pts[off + 1] = (-t * Math.cos(phi + Math.PI / 3));
                        pts[off + 2] = (-t * Math.cos(phi - Math.PI / 3));
                        num = 3;
                    }
                    else {
                        var sqrt_D = Math.sqrt(D);
                        var u = Math.pow(sqrt_D - q, 1 / 3);
                        var v = -Math.pow(sqrt_D + q, 1 / 3);
                        pts[off] = (u + v);
                        num = 1;
                        if (Helpers.within$double$double$double(D, 0, 1.0E-8)) {
                            pts[off + 1] = -(pts[off] / 2);
                            num = 2;
                        }
                    }
                    var sub = 1.0 / 3 * a;
                    for (var i = 0; i < num; ++i) {
                        pts[off + i] -= sub;
                    }
                    ;
                    return Helpers.filterOutNotInAB(pts, off, num, A, B) - off;
                };
                Helpers.widenArray$float_A$int$int = function (__in, cursize, numToAdd) {
                    if (__in.length >= cursize + numToAdd) {
                        return __in;
                    }
                    return __in.slice(0, 2 * (cursize + numToAdd));
                };
                Helpers.widenArray = function (__in, cursize, numToAdd) {
                    if (((__in != null && __in instanceof Array && (__in.length == 0 || __in[0] == null || (typeof __in[0] === 'number'))) || __in === null) && ((typeof cursize === 'number') || cursize === null) && ((typeof numToAdd === 'number') || numToAdd === null)) {
                        return sun.java2d.pisces.Helpers.widenArray$float_A$int$int(__in, cursize, numToAdd);
                    }
                    else if (((__in != null && __in instanceof Array && (__in.length == 0 || __in[0] == null || (typeof __in[0] === 'number'))) || __in === null) && ((typeof cursize === 'number') || cursize === null) && ((typeof numToAdd === 'number') || numToAdd === null)) {
                        return sun.java2d.pisces.Helpers.widenArray$int_A$int$int(__in, cursize, numToAdd);
                    }
                    else
                        throw new Error('invalid overload');
                };
                Helpers.widenArray$int_A$int$int = function (__in, cursize, numToAdd) {
                    if (__in.length >= cursize + numToAdd) {
                        return __in;
                    }
                    return __in.slice(0, 2 * (cursize + numToAdd));
                };
                Helpers.evalCubic = function (a, b, c, d, t) {
                    return t * (t * (t * a + b) + c) + d;
                };
                Helpers.evalQuad = function (a, b, c, t) {
                    return t * (t * a + b) + c;
                };
                Helpers.filterOutNotInAB = function (nums, off, len, a, b) {
                    var ret = off;
                    for (var i = off; i < off + len; i++) {
                        if (nums[i] >= a && nums[i] < b) {
                            nums[ret++] = nums[i];
                        }
                    }
                    ;
                    return ret;
                };
                Helpers.polyLineLength = function (poly, off, nCoords) {
                    var acc = 0;
                    for (var i = off + 2; i < off + nCoords; i += 2) {
                        acc += Helpers.linelen(poly[i], poly[i + 1], poly[i - 2], poly[i - 1]);
                    }
                    ;
                    return acc;
                };
                Helpers.linelen = function (x1, y1, x2, y2) {
                    var dx = x2 - x1;
                    var dy = y2 - y1;
                    return Math.sqrt(dx * dx + dy * dy);
                };
                Helpers.subdivide = function (src, srcoff, left, leftoff, right, rightoff, type) {
                    switch ((type)) {
                        case 6:
                            Helpers.subdivideQuad(src, srcoff, left, leftoff, right, rightoff);
                            break;
                        case 8:
                            Helpers.subdivideCubic(src, srcoff, left, leftoff, right, rightoff);
                            break;
                        default:
                            throw Object.defineProperty(new Error("Unsupported curve type"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.VirtualMachineError', 'java.lang.InternalError', 'java.lang.Error', 'java.lang.Object'] });
                    }
                };
                Helpers.isort = function (a, off, len) {
                    for (var i = off + 1; i < off + len; i++) {
                        var ai = a[i];
                        var j = i - 1;
                        for (; j >= off && a[j] > ai; j--) {
                            a[j + 1] = a[j];
                        }
                        ;
                        a[j + 1] = ai;
                    }
                    ;
                };
                /**
                 * Subdivides the cubic curve specified by the coordinates
                 * stored in the <code>src</code> array at indices <code>srcoff</code>
                 * through (<code>srcoff</code>&nbsp;+&nbsp;7) and stores the
                 * resulting two subdivided curves into the two result arrays at the
                 * corresponding indices.
                 * Either or both of the <code>left</code> and <code>right</code>
                 * arrays may be <code>null</code> or a reference to the same array
                 * as the <code>src</code> array.
                 * Note that the last point in the first subdivided curve is the
                 * same as the first point in the second subdivided curve. Thus,
                 * it is possible to pass the same array for <code>left</code>
                 * and <code>right</code> and to use offsets, such as <code>rightoff</code>
                 * equals (<code>leftoff</code> + 6), in order
                 * to avoid allocating extra storage for this common point.
                 * @param {Array} src the array holding the coordinates for the source curve
                 * @param {number} srcoff the offset into the array of the beginning of the
                 * the 6 source coordinates
                 * @param {Array} left the array for storing the coordinates for the first
                 * half of the subdivided curve
                 * @param {number} leftoff the offset into the array of the beginning of the
                 * the 6 left coordinates
                 * @param {Array} right the array for storing the coordinates for the second
                 * half of the subdivided curve
                 * @param {number} rightoff the offset into the array of the beginning of the
                 * the 6 right coordinates
                 * @since 1.7
                 */
                Helpers.subdivideCubic = function (src, srcoff, left, leftoff, right, rightoff) {
                    var x1 = src[srcoff + 0];
                    var y1 = src[srcoff + 1];
                    var ctrlx1 = src[srcoff + 2];
                    var ctrly1 = src[srcoff + 3];
                    var ctrlx2 = src[srcoff + 4];
                    var ctrly2 = src[srcoff + 5];
                    var x2 = src[srcoff + 6];
                    var y2 = src[srcoff + 7];
                    if (left != null) {
                        left[leftoff + 0] = x1;
                        left[leftoff + 1] = y1;
                    }
                    if (right != null) {
                        right[rightoff + 6] = x2;
                        right[rightoff + 7] = y2;
                    }
                    x1 = (x1 + ctrlx1) / 2.0;
                    y1 = (y1 + ctrly1) / 2.0;
                    x2 = (x2 + ctrlx2) / 2.0;
                    y2 = (y2 + ctrly2) / 2.0;
                    var centerx = (ctrlx1 + ctrlx2) / 2.0;
                    var centery = (ctrly1 + ctrly2) / 2.0;
                    ctrlx1 = (x1 + centerx) / 2.0;
                    ctrly1 = (y1 + centery) / 2.0;
                    ctrlx2 = (x2 + centerx) / 2.0;
                    ctrly2 = (y2 + centery) / 2.0;
                    centerx = (ctrlx1 + ctrlx2) / 2.0;
                    centery = (ctrly1 + ctrly2) / 2.0;
                    if (left != null) {
                        left[leftoff + 2] = x1;
                        left[leftoff + 3] = y1;
                        left[leftoff + 4] = ctrlx1;
                        left[leftoff + 5] = ctrly1;
                        left[leftoff + 6] = centerx;
                        left[leftoff + 7] = centery;
                    }
                    if (right != null) {
                        right[rightoff + 0] = centerx;
                        right[rightoff + 1] = centery;
                        right[rightoff + 2] = ctrlx2;
                        right[rightoff + 3] = ctrly2;
                        right[rightoff + 4] = x2;
                        right[rightoff + 5] = y2;
                    }
                };
                Helpers.subdivideCubicAt = function (t, src, srcoff, left, leftoff, right, rightoff) {
                    var x1 = src[srcoff + 0];
                    var y1 = src[srcoff + 1];
                    var ctrlx1 = src[srcoff + 2];
                    var ctrly1 = src[srcoff + 3];
                    var ctrlx2 = src[srcoff + 4];
                    var ctrly2 = src[srcoff + 5];
                    var x2 = src[srcoff + 6];
                    var y2 = src[srcoff + 7];
                    if (left != null) {
                        left[leftoff + 0] = x1;
                        left[leftoff + 1] = y1;
                    }
                    if (right != null) {
                        right[rightoff + 6] = x2;
                        right[rightoff + 7] = y2;
                    }
                    x1 = x1 + t * (ctrlx1 - x1);
                    y1 = y1 + t * (ctrly1 - y1);
                    x2 = ctrlx2 + t * (x2 - ctrlx2);
                    y2 = ctrly2 + t * (y2 - ctrly2);
                    var centerx = ctrlx1 + t * (ctrlx2 - ctrlx1);
                    var centery = ctrly1 + t * (ctrly2 - ctrly1);
                    ctrlx1 = x1 + t * (centerx - x1);
                    ctrly1 = y1 + t * (centery - y1);
                    ctrlx2 = centerx + t * (x2 - centerx);
                    ctrly2 = centery + t * (y2 - centery);
                    centerx = ctrlx1 + t * (ctrlx2 - ctrlx1);
                    centery = ctrly1 + t * (ctrly2 - ctrly1);
                    if (left != null) {
                        left[leftoff + 2] = x1;
                        left[leftoff + 3] = y1;
                        left[leftoff + 4] = ctrlx1;
                        left[leftoff + 5] = ctrly1;
                        left[leftoff + 6] = centerx;
                        left[leftoff + 7] = centery;
                    }
                    if (right != null) {
                        right[rightoff + 0] = centerx;
                        right[rightoff + 1] = centery;
                        right[rightoff + 2] = ctrlx2;
                        right[rightoff + 3] = ctrly2;
                        right[rightoff + 4] = x2;
                        right[rightoff + 5] = y2;
                    }
                };
                Helpers.subdivideQuad = function (src, srcoff, left, leftoff, right, rightoff) {
                    var x1 = src[srcoff + 0];
                    var y1 = src[srcoff + 1];
                    var ctrlx = src[srcoff + 2];
                    var ctrly = src[srcoff + 3];
                    var x2 = src[srcoff + 4];
                    var y2 = src[srcoff + 5];
                    if (left != null) {
                        left[leftoff + 0] = x1;
                        left[leftoff + 1] = y1;
                    }
                    if (right != null) {
                        right[rightoff + 4] = x2;
                        right[rightoff + 5] = y2;
                    }
                    x1 = (x1 + ctrlx) / 2.0;
                    y1 = (y1 + ctrly) / 2.0;
                    x2 = (x2 + ctrlx) / 2.0;
                    y2 = (y2 + ctrly) / 2.0;
                    ctrlx = (x1 + x2) / 2.0;
                    ctrly = (y1 + y2) / 2.0;
                    if (left != null) {
                        left[leftoff + 2] = x1;
                        left[leftoff + 3] = y1;
                        left[leftoff + 4] = ctrlx;
                        left[leftoff + 5] = ctrly;
                    }
                    if (right != null) {
                        right[rightoff + 0] = ctrlx;
                        right[rightoff + 1] = ctrly;
                        right[rightoff + 2] = x2;
                        right[rightoff + 3] = y2;
                    }
                };
                Helpers.subdivideQuadAt = function (t, src, srcoff, left, leftoff, right, rightoff) {
                    var x1 = src[srcoff + 0];
                    var y1 = src[srcoff + 1];
                    var ctrlx = src[srcoff + 2];
                    var ctrly = src[srcoff + 3];
                    var x2 = src[srcoff + 4];
                    var y2 = src[srcoff + 5];
                    if (left != null) {
                        left[leftoff + 0] = x1;
                        left[leftoff + 1] = y1;
                    }
                    if (right != null) {
                        right[rightoff + 4] = x2;
                        right[rightoff + 5] = y2;
                    }
                    x1 = x1 + t * (ctrlx - x1);
                    y1 = y1 + t * (ctrly - y1);
                    x2 = ctrlx + t * (x2 - ctrlx);
                    y2 = ctrly + t * (y2 - ctrly);
                    ctrlx = x1 + t * (x2 - x1);
                    ctrly = y1 + t * (y2 - y1);
                    if (left != null) {
                        left[leftoff + 2] = x1;
                        left[leftoff + 3] = y1;
                        left[leftoff + 4] = ctrlx;
                        left[leftoff + 5] = ctrly;
                    }
                    if (right != null) {
                        right[rightoff + 0] = ctrlx;
                        right[rightoff + 1] = ctrly;
                        right[rightoff + 2] = x2;
                        right[rightoff + 3] = y2;
                    }
                };
                Helpers.subdivideAt = function (t, src, srcoff, left, leftoff, right, rightoff, size) {
                    switch ((size)) {
                        case 8:
                            Helpers.subdivideCubicAt(t, src, srcoff, left, leftoff, right, rightoff);
                            break;
                        case 6:
                            Helpers.subdivideQuadAt(t, src, srcoff, left, leftoff, right, rightoff);
                            break;
                    }
                };
                return Helpers;
            }());
            pisces.Helpers = Helpers;
            Helpers["__class"] = "sun.java2d.pisces.Helpers";
        })(pisces = java2d.pisces || (java2d.pisces = {}));
    })(java2d = sun.java2d || (sun.java2d = {}));
})(sun || (sun = {}));
(function (sun) {
    var java2d;
    (function (java2d) {
        var pisces;
        (function (pisces) {
            var TransformingPathConsumer2D = (function () {
                function TransformingPathConsumer2D() {
                }
                TransformingPathConsumer2D.transformConsumer = function (out, at) {
                    if (at == null) {
                        return out;
                    }
                    var Mxx = at.getScaleX();
                    var Mxy = at.getShearX();
                    var Mxt = at.getTranslateX();
                    var Myx = at.getShearY();
                    var Myy = at.getScaleY();
                    var Myt = at.getTranslateY();
                    if (Mxy === 0.0 && Myx === 0.0) {
                        if (Mxx === 1.0 && Myy === 1.0) {
                            if (Mxt === 0.0 && Myt === 0.0) {
                                return out;
                            }
                            else {
                                return new TransformingPathConsumer2D.TranslateFilter(out, Mxt, Myt);
                            }
                        }
                        else {
                            if (Mxt === 0.0 && Myt === 0.0) {
                                return new TransformingPathConsumer2D.DeltaScaleFilter(out, Mxx, Myy);
                            }
                            else {
                                return new TransformingPathConsumer2D.ScaleFilter(out, Mxx, Myy, Mxt, Myt);
                            }
                        }
                    }
                    else if (Mxt === 0.0 && Myt === 0.0) {
                        return new TransformingPathConsumer2D.DeltaTransformFilter(out, Mxx, Mxy, Myx, Myy);
                    }
                    else {
                        return new TransformingPathConsumer2D.TransformFilter(out, Mxx, Mxy, Mxt, Myx, Myy, Myt);
                    }
                };
                TransformingPathConsumer2D.deltaTransformConsumer = function (out, at) {
                    if (at == null) {
                        return out;
                    }
                    var Mxx = at.getScaleX();
                    var Mxy = at.getShearX();
                    var Myx = at.getShearY();
                    var Myy = at.getScaleY();
                    if (Mxy === 0.0 && Myx === 0.0) {
                        if (Mxx === 1.0 && Myy === 1.0) {
                            return out;
                        }
                        else {
                            return new TransformingPathConsumer2D.DeltaScaleFilter(out, Mxx, Myy);
                        }
                    }
                    else {
                        return new TransformingPathConsumer2D.DeltaTransformFilter(out, Mxx, Mxy, Myx, Myy);
                    }
                };
                TransformingPathConsumer2D.inverseDeltaTransformConsumer = function (out, at) {
                    if (at == null) {
                        return out;
                    }
                    var Mxx = at.getScaleX();
                    var Mxy = at.getShearX();
                    var Myx = at.getShearY();
                    var Myy = at.getScaleY();
                    if (Mxy === 0.0 && Myx === 0.0) {
                        if (Mxx === 1.0 && Myy === 1.0) {
                            return out;
                        }
                        else {
                            return new TransformingPathConsumer2D.DeltaScaleFilter(out, 1.0 / Mxx, 1.0 / Myy);
                        }
                    }
                    else {
                        var det = Mxx * Myy - Mxy * Myx;
                        return new TransformingPathConsumer2D.DeltaTransformFilter(out, Myy / det, -Mxy / det, -Myx / det, Mxx / det);
                    }
                };
                return TransformingPathConsumer2D;
            }());
            pisces.TransformingPathConsumer2D = TransformingPathConsumer2D;
            TransformingPathConsumer2D["__class"] = "sun.java2d.pisces.TransformingPathConsumer2D";
            (function (TransformingPathConsumer2D) {
                var TranslateFilter = (function () {
                    function TranslateFilter(out, tx, ty) {
                        this.out = null;
                        this.tx = 0;
                        this.ty = 0;
                        this.out = out;
                        this.tx = tx;
                        this.ty = ty;
                    }
                    TranslateFilter.prototype.moveTo = function (x0, y0) {
                        this.out.moveTo(x0 + this.tx, y0 + this.ty);
                    };
                    TranslateFilter.prototype.lineTo = function (x1, y1) {
                        this.out.lineTo(x1 + this.tx, y1 + this.ty);
                    };
                    TranslateFilter.prototype.quadTo = function (x1, y1, x2, y2) {
                        this.out.quadTo(x1 + this.tx, y1 + this.ty, x2 + this.tx, y2 + this.ty);
                    };
                    TranslateFilter.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
                        this.out.curveTo(x1 + this.tx, y1 + this.ty, x2 + this.tx, y2 + this.ty, x3 + this.tx, y3 + this.ty);
                    };
                    TranslateFilter.prototype.closePath = function () {
                        this.out.closePath();
                    };
                    TranslateFilter.prototype.pathDone = function () {
                        this.out.pathDone();
                    };
                    TranslateFilter.prototype.getNativeConsumer = function () {
                        return 0;
                    };
                    return TranslateFilter;
                }());
                TransformingPathConsumer2D.TranslateFilter = TranslateFilter;
                TranslateFilter["__class"] = "sun.java2d.pisces.TransformingPathConsumer2D.TranslateFilter";
                TranslateFilter["__interfaces"] = ["sun.awt.geom.PathConsumer2D"];
                var ScaleFilter = (function () {
                    function ScaleFilter(out, sx, sy, tx, ty) {
                        this.out = null;
                        this.sx = 0;
                        this.sy = 0;
                        this.tx = 0;
                        this.ty = 0;
                        this.out = out;
                        this.sx = sx;
                        this.sy = sy;
                        this.tx = tx;
                        this.ty = ty;
                    }
                    ScaleFilter.prototype.moveTo = function (x0, y0) {
                        this.out.moveTo(x0 * this.sx + this.tx, y0 * this.sy + this.ty);
                    };
                    ScaleFilter.prototype.lineTo = function (x1, y1) {
                        this.out.lineTo(x1 * this.sx + this.tx, y1 * this.sy + this.ty);
                    };
                    ScaleFilter.prototype.quadTo = function (x1, y1, x2, y2) {
                        this.out.quadTo(x1 * this.sx + this.tx, y1 * this.sy + this.ty, x2 * this.sx + this.tx, y2 * this.sy + this.ty);
                    };
                    ScaleFilter.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
                        this.out.curveTo(x1 * this.sx + this.tx, y1 * this.sy + this.ty, x2 * this.sx + this.tx, y2 * this.sy + this.ty, x3 * this.sx + this.tx, y3 * this.sy + this.ty);
                    };
                    ScaleFilter.prototype.closePath = function () {
                        this.out.closePath();
                    };
                    ScaleFilter.prototype.pathDone = function () {
                        this.out.pathDone();
                    };
                    ScaleFilter.prototype.getNativeConsumer = function () {
                        return 0;
                    };
                    return ScaleFilter;
                }());
                TransformingPathConsumer2D.ScaleFilter = ScaleFilter;
                ScaleFilter["__class"] = "sun.java2d.pisces.TransformingPathConsumer2D.ScaleFilter";
                ScaleFilter["__interfaces"] = ["sun.awt.geom.PathConsumer2D"];
                var TransformFilter = (function () {
                    function TransformFilter(out, Mxx, Mxy, Mxt, Myx, Myy, Myt) {
                        this.out = null;
                        this.Mxx = 0;
                        this.Mxy = 0;
                        this.Mxt = 0;
                        this.Myx = 0;
                        this.Myy = 0;
                        this.Myt = 0;
                        this.out = out;
                        this.Mxx = Mxx;
                        this.Mxy = Mxy;
                        this.Mxt = Mxt;
                        this.Myx = Myx;
                        this.Myy = Myy;
                        this.Myt = Myt;
                    }
                    TransformFilter.prototype.moveTo = function (x0, y0) {
                        this.out.moveTo(x0 * this.Mxx + y0 * this.Mxy + this.Mxt, x0 * this.Myx + y0 * this.Myy + this.Myt);
                    };
                    TransformFilter.prototype.lineTo = function (x1, y1) {
                        this.out.lineTo(x1 * this.Mxx + y1 * this.Mxy + this.Mxt, x1 * this.Myx + y1 * this.Myy + this.Myt);
                    };
                    TransformFilter.prototype.quadTo = function (x1, y1, x2, y2) {
                        this.out.quadTo(x1 * this.Mxx + y1 * this.Mxy + this.Mxt, x1 * this.Myx + y1 * this.Myy + this.Myt, x2 * this.Mxx + y2 * this.Mxy + this.Mxt, x2 * this.Myx + y2 * this.Myy + this.Myt);
                    };
                    TransformFilter.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
                        this.out.curveTo(x1 * this.Mxx + y1 * this.Mxy + this.Mxt, x1 * this.Myx + y1 * this.Myy + this.Myt, x2 * this.Mxx + y2 * this.Mxy + this.Mxt, x2 * this.Myx + y2 * this.Myy + this.Myt, x3 * this.Mxx + y3 * this.Mxy + this.Mxt, x3 * this.Myx + y3 * this.Myy + this.Myt);
                    };
                    TransformFilter.prototype.closePath = function () {
                        this.out.closePath();
                    };
                    TransformFilter.prototype.pathDone = function () {
                        this.out.pathDone();
                    };
                    TransformFilter.prototype.getNativeConsumer = function () {
                        return 0;
                    };
                    return TransformFilter;
                }());
                TransformingPathConsumer2D.TransformFilter = TransformFilter;
                TransformFilter["__class"] = "sun.java2d.pisces.TransformingPathConsumer2D.TransformFilter";
                TransformFilter["__interfaces"] = ["sun.awt.geom.PathConsumer2D"];
                var DeltaScaleFilter = (function () {
                    function DeltaScaleFilter(out, Mxx, Myy) {
                        this.sx = 0;
                        this.sy = 0;
                        this.out = null;
                        this.sx = Mxx;
                        this.sy = Myy;
                        this.out = out;
                    }
                    DeltaScaleFilter.prototype.moveTo = function (x0, y0) {
                        this.out.moveTo(x0 * this.sx, y0 * this.sy);
                    };
                    DeltaScaleFilter.prototype.lineTo = function (x1, y1) {
                        this.out.lineTo(x1 * this.sx, y1 * this.sy);
                    };
                    DeltaScaleFilter.prototype.quadTo = function (x1, y1, x2, y2) {
                        this.out.quadTo(x1 * this.sx, y1 * this.sy, x2 * this.sx, y2 * this.sy);
                    };
                    DeltaScaleFilter.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
                        this.out.curveTo(x1 * this.sx, y1 * this.sy, x2 * this.sx, y2 * this.sy, x3 * this.sx, y3 * this.sy);
                    };
                    DeltaScaleFilter.prototype.closePath = function () {
                        this.out.closePath();
                    };
                    DeltaScaleFilter.prototype.pathDone = function () {
                        this.out.pathDone();
                    };
                    DeltaScaleFilter.prototype.getNativeConsumer = function () {
                        return 0;
                    };
                    return DeltaScaleFilter;
                }());
                TransformingPathConsumer2D.DeltaScaleFilter = DeltaScaleFilter;
                DeltaScaleFilter["__class"] = "sun.java2d.pisces.TransformingPathConsumer2D.DeltaScaleFilter";
                DeltaScaleFilter["__interfaces"] = ["sun.awt.geom.PathConsumer2D"];
                var DeltaTransformFilter = (function () {
                    function DeltaTransformFilter(out, Mxx, Mxy, Myx, Myy) {
                        this.out = null;
                        this.Mxx = 0;
                        this.Mxy = 0;
                        this.Myx = 0;
                        this.Myy = 0;
                        this.out = out;
                        this.Mxx = Mxx;
                        this.Mxy = Mxy;
                        this.Myx = Myx;
                        this.Myy = Myy;
                    }
                    DeltaTransformFilter.prototype.moveTo = function (x0, y0) {
                        this.out.moveTo(x0 * this.Mxx + y0 * this.Mxy, x0 * this.Myx + y0 * this.Myy);
                    };
                    DeltaTransformFilter.prototype.lineTo = function (x1, y1) {
                        this.out.lineTo(x1 * this.Mxx + y1 * this.Mxy, x1 * this.Myx + y1 * this.Myy);
                    };
                    DeltaTransformFilter.prototype.quadTo = function (x1, y1, x2, y2) {
                        this.out.quadTo(x1 * this.Mxx + y1 * this.Mxy, x1 * this.Myx + y1 * this.Myy, x2 * this.Mxx + y2 * this.Mxy, x2 * this.Myx + y2 * this.Myy);
                    };
                    DeltaTransformFilter.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
                        this.out.curveTo(x1 * this.Mxx + y1 * this.Mxy, x1 * this.Myx + y1 * this.Myy, x2 * this.Mxx + y2 * this.Mxy, x2 * this.Myx + y2 * this.Myy, x3 * this.Mxx + y3 * this.Mxy, x3 * this.Myx + y3 * this.Myy);
                    };
                    DeltaTransformFilter.prototype.closePath = function () {
                        this.out.closePath();
                    };
                    DeltaTransformFilter.prototype.pathDone = function () {
                        this.out.pathDone();
                    };
                    DeltaTransformFilter.prototype.getNativeConsumer = function () {
                        return 0;
                    };
                    return DeltaTransformFilter;
                }());
                TransformingPathConsumer2D.DeltaTransformFilter = DeltaTransformFilter;
                DeltaTransformFilter["__class"] = "sun.java2d.pisces.TransformingPathConsumer2D.DeltaTransformFilter";
                DeltaTransformFilter["__interfaces"] = ["sun.awt.geom.PathConsumer2D"];
            })(TransformingPathConsumer2D = pisces.TransformingPathConsumer2D || (pisces.TransformingPathConsumer2D = {}));
        })(pisces = java2d.pisces || (java2d.pisces = {}));
    })(java2d = sun.java2d || (sun.java2d = {}));
})(sun || (sun = {}));
(function (sun) {
    var java2d;
    (function (java2d) {
        var pisces;
        (function (pisces) {
            var Curve = (function () {
                function Curve() {
                    this.ax = 0;
                    this.ay = 0;
                    this.bx = 0;
                    this.by = 0;
                    this.cx = 0;
                    this.cy = 0;
                    this.dx = 0;
                    this.dy = 0;
                    this.dax = 0;
                    this.day = 0;
                    this.dbx = 0;
                    this.dby = 0;
                }
                Curve.prototype.set$float_A$int = function (points, type) {
                    switch ((type)) {
                        case 8:
                            this.set$float$float$float$float$float$float$float$float(points[0], points[1], points[2], points[3], points[4], points[5], points[6], points[7]);
                            break;
                        case 6:
                            this.set$float$float$float$float$float$float(points[0], points[1], points[2], points[3], points[4], points[5]);
                            break;
                        default:
                            throw Object.defineProperty(new Error("Curves can only be cubic or quadratic"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.VirtualMachineError', 'java.lang.InternalError', 'java.lang.Error', 'java.lang.Object'] });
                    }
                };
                Curve.prototype.set$float$float$float$float$float$float$float$float = function (x1, y1, x2, y2, x3, y3, x4, y4) {
                    this.ax = 3 * (x2 - x3) + x4 - x1;
                    this.ay = 3 * (y2 - y3) + y4 - y1;
                    this.bx = 3 * (x1 - 2 * x2 + x3);
                    this.by = 3 * (y1 - 2 * y2 + y3);
                    this.cx = 3 * (x2 - x1);
                    this.cy = 3 * (y2 - y1);
                    this.dx = x1;
                    this.dy = y1;
                    this.dax = 3 * this.ax;
                    this.day = 3 * this.ay;
                    this.dbx = 2 * this.bx;
                    this.dby = 2 * this.by;
                };
                Curve.prototype.set = function (x1, y1, x2, y2, x3, y3, x4, y4) {
                    if (((typeof x1 === 'number') || x1 === null) && ((typeof y1 === 'number') || y1 === null) && ((typeof x2 === 'number') || x2 === null) && ((typeof y2 === 'number') || y2 === null) && ((typeof x3 === 'number') || x3 === null) && ((typeof y3 === 'number') || y3 === null) && ((typeof x4 === 'number') || x4 === null) && ((typeof y4 === 'number') || y4 === null)) {
                        return this.set$float$float$float$float$float$float$float$float(x1, y1, x2, y2, x3, y3, x4, y4);
                    }
                    else if (((typeof x1 === 'number') || x1 === null) && ((typeof y1 === 'number') || y1 === null) && ((typeof x2 === 'number') || x2 === null) && ((typeof y2 === 'number') || y2 === null) && ((typeof x3 === 'number') || x3 === null) && ((typeof y3 === 'number') || y3 === null) && x4 === undefined && y4 === undefined) {
                        return this.set$float$float$float$float$float$float(x1, y1, x2, y2, x3, y3);
                    }
                    else if (((x1 != null && x1 instanceof Array && (x1.length == 0 || x1[0] == null || (typeof x1[0] === 'number'))) || x1 === null) && ((typeof y1 === 'number') || y1 === null) && x2 === undefined && y2 === undefined && x3 === undefined && y3 === undefined && x4 === undefined && y4 === undefined) {
                        return this.set$float_A$int(x1, y1);
                    }
                    else
                        throw new Error('invalid overload');
                };
                Curve.prototype.set$float$float$float$float$float$float = function (x1, y1, x2, y2, x3, y3) {
                    this.ax = this.ay = 0.0;
                    this.bx = x1 - 2 * x2 + x3;
                    this.by = y1 - 2 * y2 + y3;
                    this.cx = 2 * (x2 - x1);
                    this.cy = 2 * (y2 - y1);
                    this.dx = x1;
                    this.dy = y1;
                    this.dax = 0;
                    this.day = 0;
                    this.dbx = 2 * this.bx;
                    this.dby = 2 * this.by;
                };
                Curve.prototype.xat = function (t) {
                    return t * (t * (t * this.ax + this.bx) + this.cx) + this.dx;
                };
                Curve.prototype.yat = function (t) {
                    return t * (t * (t * this.ay + this.by) + this.cy) + this.dy;
                };
                Curve.prototype.dxat = function (t) {
                    return t * (t * this.dax + this.dbx) + this.cx;
                };
                Curve.prototype.dyat = function (t) {
                    return t * (t * this.day + this.dby) + this.cy;
                };
                Curve.prototype.dxRoots = function (roots, off) {
                    return sun.java2d.pisces.Helpers.quadraticRoots(this.dax, this.dbx, this.cx, roots, off);
                };
                Curve.prototype.dyRoots = function (roots, off) {
                    return sun.java2d.pisces.Helpers.quadraticRoots(this.day, this.dby, this.cy, roots, off);
                };
                Curve.prototype.infPoints = function (pts, off) {
                    var a = this.dax * this.dby - this.dbx * this.day;
                    var b = 2 * (this.cy * this.dax - this.day * this.cx);
                    var c = this.cy * this.dbx - this.cx * this.dby;
                    return sun.java2d.pisces.Helpers.quadraticRoots(a, b, c, pts, off);
                };
                /*private*/ Curve.prototype.perpendiculardfddf = function (pts, off) {
                    var a = 2 * (this.dax * this.dax + this.day * this.day);
                    var b = 3 * (this.dax * this.dbx + this.day * this.dby);
                    var c = 2 * (this.dax * this.cx + this.day * this.cy) + this.dbx * this.dbx + this.dby * this.dby;
                    var d = this.dbx * this.cx + this.dby * this.cy;
                    return sun.java2d.pisces.Helpers.cubicRootsInAB(a, b, c, d, pts, off, 0.0, 1.0);
                };
                Curve.prototype.rootsOfROCMinusW = function (roots, off, w, err) {
                    var ret = off;
                    var numPerpdfddf = this.perpendiculardfddf(roots, off);
                    var t0 = 0;
                    var ft0 = this.ROCsq(t0) - w * w;
                    roots[off + numPerpdfddf] = 1.0;
                    numPerpdfddf++;
                    for (var i = off; i < off + numPerpdfddf; i++) {
                        var t1 = roots[i];
                        var ft1 = this.ROCsq(t1) - w * w;
                        if (ft0 === 0.0) {
                            roots[ret++] = t0;
                        }
                        else if (ft1 * ft0 < 0.0) {
                            roots[ret++] = this.falsePositionROCsqMinusX(t0, t1, w * w, err);
                        }
                        t0 = t1;
                        ft0 = ft1;
                    }
                    ;
                    return ret - off;
                };
                /*private*/ Curve.eliminateInf = function (x) {
                    return (x === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : (x === Number.NEGATIVE_INFINITY ? Number.MIN_VALUE : x));
                };
                /*private*/ Curve.prototype.falsePositionROCsqMinusX = function (x0, x1, x, err) {
                    var iterLimit = 100;
                    var side = 0;
                    var t = x1;
                    var ft = Curve.eliminateInf(this.ROCsq(t) - x);
                    var s = x0;
                    var fs = Curve.eliminateInf(this.ROCsq(s) - x);
                    var r = s;
                    var fr;
                    for (var i = 0; i < iterLimit && Math.abs(t - s) > err * Math.abs(t + s); i++) {
                        r = (fs * t - ft * s) / (fs - ft);
                        fr = this.ROCsq(r) - x;
                        if (Curve.sameSign(fr, ft)) {
                            ft = fr;
                            t = r;
                            if (side < 0) {
                                fs /= (1 << (-side));
                                side--;
                            }
                            else {
                                side = -1;
                            }
                        }
                        else if (fr * fs > 0) {
                            fs = fr;
                            s = r;
                            if (side > 0) {
                                ft /= (1 << side);
                                side++;
                            }
                            else {
                                side = 1;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    ;
                    return r;
                };
                /*private*/ Curve.sameSign = function (x, y) {
                    return (x < 0 && y < 0) || (x > 0 && y > 0);
                };
                /*private*/ Curve.prototype.ROCsq = function (t) {
                    var dx = t * (t * this.dax + this.dbx) + this.cx;
                    var dy = t * (t * this.day + this.dby) + this.cy;
                    var ddx = 2 * this.dax * t + this.dbx;
                    var ddy = 2 * this.day * t + this.dby;
                    var dx2dy2 = dx * dx + dy * dy;
                    var ddx2ddy2 = ddx * ddx + ddy * ddy;
                    var ddxdxddydy = ddx * dx + ddy * dy;
                    return dx2dy2 * ((dx2dy2 * dx2dy2) / (dx2dy2 * ddx2ddy2 - ddxdxddydy * ddxdxddydy));
                };
                Curve.breakPtsAtTs = function (pts, type, Ts, numTs) {
                    return new Curve.Curve$0(type, numTs, Ts, pts);
                };
                return Curve;
            }());
            pisces.Curve = Curve;
            Curve["__class"] = "sun.java2d.pisces.Curve";
            (function (Curve) {
                var Curve$0 = (function () {
                    function Curve$0(type, numTs, Ts, pts) {
                        this.type = type;
                        this.numTs = numTs;
                        this.Ts = Ts;
                        this.pts = pts;
                        this.i0 = 0;
                        this.itype = this.type;
                        this.nextCurveIdx = 0;
                        this.curCurveOff = this.i0;
                        this.prevT = 0;
                    }
                    /**
                     *
                     * @return {boolean}
                     */
                    Curve$0.prototype.hasNext = function () {
                        return this.nextCurveIdx < this.numTs + 1;
                    };
                    /**
                     *
                     * @return {number}
                     */
                    Curve$0.prototype.next = function () {
                        var ret;
                        if (this.nextCurveIdx < this.numTs) {
                            var curT = this.Ts[this.nextCurveIdx];
                            var splitT = (curT - this.prevT) / (1 - this.prevT);
                            sun.java2d.pisces.Helpers.subdivideAt(splitT, this.pts, this.curCurveOff, this.pts, 0, this.pts, this.type, this.type);
                            this.prevT = curT;
                            ret = this.i0;
                            this.curCurveOff = this.itype;
                        }
                        else {
                            ret = this.curCurveOff;
                        }
                        this.nextCurveIdx++;
                        return ret;
                    };
                    /**
                     *
                     */
                    Curve$0.prototype.remove = function () {
                    };
                    return Curve$0;
                }());
                Curve.Curve$0 = Curve$0;
                Curve$0["__interfaces"] = ["java.util.Iterator"];
            })(Curve = pisces.Curve || (pisces.Curve = {}));
        })(pisces = java2d.pisces || (java2d.pisces = {}));
    })(java2d = sun.java2d || (sun.java2d = {}));
})(sun || (sun = {}));
(function (sun) {
    var java2d;
    (function (java2d) {
        var pisces;
        (function (pisces) {
            /**
             * Constructs a <code>Dasher</code>.
             *
             * @param {*} out an output <code>PathConsumer2D</code>.
             * @param {Array} dash an array of <code>float</code>s containing the dash pattern
             * @param {number} phase a <code>float</code> containing the dash phase
             * @class
             */
            var Dasher = (function () {
                function Dasher(out, dash, phase) {
                    /*private*/ this.firstSegmentsBuffer = [0, 0, 0, 0, 0, 0, 0];
                    /*private*/ this.firstSegidx = 0;
                    /*private*/ this.li = null;
                    this.out = null;
                    this.dash = null;
                    this.startPhase = 0;
                    this.startDashOn = false;
                    this.startIdx = 0;
                    this.starting = false;
                    this.needsMoveTo = false;
                    this.idx = 0;
                    this.dashOn = false;
                    this.phase = 0;
                    this.sx = 0;
                    this.sy = 0;
                    this.x0 = 0;
                    this.y0 = 0;
                    this.curCurvepts = null;
                    if (phase < 0) {
                        throw Object.defineProperty(new Error("phase < 0 !"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                    }
                    this.out = out;
                    var idx = 0;
                    this.dashOn = true;
                    var d;
                    while ((phase >= (d = dash[idx]))) {
                        phase -= d;
                        idx = (idx + 1) % dash.length;
                        this.dashOn = !this.dashOn;
                    }
                    ;
                    this.dash = dash;
                    this.startPhase = this.phase = phase;
                    this.startDashOn = this.dashOn;
                    this.startIdx = idx;
                    this.starting = true;
                    this.curCurvepts = (function (s) { var a = []; while (s-- > 0)
                        a.push(0); return a; })(8 * 2);
                }
                Dasher.prototype.moveTo = function (x0, y0) {
                    if (this.firstSegidx > 0) {
                        this.out.moveTo(this.sx, this.sy);
                        this.emitFirstSegments();
                    }
                    this.needsMoveTo = true;
                    this.idx = this.startIdx;
                    this.dashOn = this.startDashOn;
                    this.phase = this.startPhase;
                    this.sx = this.x0 = x0;
                    this.sy = this.y0 = y0;
                    this.starting = true;
                };
                Dasher.prototype.emitSeg = function (buf, off, type) {
                    switch ((type)) {
                        case 8:
                            this.out.curveTo(buf[off + 0], buf[off + 1], buf[off + 2], buf[off + 3], buf[off + 4], buf[off + 5]);
                            break;
                        case 6:
                            this.out.quadTo(buf[off + 0], buf[off + 1], buf[off + 2], buf[off + 3]);
                            break;
                        case 4:
                            this.out.lineTo(buf[off], buf[off + 1]);
                    }
                };
                Dasher.prototype.emitFirstSegments = function () {
                    for (var i = 0; i < this.firstSegidx;) {
                        this.emitSeg(this.firstSegmentsBuffer, i + 1, (this.firstSegmentsBuffer[i] | 0));
                        i += (((this.firstSegmentsBuffer[i] | 0)) - 1);
                    }
                    ;
                    this.firstSegidx = 0;
                };
                Dasher.prototype.goTo = function (pts, off, type) {
                    var x = pts[off + type - 4];
                    var y = pts[off + type - 3];
                    if (this.dashOn) {
                        if (this.starting) {
                            this.firstSegmentsBuffer = sun.java2d.pisces.Helpers.widenArray$float_A$int$int(this.firstSegmentsBuffer, this.firstSegidx, type - 2 + 1);
                            this.firstSegmentsBuffer[this.firstSegidx++] = type;
                            /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
                                while (--size >= 0)
                                    dstPts[dstOff++] = srcPts[srcOff++];
                            }
                            else {
                                var tmp = srcPts.slice(srcOff, srcOff + size);
                                for (var i = 0; i < size; i++)
                                    dstPts[dstOff++] = tmp[i];
                            } })(pts, off, this.firstSegmentsBuffer, this.firstSegidx, type - 2);
                            this.firstSegidx += type - 2;
                        }
                        else {
                            if (this.needsMoveTo) {
                                this.out.moveTo(this.x0, this.y0);
                                this.needsMoveTo = false;
                            }
                            this.emitSeg(pts, off, type);
                        }
                    }
                    else {
                        this.starting = false;
                        this.needsMoveTo = true;
                    }
                    this.x0 = x;
                    this.y0 = y;
                };
                Dasher.prototype.lineTo = function (x1, y1) {
                    var dx = x1 - this.x0;
                    var dy = y1 - this.y0;
                    var len = Math.sqrt(dx * dx + dy * dy);
                    if (len === 0) {
                        return;
                    }
                    var cx = dx / len;
                    var cy = dy / len;
                    while ((true)) {
                        var leftInThisDashSegment = this.dash[this.idx] - this.phase;
                        if (len <= leftInThisDashSegment) {
                            this.curCurvepts[0] = x1;
                            this.curCurvepts[1] = y1;
                            this.goTo(this.curCurvepts, 0, 4);
                            this.phase += len;
                            if (len === leftInThisDashSegment) {
                                this.phase = 0.0;
                                this.idx = (this.idx + 1) % this.dash.length;
                                this.dashOn = !this.dashOn;
                            }
                            return;
                        }
                        var dashdx = this.dash[this.idx] * cx;
                        var dashdy = this.dash[this.idx] * cy;
                        if (this.phase === 0) {
                            this.curCurvepts[0] = this.x0 + dashdx;
                            this.curCurvepts[1] = this.y0 + dashdy;
                        }
                        else {
                            var p = leftInThisDashSegment / this.dash[this.idx];
                            this.curCurvepts[0] = this.x0 + p * dashdx;
                            this.curCurvepts[1] = this.y0 + p * dashdy;
                        }
                        this.goTo(this.curCurvepts, 0, 4);
                        len -= leftInThisDashSegment;
                        this.idx = (this.idx + 1) % this.dash.length;
                        this.dashOn = !this.dashOn;
                        this.phase = 0;
                    }
                    ;
                };
                Dasher.prototype.somethingTo = function (type) {
                    if (Dasher.pointCurve(this.curCurvepts, type)) {
                        return;
                    }
                    if (this.li == null) {
                        this.li = new Dasher.LengthIterator(4, 0.01);
                    }
                    this.li.initializeIterationOnCurve(this.curCurvepts, type);
                    var curCurveoff = 0;
                    var lastSplitT = 0;
                    var t = 0;
                    var leftInThisDashSegment = this.dash[this.idx] - this.phase;
                    while (((t = this.li.next(leftInThisDashSegment)) < 1)) {
                        if (t !== 0) {
                            sun.java2d.pisces.Helpers.subdivideAt((t - lastSplitT) / (1 - lastSplitT), this.curCurvepts, curCurveoff, this.curCurvepts, 0, this.curCurvepts, type, type);
                            lastSplitT = t;
                            this.goTo(this.curCurvepts, 2, type);
                            curCurveoff = type;
                        }
                        this.idx = (this.idx + 1) % this.dash.length;
                        this.dashOn = !this.dashOn;
                        this.phase = 0;
                        leftInThisDashSegment = this.dash[this.idx];
                    }
                    ;
                    this.goTo(this.curCurvepts, curCurveoff + 2, type);
                    this.phase += this.li.lastSegLen();
                    if (this.phase >= this.dash[this.idx]) {
                        this.phase = 0.0;
                        this.idx = (this.idx + 1) % this.dash.length;
                        this.dashOn = !this.dashOn;
                    }
                };
                Dasher.pointCurve = function (curve, type) {
                    for (var i = 2; i < type; i++) {
                        if (curve[i] !== curve[i - 2]) {
                            return false;
                        }
                    }
                    ;
                    return true;
                };
                /**
                 *
                 * @param {number} x1
                 * @param {number} y1
                 * @param {number} x2
                 * @param {number} y2
                 * @param {number} x3
                 * @param {number} y3
                 */
                Dasher.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
                    this.curCurvepts[0] = this.x0;
                    this.curCurvepts[1] = this.y0;
                    this.curCurvepts[2] = x1;
                    this.curCurvepts[3] = y1;
                    this.curCurvepts[4] = x2;
                    this.curCurvepts[5] = y2;
                    this.curCurvepts[6] = x3;
                    this.curCurvepts[7] = y3;
                    this.somethingTo(8);
                };
                /**
                 *
                 * @param {number} x1
                 * @param {number} y1
                 * @param {number} x2
                 * @param {number} y2
                 */
                Dasher.prototype.quadTo = function (x1, y1, x2, y2) {
                    this.curCurvepts[0] = this.x0;
                    this.curCurvepts[1] = this.y0;
                    this.curCurvepts[2] = x1;
                    this.curCurvepts[3] = y1;
                    this.curCurvepts[4] = x2;
                    this.curCurvepts[5] = y2;
                    this.somethingTo(6);
                };
                Dasher.prototype.closePath = function () {
                    this.lineTo(this.sx, this.sy);
                    if (this.firstSegidx > 0) {
                        if (!this.dashOn || this.needsMoveTo) {
                            this.out.moveTo(this.sx, this.sy);
                        }
                        this.emitFirstSegments();
                    }
                    this.moveTo(this.sx, this.sy);
                };
                Dasher.prototype.pathDone = function () {
                    if (this.firstSegidx > 0) {
                        this.out.moveTo(this.sx, this.sy);
                        this.emitFirstSegments();
                    }
                    this.out.pathDone();
                };
                /**
                 *
                 * @return {number}
                 */
                Dasher.prototype.getNativeConsumer = function () {
                    throw Object.defineProperty(new Error("Dasher does not use a native consumer"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.VirtualMachineError', 'java.lang.InternalError', 'java.lang.Error', 'java.lang.Object'] });
                };
                return Dasher;
            }());
            pisces.Dasher = Dasher;
            Dasher["__class"] = "sun.java2d.pisces.Dasher";
            Dasher["__interfaces"] = ["sun.awt.geom.PathConsumer2D"];
            (function (Dasher) {
                var LengthIterator = (function () {
                    function LengthIterator(reclimit, err) {
                        this.curLeafCtrlPolyLengths = [0, 0, 0];
                        this.cachedHaveLowAcceleration = -1;
                        this.nextRoots = [0, 0, 0, 0];
                        this.flatLeafCoefCache = [0, 0, -1, 0];
                        this.recCurveStack = null;
                        this.sides = null;
                        this.curveType = 0;
                        this.limit = 0;
                        this.ERR = 0;
                        this.minTincrement = 0;
                        this.nextT = 0;
                        this.lenAtNextT = 0;
                        this.lastT = 0;
                        this.lenAtLastT = 0;
                        this.lenAtLastSplit = 0;
                        this.__lastSegLen = 0;
                        this.recLevel = 0;
                        this.done = false;
                        this.limit = reclimit;
                        this.minTincrement = 1.0 / (1 << this.limit);
                        this.ERR = err;
                        this.recCurveStack = (function (dims) { var allocate = function (dims) { if (dims.length == 0) {
                            return 0;
                        }
                        else {
                            var array = [];
                            for (var i = 0; i < dims[0]; i++) {
                                array.push(allocate(dims.slice(1)));
                            }
                            return array;
                        } }; return allocate(dims); })([reclimit + 1, 8]);
                        this.sides = new Array(reclimit);
                        this.nextT = Number.MAX_VALUE;
                        this.lenAtNextT = Number.MAX_VALUE;
                        this.lenAtLastSplit = Number.MIN_VALUE;
                        this.recLevel = Number.MIN_VALUE;
                        this.__lastSegLen = Number.MAX_VALUE;
                        this.done = true;
                    }
                    LengthIterator.prototype.initializeIterationOnCurve = function (pts, type) {
                        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
                            while (--size >= 0)
                                dstPts[dstOff++] = srcPts[srcOff++];
                        }
                        else {
                            var tmp = srcPts.slice(srcOff, srcOff + size);
                            for (var i = 0; i < size; i++)
                                dstPts[dstOff++] = tmp[i];
                        } })(pts, 0, this.recCurveStack[0], 0, type);
                        this.curveType = type;
                        this.recLevel = 0;
                        this.lastT = 0;
                        this.lenAtLastT = 0;
                        this.nextT = 0;
                        this.lenAtNextT = 0;
                        this.goLeft();
                        this.lenAtLastSplit = 0;
                        if (this.recLevel > 0) {
                            this.sides[0] = LengthIterator.Side.LEFT;
                            this.done = false;
                        }
                        else {
                            this.sides[0] = LengthIterator.Side.RIGHT;
                            this.done = true;
                        }
                        this.__lastSegLen = 0;
                    };
                    LengthIterator.prototype.haveLowAcceleration = function (err) {
                        if (this.cachedHaveLowAcceleration === -1) {
                            var len1 = this.curLeafCtrlPolyLengths[0];
                            var len2 = this.curLeafCtrlPolyLengths[1];
                            if (!sun.java2d.pisces.Helpers.within$float$float$float(len1, len2, err * len2)) {
                                this.cachedHaveLowAcceleration = 0;
                                return false;
                            }
                            if (this.curveType === 8) {
                                var len3 = this.curLeafCtrlPolyLengths[2];
                                if (!(sun.java2d.pisces.Helpers.within$float$float$float(len2, len3, err * len3) && sun.java2d.pisces.Helpers.within$float$float$float(len1, len3, err * len3))) {
                                    this.cachedHaveLowAcceleration = 0;
                                    return false;
                                }
                            }
                            this.cachedHaveLowAcceleration = 1;
                            return true;
                        }
                        return (this.cachedHaveLowAcceleration === 1);
                    };
                    LengthIterator.prototype.next = function (len) {
                        var targetLength = this.lenAtLastSplit + len;
                        while ((this.lenAtNextT < targetLength)) {
                            if (this.done) {
                                this.__lastSegLen = this.lenAtNextT - this.lenAtLastSplit;
                                return 1;
                            }
                            this.goToNextLeaf();
                        }
                        ;
                        this.lenAtLastSplit = targetLength;
                        var leaflen = this.lenAtNextT - this.lenAtLastT;
                        var t = (targetLength - this.lenAtLastT) / leaflen;
                        if (!this.haveLowAcceleration(0.05)) {
                            if (this.flatLeafCoefCache[2] < 0) {
                                var x = 0 + this.curLeafCtrlPolyLengths[0];
                                var y = x + this.curLeafCtrlPolyLengths[1];
                                if (this.curveType === 8) {
                                    var z = y + this.curLeafCtrlPolyLengths[2];
                                    this.flatLeafCoefCache[0] = 3 * (x - y) + z;
                                    this.flatLeafCoefCache[1] = 3 * (y - 2 * x);
                                    this.flatLeafCoefCache[2] = 3 * x;
                                    this.flatLeafCoefCache[3] = -z;
                                }
                                else if (this.curveType === 6) {
                                    this.flatLeafCoefCache[0] = 0.0;
                                    this.flatLeafCoefCache[1] = y - 2 * x;
                                    this.flatLeafCoefCache[2] = 2 * x;
                                    this.flatLeafCoefCache[3] = -y;
                                }
                            }
                            var a = this.flatLeafCoefCache[0];
                            var b = this.flatLeafCoefCache[1];
                            var c = this.flatLeafCoefCache[2];
                            var d = t * this.flatLeafCoefCache[3];
                            var n = sun.java2d.pisces.Helpers.cubicRootsInAB(a, b, c, d, this.nextRoots, 0, 0, 1);
                            if (n === 1 && !isNaN(this.nextRoots[0])) {
                                t = this.nextRoots[0];
                            }
                        }
                        t = t * (this.nextT - this.lastT) + this.lastT;
                        if (t >= 1) {
                            t = 1;
                            this.done = true;
                        }
                        this.__lastSegLen = len;
                        return t;
                    };
                    LengthIterator.prototype.lastSegLen = function () {
                        return this.__lastSegLen;
                    };
                    LengthIterator.prototype.goToNextLeaf = function () {
                        this.recLevel--;
                        while ((this.sides[this.recLevel] === LengthIterator.Side.RIGHT)) {
                            if (this.recLevel === 0) {
                                this.done = true;
                                return;
                            }
                            this.recLevel--;
                        }
                        ;
                        this.sides[this.recLevel] = LengthIterator.Side.RIGHT;
                        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
                            while (--size >= 0)
                                dstPts[dstOff++] = srcPts[srcOff++];
                        }
                        else {
                            var tmp = srcPts.slice(srcOff, srcOff + size);
                            for (var i = 0; i < size; i++)
                                dstPts[dstOff++] = tmp[i];
                        } })(this.recCurveStack[this.recLevel], 0, this.recCurveStack[this.recLevel + 1], 0, this.curveType);
                        this.recLevel++;
                        this.goLeft();
                    };
                    LengthIterator.prototype.goLeft = function () {
                        var len = this.onLeaf();
                        if (len >= 0) {
                            this.lastT = this.nextT;
                            this.lenAtLastT = this.lenAtNextT;
                            this.nextT += (1 << (this.limit - this.recLevel)) * this.minTincrement;
                            this.lenAtNextT += len;
                            this.flatLeafCoefCache[2] = -1;
                            this.cachedHaveLowAcceleration = -1;
                        }
                        else {
                            sun.java2d.pisces.Helpers.subdivide(this.recCurveStack[this.recLevel], 0, this.recCurveStack[this.recLevel + 1], 0, this.recCurveStack[this.recLevel], 0, this.curveType);
                            this.sides[this.recLevel] = LengthIterator.Side.LEFT;
                            this.recLevel++;
                            this.goLeft();
                        }
                    };
                    LengthIterator.prototype.onLeaf = function () {
                        var curve = this.recCurveStack[this.recLevel];
                        var polyLen = 0;
                        var x0 = curve[0];
                        var y0 = curve[1];
                        for (var i = 2; i < this.curveType; i += 2) {
                            var x1 = curve[i];
                            var y1 = curve[i + 1];
                            var len = sun.java2d.pisces.Helpers.linelen(x0, y0, x1, y1);
                            polyLen += len;
                            this.curLeafCtrlPolyLengths[(i / 2 | 0) - 1] = len;
                            x0 = x1;
                            y0 = y1;
                        }
                        ;
                        var lineLen = sun.java2d.pisces.Helpers.linelen(curve[0], curve[1], curve[this.curveType - 2], curve[this.curveType - 1]);
                        if (polyLen - lineLen < this.ERR || this.recLevel === this.limit) {
                            return (polyLen + lineLen) / 2;
                        }
                        return -1;
                    };
                    return LengthIterator;
                }());
                Dasher.LengthIterator = LengthIterator;
                LengthIterator["__class"] = "sun.java2d.pisces.Dasher.LengthIterator";
                (function (LengthIterator) {
                    var Side;
                    (function (Side) {
                        Side[Side["LEFT"] = 0] = "LEFT";
                        Side[Side["RIGHT"] = 1] = "RIGHT";
                    })(Side = LengthIterator.Side || (LengthIterator.Side = {}));
                })(LengthIterator = Dasher.LengthIterator || (Dasher.LengthIterator = {}));
            })(Dasher = pisces.Dasher || (pisces.Dasher = {}));
        })(pisces = java2d.pisces || (java2d.pisces = {}));
    })(java2d = sun.java2d || (sun.java2d = {}));
})(sun || (sun = {}));
var java;
(function (java) {
    var awt;
    (function (awt) {
        /**
         * Constructs a new <code>BasicStroke</code> with the specified
         * attributes.
         * @param {number} width the width of this <code>BasicStroke</code>.  The
         * width must be greater than or equal to 0.0f.  If width is
         * set to 0.0f, the stroke is rendered as the thinnest
         * possible line for the target device and the antialias
         * hint setting.
         * @param {number} cap the decoration of the ends of a <code>BasicStroke</code>
         * @param {number} join the decoration applied where path segments meet
         * @param {number} miterlimit the limit to trim the miter join.  The miterlimit
         * must be greater than or equal to 1.0f.
         * @param {Array} dash the array representing the dashing pattern
         * @param {number} dash_phase the offset to start the dashing pattern
         * @throws IllegalArgumentException if <code>width</code> is negative
         * @throws IllegalArgumentException if <code>cap</code> is not either
         * CAP_BUTT, CAP_ROUND or CAP_SQUARE
         * @throws IllegalArgumentException if <code>miterlimit</code> is less
         * than 1 and <code>join</code> is JOIN_MITER
         * @throws IllegalArgumentException if <code>join</code> is not
         * either JOIN_ROUND, JOIN_BEVEL, or JOIN_MITER
         * @throws IllegalArgumentException if <code>dash_phase</code>
         * is negative and <code>dash</code> is not <code>null</code>
         * @throws IllegalArgumentException if the length of
         * <code>dash</code> is zero
         * @throws IllegalArgumentException if dash lengths are all zero.
         * @class
         * @author Jim Graham
         */
        var BasicStroke = (function () {
            function BasicStroke(width, cap, join, miterlimit, dash, dash_phase) {
                var _this = this;
                if (((typeof width === 'number') || width === null) && ((typeof cap === 'number') || cap === null) && ((typeof join === 'number') || join === null) && ((typeof miterlimit === 'number') || miterlimit === null) && ((dash != null && dash instanceof Array && (dash.length == 0 || dash[0] == null || (typeof dash[0] === 'number'))) || dash === null) && ((typeof dash_phase === 'number') || dash_phase === null)) {
                    var __args = Array.prototype.slice.call(arguments);
                    this.width = 0;
                    this.join = 0;
                    this.cap = 0;
                    this.miterlimit = 0;
                    this.dash = null;
                    this.dash_phase = 0;
                    this.width = 0;
                    this.join = 0;
                    this.cap = 0;
                    this.miterlimit = 0;
                    this.dash = null;
                    this.dash_phase = 0;
                    (function () {
                        if (width < 0.0) {
                            throw Object.defineProperty(new Error("negative width"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                        }
                        if (cap !== BasicStroke.CAP_BUTT && cap !== BasicStroke.CAP_ROUND && cap !== BasicStroke.CAP_SQUARE) {
                            throw Object.defineProperty(new Error("illegal end cap value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                        }
                        if (join === BasicStroke.JOIN_MITER) {
                            if (miterlimit < 1.0) {
                                throw Object.defineProperty(new Error("miter limit < 1"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                        }
                        else if (join !== BasicStroke.JOIN_ROUND && join !== BasicStroke.JOIN_BEVEL) {
                            throw Object.defineProperty(new Error("illegal line join value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                        }
                        if (dash != null) {
                            if (dash_phase < 0.0) {
                                throw Object.defineProperty(new Error("negative dash phase"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            var allzero = true;
                            for (var i = 0; i < dash.length; i++) {
                                var d = dash[i];
                                if (d > 0.0) {
                                    allzero = false;
                                }
                                else if (d < 0.0) {
                                    throw Object.defineProperty(new Error("negative dash length"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            ;
                            if (allzero) {
                                throw Object.defineProperty(new Error("dash lengths all zero"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                        }
                        _this.width = width;
                        _this.cap = cap;
                        _this.join = join;
                        _this.miterlimit = miterlimit;
                        if (dash != null) {
                            _this.dash = dash.slice(0);
                        }
                        _this.dash_phase = dash_phase;
                    })();
                }
                else if (((typeof width === 'number') || width === null) && ((typeof cap === 'number') || cap === null) && ((typeof join === 'number') || join === null) && ((typeof miterlimit === 'number') || miterlimit === null) && dash === undefined && dash_phase === undefined) {
                    var __args = Array.prototype.slice.call(arguments);
                    {
                        var __args_1 = Array.prototype.slice.call(arguments);
                        var dash_1 = null;
                        var dash_phase_1 = 0.0;
                        this.width = 0;
                        this.join = 0;
                        this.cap = 0;
                        this.miterlimit = 0;
                        this.dash = null;
                        this.dash_phase = 0;
                        this.width = 0;
                        this.join = 0;
                        this.cap = 0;
                        this.miterlimit = 0;
                        this.dash = null;
                        this.dash_phase = 0;
                        (function () {
                            if (width < 0.0) {
                                throw Object.defineProperty(new Error("negative width"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (cap !== BasicStroke.CAP_BUTT && cap !== BasicStroke.CAP_ROUND && cap !== BasicStroke.CAP_SQUARE) {
                                throw Object.defineProperty(new Error("illegal end cap value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (join === BasicStroke.JOIN_MITER) {
                                if (miterlimit < 1.0) {
                                    throw Object.defineProperty(new Error("miter limit < 1"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            else if (join !== BasicStroke.JOIN_ROUND && join !== BasicStroke.JOIN_BEVEL) {
                                throw Object.defineProperty(new Error("illegal line join value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (dash_1 != null) {
                                if (dash_phase_1 < 0.0) {
                                    throw Object.defineProperty(new Error("negative dash phase"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                                var allzero = true;
                                for (var i = 0; i < dash_1.length; i++) {
                                    var d = dash_1[i];
                                    if (d > 0.0) {
                                        allzero = false;
                                    }
                                    else if (d < 0.0) {
                                        throw Object.defineProperty(new Error("negative dash length"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                    }
                                }
                                ;
                                if (allzero) {
                                    throw Object.defineProperty(new Error("dash lengths all zero"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            _this.width = width;
                            _this.cap = cap;
                            _this.join = join;
                            _this.miterlimit = miterlimit;
                            if (dash_1 != null) {
                                _this.dash = dash_1.slice(0);
                            }
                            _this.dash_phase = dash_phase_1;
                        })();
                    }
                }
                else if (((typeof width === 'number') || width === null) && ((typeof cap === 'number') || cap === null) && ((typeof join === 'number') || join === null) && miterlimit === undefined && dash === undefined && dash_phase === undefined) {
                    var __args = Array.prototype.slice.call(arguments);
                    {
                        var __args_2 = Array.prototype.slice.call(arguments);
                        var miterlimit_1 = 10.0;
                        var dash_2 = null;
                        var dash_phase_2 = 0.0;
                        this.width = 0;
                        this.join = 0;
                        this.cap = 0;
                        this.miterlimit = 0;
                        this.dash = null;
                        this.dash_phase = 0;
                        this.width = 0;
                        this.join = 0;
                        this.cap = 0;
                        this.miterlimit = 0;
                        this.dash = null;
                        this.dash_phase = 0;
                        (function () {
                            if (width < 0.0) {
                                throw Object.defineProperty(new Error("negative width"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (cap !== BasicStroke.CAP_BUTT && cap !== BasicStroke.CAP_ROUND && cap !== BasicStroke.CAP_SQUARE) {
                                throw Object.defineProperty(new Error("illegal end cap value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (join === BasicStroke.JOIN_MITER) {
                                if (miterlimit_1 < 1.0) {
                                    throw Object.defineProperty(new Error("miter limit < 1"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            else if (join !== BasicStroke.JOIN_ROUND && join !== BasicStroke.JOIN_BEVEL) {
                                throw Object.defineProperty(new Error("illegal line join value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (dash_2 != null) {
                                if (dash_phase_2 < 0.0) {
                                    throw Object.defineProperty(new Error("negative dash phase"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                                var allzero = true;
                                for (var i = 0; i < dash_2.length; i++) {
                                    var d = dash_2[i];
                                    if (d > 0.0) {
                                        allzero = false;
                                    }
                                    else if (d < 0.0) {
                                        throw Object.defineProperty(new Error("negative dash length"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                    }
                                }
                                ;
                                if (allzero) {
                                    throw Object.defineProperty(new Error("dash lengths all zero"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            _this.width = width;
                            _this.cap = cap;
                            _this.join = join;
                            _this.miterlimit = miterlimit_1;
                            if (dash_2 != null) {
                                _this.dash = dash_2.slice(0);
                            }
                            _this.dash_phase = dash_phase_2;
                        })();
                    }
                }
                else if (((typeof width === 'number') || width === null) && cap === undefined && join === undefined && miterlimit === undefined && dash === undefined && dash_phase === undefined) {
                    var __args = Array.prototype.slice.call(arguments);
                    {
                        var __args_3 = Array.prototype.slice.call(arguments);
                        var cap_1 = BasicStroke.CAP_SQUARE;
                        var join_1 = BasicStroke.JOIN_MITER;
                        var miterlimit_2 = 10.0;
                        var dash_3 = null;
                        var dash_phase_3 = 0.0;
                        this.width = 0;
                        this.join = 0;
                        this.cap = 0;
                        this.miterlimit = 0;
                        this.dash = null;
                        this.dash_phase = 0;
                        this.width = 0;
                        this.join = 0;
                        this.cap = 0;
                        this.miterlimit = 0;
                        this.dash = null;
                        this.dash_phase = 0;
                        (function () {
                            if (width < 0.0) {
                                throw Object.defineProperty(new Error("negative width"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (cap_1 !== BasicStroke.CAP_BUTT && cap_1 !== BasicStroke.CAP_ROUND && cap_1 !== BasicStroke.CAP_SQUARE) {
                                throw Object.defineProperty(new Error("illegal end cap value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (join_1 === BasicStroke.JOIN_MITER) {
                                if (miterlimit_2 < 1.0) {
                                    throw Object.defineProperty(new Error("miter limit < 1"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            else if (join_1 !== BasicStroke.JOIN_ROUND && join_1 !== BasicStroke.JOIN_BEVEL) {
                                throw Object.defineProperty(new Error("illegal line join value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (dash_3 != null) {
                                if (dash_phase_3 < 0.0) {
                                    throw Object.defineProperty(new Error("negative dash phase"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                                var allzero = true;
                                for (var i = 0; i < dash_3.length; i++) {
                                    var d = dash_3[i];
                                    if (d > 0.0) {
                                        allzero = false;
                                    }
                                    else if (d < 0.0) {
                                        throw Object.defineProperty(new Error("negative dash length"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                    }
                                }
                                ;
                                if (allzero) {
                                    throw Object.defineProperty(new Error("dash lengths all zero"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            _this.width = width;
                            _this.cap = cap_1;
                            _this.join = join_1;
                            _this.miterlimit = miterlimit_2;
                            if (dash_3 != null) {
                                _this.dash = dash_3.slice(0);
                            }
                            _this.dash_phase = dash_phase_3;
                        })();
                    }
                }
                else if (width === undefined && cap === undefined && join === undefined && miterlimit === undefined && dash === undefined && dash_phase === undefined) {
                    var __args = Array.prototype.slice.call(arguments);
                    {
                        var __args_4 = Array.prototype.slice.call(arguments);
                        var width_1 = 1.0;
                        var cap_2 = BasicStroke.CAP_SQUARE;
                        var join_2 = BasicStroke.JOIN_MITER;
                        var miterlimit_3 = 10.0;
                        var dash_4 = null;
                        var dash_phase_4 = 0.0;
                        this.width = 0;
                        this.join = 0;
                        this.cap = 0;
                        this.miterlimit = 0;
                        this.dash = null;
                        this.dash_phase = 0;
                        this.width = 0;
                        this.join = 0;
                        this.cap = 0;
                        this.miterlimit = 0;
                        this.dash = null;
                        this.dash_phase = 0;
                        (function () {
                            if (width_1 < 0.0) {
                                throw Object.defineProperty(new Error("negative width"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (cap_2 !== BasicStroke.CAP_BUTT && cap_2 !== BasicStroke.CAP_ROUND && cap_2 !== BasicStroke.CAP_SQUARE) {
                                throw Object.defineProperty(new Error("illegal end cap value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (join_2 === BasicStroke.JOIN_MITER) {
                                if (miterlimit_3 < 1.0) {
                                    throw Object.defineProperty(new Error("miter limit < 1"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            else if (join_2 !== BasicStroke.JOIN_ROUND && join_2 !== BasicStroke.JOIN_BEVEL) {
                                throw Object.defineProperty(new Error("illegal line join value"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                            }
                            if (dash_4 != null) {
                                if (dash_phase_4 < 0.0) {
                                    throw Object.defineProperty(new Error("negative dash phase"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                                var allzero = true;
                                for (var i = 0; i < dash_4.length; i++) {
                                    var d = dash_4[i];
                                    if (d > 0.0) {
                                        allzero = false;
                                    }
                                    else if (d < 0.0) {
                                        throw Object.defineProperty(new Error("negative dash length"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                    }
                                }
                                ;
                                if (allzero) {
                                    throw Object.defineProperty(new Error("dash lengths all zero"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.Object', 'java.lang.RuntimeException', 'java.lang.IllegalArgumentException', 'java.lang.Exception'] });
                                }
                            }
                            _this.width = width_1;
                            _this.cap = cap_2;
                            _this.join = join_2;
                            _this.miterlimit = miterlimit_3;
                            if (dash_4 != null) {
                                _this.dash = dash_4.slice(0);
                            }
                            _this.dash_phase = dash_phase_4;
                        })();
                    }
                }
                else
                    throw new Error('invalid overload');
            }
            /**
             * Returns a <code>Shape</code> whose interior defines the
             * stroked outline of a specified <code>Shape</code>.
             * @param {*} s the <code>Shape</code> boundary be stroked
             * @return {*} the <code>Shape</code> of the stroked outline.
             */
            BasicStroke.prototype.createStrokedShape = function (s) {
                var re = new sun.java2d.pisces.PiscesRenderingEngine();
                return re.createStrokedShape(s, this.width, this.cap, this.join, this.miterlimit, this.dash, this.dash_phase);
            };
            /**
             * Returns the line width.  Line width is represented in user space,
             * which is the default-coordinate space used by Java 2D.  See the
             * <code>Graphics2D</code> class comments for more information on
             * the user space coordinate system.
             * @return {number} the line width of this <code>BasicStroke</code>.
             * @see Graphics2D
             */
            BasicStroke.prototype.getLineWidth = function () {
                return this.width;
            };
            /**
             * Returns the end cap style.
             * @return {number} the end cap style of this <code>BasicStroke</code> as one
             * of the static <code>int</code> values that define possible end cap
             * styles.
             */
            BasicStroke.prototype.getEndCap = function () {
                return this.cap;
            };
            /**
             * Returns the line join style.
             * @return {number} the line join style of the <code>BasicStroke</code> as one
             * of the static <code>int</code> values that define possible line
             * join styles.
             */
            BasicStroke.prototype.getLineJoin = function () {
                return this.join;
            };
            /**
             * Returns the limit of miter joins.
             * @return {number} the limit of miter joins of the <code>BasicStroke</code>.
             */
            BasicStroke.prototype.getMiterLimit = function () {
                return this.miterlimit;
            };
            /**
             * Returns the array representing the lengths of the dash segments.
             * Alternate entries in the array represent the user space lengths
             * of the opaque and transparent segments of the dashes.
             * As the pen moves along the outline of the <code>Shape</code>
             * to be stroked, the user space
             * distance that the pen travels is accumulated.  The distance
             * value is used to index into the dash array.
             * The pen is opaque when its current cumulative distance maps
             * to an even element of the dash array and transparent otherwise.
             * @return {Array} the dash array.
             */
            BasicStroke.prototype.getDashArray = function () {
                if (this.dash == null) {
                    return null;
                }
                return this.dash.slice(0);
            };
            /**
             * Returns the current dash phase.
             * The dash phase is a distance specified in user coordinates that
             * represents an offset into the dashing pattern. In other words, the dash
             * phase defines the point in the dashing pattern that will correspond to
             * the beginning of the stroke.
             * @return {number} the dash phase as a <code>float</code> value.
             */
            BasicStroke.prototype.getDashPhase = function () {
                return this.dash_phase;
            };
            /**
             * Returns the hashcode for this stroke.
             * @return      {number} a hash code for this stroke.
             */
            BasicStroke.prototype.hashCode = function () {
                var hash = (function (f) { var buf = new ArrayBuffer(4); (new Float32Array(buf))[0] = f; return (new Uint32Array(buf))[0]; })(this.width);
                hash = hash * 31 + this.join;
                hash = hash * 31 + this.cap;
                hash = hash * 31 + (function (f) { var buf = new ArrayBuffer(4); (new Float32Array(buf))[0] = f; return (new Uint32Array(buf))[0]; })(this.miterlimit);
                if (this.dash != null) {
                    hash = hash * 31 + (function (f) { var buf = new ArrayBuffer(4); (new Float32Array(buf))[0] = f; return (new Uint32Array(buf))[0]; })(this.dash_phase);
                    for (var i = 0; i < this.dash.length; i++) {
                        hash = hash * 31 + (function (f) { var buf = new ArrayBuffer(4); (new Float32Array(buf))[0] = f; return (new Uint32Array(buf))[0]; })(this.dash[i]);
                    }
                    ;
                }
                return hash;
            };
            /**
             * Tests if a specified object is equal to this <code>BasicStroke</code>
             * by first testing if it is a <code>BasicStroke</code> and then comparing
             * its width, join, cap, miter limit, dash, and dash phase attributes with
             * those of this <code>BasicStroke</code>.
             * @param  {*} obj the specified object to compare to this
             * <code>BasicStroke</code>
             * @return {boolean} <code>true</code> if the width, join, cap, miter limit, dash, and
             * dash phase are the same for both objects;
             * <code>false</code> otherwise.
             */
            BasicStroke.prototype.equals = function (obj) {
                if (!(obj != null && obj instanceof java.awt.BasicStroke)) {
                    return false;
                }
                var bs = obj;
                if (this.width !== bs.width) {
                    return false;
                }
                if (this.join !== bs.join) {
                    return false;
                }
                if (this.cap !== bs.cap) {
                    return false;
                }
                if (this.miterlimit !== bs.miterlimit) {
                    return false;
                }
                if (this.dash != null) {
                    if (this.dash_phase !== bs.dash_phase) {
                        return false;
                    }
                    if (!(function (a1, a2) { if (a1 == null && a2 == null)
                        return true; if (a1 == null || a2 == null)
                        return false; if (a1.length != a2.length)
                        return false; for (var i = 0; i < a1.length; i++) {
                        if (a1[i] != a2[i])
                            return false;
                    } return true; })(this.dash, bs.dash)) {
                        return false;
                    }
                }
                else if (bs.dash != null) {
                    return false;
                }
                return true;
            };
            return BasicStroke;
        }());
        /**
         * Joins path segments by extending their outside edges until
         * they meet.
         */
        BasicStroke.JOIN_MITER = 0;
        /**
         * Joins path segments by rounding off the corner at a radius
         * of half the line width.
         */
        BasicStroke.JOIN_ROUND = 1;
        /**
         * Joins path segments by connecting the outer corners of their
         * wide outlines with a straight segment.
         */
        BasicStroke.JOIN_BEVEL = 2;
        /**
         * Ends unclosed subpaths and dash segments with no added
         * decoration.
         */
        BasicStroke.CAP_BUTT = 0;
        /**
         * Ends unclosed subpaths and dash segments with a round
         * decoration that has a radius equal to half of the width
         * of the pen.
         */
        BasicStroke.CAP_ROUND = 1;
        /**
         * Ends unclosed subpaths and dash segments with a square
         * projection that extends beyond the end of the segment
         * to a distance equal to half of the line width.
         */
        BasicStroke.CAP_SQUARE = 2;
        awt.BasicStroke = BasicStroke;
        BasicStroke["__class"] = "java.awt.BasicStroke";
        BasicStroke["__interfaces"] = ["java.awt.Stroke"];
    })(awt = java.awt || (java.awt = {}));
})(java || (java = {}));
(function (sun) {
    var java2d;
    (function (java2d) {
        var pisces;
        (function (pisces) {
            var PiscesRenderingEngine = (function (_super) {
                __extends(PiscesRenderingEngine, _super);
                function PiscesRenderingEngine() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /**
                 * Create a widened path as specified by the parameters.
                 * <p>
                 * The specified {@code src} {@link Shape} is widened according
                 * to the specified attribute parameters as per the
                 * {@link BasicStroke} specification.
                 *
                 * @param {*} src the source path to be widened
                 * @param {number} width the width of the widened path as per {@code BasicStroke}
                 * @param {number} caps the end cap decorations as per {@code BasicStroke}
                 * @param {number} join the segment join decorations as per {@code BasicStroke}
                 * @param {number} miterlimit the miter limit as per {@code BasicStroke}
                 * @param {Array} dashes the dash length array as per {@code BasicStroke}
                 * @param {number} dashphase the initial dash phase as per {@code BasicStroke}
                 * @return {*} the widened path stored in a new {@code Shape} object
                 * @since 1.7
                 */
                PiscesRenderingEngine.prototype.createStrokedShape = function (src, width, caps, join, miterlimit, dashes, dashphase) {
                    var p2d = new java.awt.geom.Path2D.Float();
                    this.strokeTo(src, null, width, caps, join, miterlimit, dashes, dashphase, new PiscesRenderingEngine.PiscesRenderingEngine$0(this, p2d));
                    return p2d;
                };
                PiscesRenderingEngine.prototype.strokeTo = function (src, at, width, caps, join, miterlimit, dashes, dashphase, pc2d) {
                    var strokerat = null;
                    var outat = null;
                    var pi = null;
                    if (at != null && !at.isIdentity()) {
                        var a = at.getScaleX();
                        var b = at.getShearX();
                        var c = at.getShearY();
                        var d = at.getScaleY();
                        var det = a * d - c * b;
                        if (Math.abs(det) <= 2 * Number.MIN_VALUE) {
                            pc2d.moveTo(0, 0);
                            pc2d.pathDone();
                            return;
                        }
                        if (PiscesRenderingEngine.nearZero(a * b + c * d, 2) && PiscesRenderingEngine.nearZero(a * a + c * c - (b * b + d * d), 2)) {
                            var scale = Math.sqrt(a * a + c * c);
                            if (dashes != null) {
                                dashes = dashes.slice(0, dashes.length);
                                for (var i = 0; i < dashes.length; i++) {
                                    dashes[i] = (scale * dashes[i]);
                                }
                                ;
                                dashphase = (scale * dashphase);
                            }
                            width = (scale * width);
                            pi = src.getPathIterator(at);
                        }
                        else {
                            outat = at;
                            pi = src.getPathIterator(null);
                        }
                    }
                    else {
                        pi = src.getPathIterator(null);
                    }
                    pc2d = sun.java2d.pisces.TransformingPathConsumer2D.transformConsumer(pc2d, outat);
                    pc2d = sun.java2d.pisces.TransformingPathConsumer2D.deltaTransformConsumer(pc2d, strokerat);
                    pc2d = new sun.java2d.pisces.Stroker(pc2d, width, caps, join, miterlimit);
                    if (dashes != null) {
                        pc2d = new sun.java2d.pisces.Dasher(pc2d, dashes, dashphase);
                    }
                    pc2d = sun.java2d.pisces.TransformingPathConsumer2D.inverseDeltaTransformConsumer(pc2d, strokerat);
                    PiscesRenderingEngine.pathTo(pi, pc2d);
                };
                /*private*/ PiscesRenderingEngine.nearZero = function (num, nulps) {
                    return Math.abs(num) < nulps * (function (x) { var buffer = new ArrayBuffer(8); var dataView = new DataView(buffer); dataView.setFloat64(0, x); var first = dataView.getUint32(0); var second = dataView.getUint32(4); var rawExponent = first & 0x7ff00000; if (rawExponent == 0x7ff00000) {
                        dataView.setUint32(0, first & 0x7fffffff);
                    }
                    else if (rawExponent == 0) {
                        dataView.setUint32(4, 1);
                        dataView.setUint32(0, 0);
                    }
                    else if (rawExponent >= (52 << 20) + 0x00100000) {
                        dataView.setUint32(0, rawExponent - (52 << 20));
                        dataView.setUint32(4, 0);
                    }
                    else if (rawExponent >= (33 << 20)) {
                        dataView.setUint32(0, 1 << ((rawExponent - (33 << 20)) >>> 20));
                        dataView.setUint32(4, 0);
                    }
                    else {
                        dataView.setUint32(4, 1 << ((rawExponent - 0x00100000) >>> 20));
                        dataView.setUint32(0, 0);
                    } return dataView.getFloat64(0); })(num);
                };
                PiscesRenderingEngine.pathTo = function (pi, pc2d) {
                    sun.java2d.pipe.RenderingEngine.feedConsumer(pi, pc2d);
                    pc2d.pathDone();
                };
                return PiscesRenderingEngine;
            }(sun.java2d.pipe.RenderingEngine));
            pisces.PiscesRenderingEngine = PiscesRenderingEngine;
            PiscesRenderingEngine["__class"] = "sun.java2d.pisces.PiscesRenderingEngine";
            (function (PiscesRenderingEngine) {
                var PiscesRenderingEngine$0 = (function () {
                    function PiscesRenderingEngine$0(__parent, p2d) {
                        this.p2d = p2d;
                        this.__parent = __parent;
                    }
                    PiscesRenderingEngine$0.prototype.moveTo = function (x0, y0) {
                        this.p2d.moveTo(x0, y0);
                    };
                    PiscesRenderingEngine$0.prototype.lineTo = function (x1, y1) {
                        this.p2d.lineTo(x1, y1);
                    };
                    PiscesRenderingEngine$0.prototype.closePath = function () {
                        this.p2d.closePath();
                    };
                    PiscesRenderingEngine$0.prototype.pathDone = function () {
                    };
                    PiscesRenderingEngine$0.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
                        this.p2d.curveTo(x1, y1, x2, y2, x3, y3);
                    };
                    PiscesRenderingEngine$0.prototype.quadTo = function (x1, y1, x2, y2) {
                        this.p2d.quadTo(x1, y1, x2, y2);
                    };
                    PiscesRenderingEngine$0.prototype.getNativeConsumer = function () {
                        throw Object.defineProperty(new Error("Not using a native peer"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.VirtualMachineError', 'java.lang.InternalError', 'java.lang.Error', 'java.lang.Object'] });
                    };
                    return PiscesRenderingEngine$0;
                }());
                PiscesRenderingEngine.PiscesRenderingEngine$0 = PiscesRenderingEngine$0;
                PiscesRenderingEngine$0["__interfaces"] = ["sun.awt.geom.PathConsumer2D"];
            })(PiscesRenderingEngine = pisces.PiscesRenderingEngine || (pisces.PiscesRenderingEngine = {}));
        })(pisces = java2d.pisces || (java2d.pisces = {}));
    })(java2d = sun.java2d || (sun.java2d = {}));
})(sun || (sun = {}));
(function (sun) {
    var java2d;
    (function (java2d) {
        var pisces;
        (function (pisces) {
            /**
             * Constructs a <code>Stroker</code>.
             *
             * @param {*} pc2d an output <code>PathConsumer2D</code>.
             * @param {number} lineWidth the desired line width in pixels
             * @param {number} capStyle the desired end cap style, one of
             * <code>CAP_BUTT</code>, <code>CAP_ROUND</code> or
             * <code>CAP_SQUARE</code>.
             * @param {number} joinStyle the desired line join style, one of
             * <code>JOIN_MITER</code>, <code>JOIN_ROUND</code> or
             * <code>JOIN_BEVEL</code>.
             * @param {number} miterLimit the desired miter limit
             * @class
             */
            var Stroker = (function () {
                function Stroker(pc2d, lineWidth, capStyle, joinStyle, miterLimit) {
                    /*private*/ this.offset = (function (dims) { var allocate = function (dims) { if (dims.length == 0) {
                        return 0;
                    }
                    else {
                        var array = [];
                        for (var i = 0; i < dims[0]; i++) {
                            array.push(allocate(dims.slice(1)));
                        }
                        return array;
                    } }; return allocate(dims); })([3, 2]);
                    /*private*/ this.miter = [0, 0];
                    /*private*/ this.reverse = new Stroker.PolyStack();
                    /*private*/ this.middle = (function (s) { var a = []; while (s-- > 0)
                        a.push(0); return a; })(2 * 8);
                    /*private*/ this.lp = [0, 0, 0, 0, 0, 0, 0, 0];
                    /*private*/ this.rp = [0, 0, 0, 0, 0, 0, 0, 0];
                    /*private*/ this.subdivTs = (function (s) { var a = []; while (s-- > 0)
                        a.push(0); return a; })(Stroker.MAX_N_CURVES - 1);
                    this.out = null;
                    this.capStyle = 0;
                    this.joinStyle = 0;
                    this.lineWidth2 = 0;
                    this.miterLimitSq = 0;
                    this.prev = 0;
                    this.sx0 = 0;
                    this.sy0 = 0;
                    this.sdx = 0;
                    this.sdy = 0;
                    this.cx0 = 0;
                    this.cy0 = 0;
                    this.cdx = 0;
                    this.cdy = 0;
                    this.smx = 0;
                    this.smy = 0;
                    this.cmx = 0;
                    this.cmy = 0;
                    this.out = pc2d;
                    this.lineWidth2 = lineWidth / 2;
                    this.capStyle = capStyle;
                    this.joinStyle = joinStyle;
                    var limit = miterLimit * this.lineWidth2;
                    this.miterLimitSq = limit * limit;
                    this.prev = Stroker.CLOSE;
                }
                Stroker.computeOffset = function (lx, ly, w, m) {
                    var len = Math.sqrt(lx * lx + ly * ly);
                    if (len === 0) {
                        m[0] = m[1] = 0;
                    }
                    else {
                        m[0] = (ly * w) / len;
                        m[1] = -(lx * w) / len;
                    }
                };
                Stroker.isCW = function (dx1, dy1, dx2, dy2) {
                    return dx1 * dy2 <= dy1 * dx2;
                };
                Stroker.ROUND_JOIN_THRESHOLD_$LI$ = function () { if (Stroker.ROUND_JOIN_THRESHOLD == null)
                    Stroker.ROUND_JOIN_THRESHOLD = 1000 / 65536.0; return Stroker.ROUND_JOIN_THRESHOLD; };
                ;
                Stroker.prototype.drawRoundJoin$float$float$float$float$float$float$boolean$float = function (x, y, omx, omy, mx, my, rev, threshold) {
                    if ((omx === 0 && omy === 0) || (mx === 0 && my === 0)) {
                        return;
                    }
                    var domx = omx - mx;
                    var domy = omy - my;
                    var len = domx * domx + domy * domy;
                    if (len < threshold) {
                        return;
                    }
                    if (rev) {
                        omx = -omx;
                        omy = -omy;
                        mx = -mx;
                        my = -my;
                    }
                    this.drawRoundJoin$float$float$float$float$float$float$boolean(x, y, omx, omy, mx, my, rev);
                };
                Stroker.prototype.drawRoundJoin = function (x, y, omx, omy, mx, my, rev, threshold) {
                    if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof omx === 'number') || omx === null) && ((typeof omy === 'number') || omy === null) && ((typeof mx === 'number') || mx === null) && ((typeof my === 'number') || my === null) && ((typeof rev === 'boolean') || rev === null) && ((typeof threshold === 'number') || threshold === null)) {
                        return this.drawRoundJoin$float$float$float$float$float$float$boolean$float(x, y, omx, omy, mx, my, rev, threshold);
                    }
                    else if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof omx === 'number') || omx === null) && ((typeof omy === 'number') || omy === null) && ((typeof mx === 'number') || mx === null) && ((typeof my === 'number') || my === null) && ((typeof rev === 'boolean') || rev === null) && threshold === undefined) {
                        return this.drawRoundJoin$float$float$float$float$float$float$boolean(x, y, omx, omy, mx, my, rev);
                    }
                    else
                        throw new Error('invalid overload');
                };
                Stroker.prototype.drawRoundJoin$float$float$float$float$float$float$boolean = function (cx, cy, omx, omy, mx, my, rev) {
                    var cosext = omx * mx + omy * my;
                    var numCurves = cosext >= 0 ? 1 : 2;
                    switch ((numCurves)) {
                        case 1:
                            this.drawBezApproxForArc(cx, cy, omx, omy, mx, my, rev);
                            break;
                        case 2:
                            var nx = my - omy;
                            var ny = omx - mx;
                            var nlen = Math.sqrt(nx * nx + ny * ny);
                            var scale = this.lineWidth2 / nlen;
                            var mmx = nx * scale;
                            var mmy = ny * scale;
                            if (rev) {
                                mmx = -mmx;
                                mmy = -mmy;
                            }
                            this.drawBezApproxForArc(cx, cy, omx, omy, mmx, mmy, rev);
                            this.drawBezApproxForArc(cx, cy, mmx, mmy, mx, my, rev);
                            break;
                    }
                };
                Stroker.prototype.drawBezApproxForArc = function (cx, cy, omx, omy, mx, my, rev) {
                    var cosext2 = (omx * mx + omy * my) / (2 * this.lineWidth2 * this.lineWidth2);
                    var cv = ((4.0 / 3.0) * Math.sqrt(0.5 - cosext2) / (1.0 + Math.sqrt(cosext2 + 0.5)));
                    if (rev) {
                        cv = -cv;
                    }
                    var x1 = cx + omx;
                    var y1 = cy + omy;
                    var x2 = x1 - cv * omy;
                    var y2 = y1 + cv * omx;
                    var x4 = cx + mx;
                    var y4 = cy + my;
                    var x3 = x4 + cv * my;
                    var y3 = y4 - cv * mx;
                    this.emitCurveTo(x1, y1, x2, y2, x3, y3, x4, y4, rev);
                };
                Stroker.prototype.drawRoundCap = function (cx, cy, mx, my) {
                    var C = 0.5522848;
                    this.emitCurveTo(cx + mx, cy + my, cx + mx - C * my, cy + my + C * mx, cx - my + C * mx, cy + mx + C * my, cx - my, cy + mx, false);
                    this.emitCurveTo(cx - my, cy + mx, cx - my - C * mx, cy + mx - C * my, cx - mx - C * my, cy - my + C * mx, cx - mx, cy - my, false);
                };
                Stroker.prototype.computeIntersection = function (x0, y0, x1, y1, x0p, y0p, x1p, y1p, m, off) {
                    var x10 = x1 - x0;
                    var y10 = y1 - y0;
                    var x10p = x1p - x0p;
                    var y10p = y1p - y0p;
                    var den = x10 * y10p - x10p * y10;
                    var t = x10p * (y0 - y0p) - y10p * (x0 - x0p);
                    t /= den;
                    m[off++] = x0 + t * x10;
                    m[off] = y0 + t * y10;
                };
                Stroker.prototype.drawMiter = function (pdx, pdy, x0, y0, dx, dy, omx, omy, mx, my, rev) {
                    if ((mx === omx && my === omy) || (pdx === 0 && pdy === 0) || (dx === 0 && dy === 0)) {
                        return;
                    }
                    if (rev) {
                        omx = -omx;
                        omy = -omy;
                        mx = -mx;
                        my = -my;
                    }
                    this.computeIntersection((x0 - pdx) + omx, (y0 - pdy) + omy, x0 + omx, y0 + omy, (dx + x0) + mx, (dy + y0) + my, x0 + mx, y0 + my, this.miter, 0);
                    var lenSq = (this.miter[0] - x0) * (this.miter[0] - x0) + (this.miter[1] - y0) * (this.miter[1] - y0);
                    if (lenSq < this.miterLimitSq) {
                        this.emitLineTo$float$float$boolean(this.miter[0], this.miter[1], rev);
                    }
                };
                Stroker.prototype.moveTo = function (x0, y0) {
                    if (this.prev === Stroker.DRAWING_OP_TO) {
                        this.finish();
                    }
                    this.sx0 = this.cx0 = x0;
                    this.sy0 = this.cy0 = y0;
                    this.cdx = this.sdx = 1;
                    this.cdy = this.sdy = 0;
                    this.prev = Stroker.MOVE_TO;
                };
                Stroker.prototype.lineTo = function (x1, y1) {
                    var dx = x1 - this.cx0;
                    var dy = y1 - this.cy0;
                    if (dx === 0.0 && dy === 0.0) {
                        dx = 1;
                    }
                    Stroker.computeOffset(dx, dy, this.lineWidth2, this.offset[0]);
                    var mx = this.offset[0][0];
                    var my = this.offset[0][1];
                    this.drawJoin(this.cdx, this.cdy, this.cx0, this.cy0, dx, dy, this.cmx, this.cmy, mx, my);
                    this.emitLineTo$float$float(this.cx0 + mx, this.cy0 + my);
                    this.emitLineTo$float$float(x1 + mx, y1 + my);
                    this.emitLineTo$float$float$boolean(this.cx0 - mx, this.cy0 - my, true);
                    this.emitLineTo$float$float$boolean(x1 - mx, y1 - my, true);
                    this.cmx = mx;
                    this.cmy = my;
                    this.cdx = dx;
                    this.cdy = dy;
                    this.cx0 = x1;
                    this.cy0 = y1;
                    this.prev = Stroker.DRAWING_OP_TO;
                };
                Stroker.prototype.closePath = function () {
                    if (this.prev !== Stroker.DRAWING_OP_TO) {
                        if (this.prev === Stroker.CLOSE) {
                            return;
                        }
                        this.emitMoveTo(this.cx0, this.cy0 - this.lineWidth2);
                        this.cmx = this.smx = 0;
                        this.cmy = this.smy = -this.lineWidth2;
                        this.cdx = this.sdx = 1;
                        this.cdy = this.sdy = 0;
                        this.finish();
                        return;
                    }
                    if (this.cx0 !== this.sx0 || this.cy0 !== this.sy0) {
                        this.lineTo(this.sx0, this.sy0);
                    }
                    this.drawJoin(this.cdx, this.cdy, this.cx0, this.cy0, this.sdx, this.sdy, this.cmx, this.cmy, this.smx, this.smy);
                    this.emitLineTo$float$float(this.sx0 + this.smx, this.sy0 + this.smy);
                    this.emitMoveTo(this.sx0 - this.smx, this.sy0 - this.smy);
                    this.emitReverse();
                    this.prev = Stroker.CLOSE;
                    this.emitClose();
                };
                Stroker.prototype.emitReverse = function () {
                    while ((!this.reverse.isEmpty())) {
                        this.reverse.pop$sun_awt_geom_PathConsumer2D(this.out);
                    }
                    ;
                };
                Stroker.prototype.pathDone = function () {
                    if (this.prev === Stroker.DRAWING_OP_TO) {
                        this.finish();
                    }
                    this.out.pathDone();
                    this.prev = Stroker.CLOSE;
                };
                Stroker.prototype.finish = function () {
                    if (this.capStyle === Stroker.CAP_ROUND) {
                        this.drawRoundCap(this.cx0, this.cy0, this.cmx, this.cmy);
                    }
                    else if (this.capStyle === Stroker.CAP_SQUARE) {
                        this.emitLineTo$float$float(this.cx0 - this.cmy + this.cmx, this.cy0 + this.cmx + this.cmy);
                        this.emitLineTo$float$float(this.cx0 - this.cmy - this.cmx, this.cy0 + this.cmx - this.cmy);
                    }
                    this.emitReverse();
                    if (this.capStyle === Stroker.CAP_ROUND) {
                        this.drawRoundCap(this.sx0, this.sy0, -this.smx, -this.smy);
                    }
                    else if (this.capStyle === Stroker.CAP_SQUARE) {
                        this.emitLineTo$float$float(this.sx0 + this.smy - this.smx, this.sy0 - this.smx - this.smy);
                        this.emitLineTo$float$float(this.sx0 + this.smy + this.smx, this.sy0 - this.smx + this.smy);
                    }
                    this.emitClose();
                };
                Stroker.prototype.emitMoveTo = function (x0, y0) {
                    this.out.moveTo(x0, y0);
                };
                Stroker.prototype.emitLineTo$float$float = function (x1, y1) {
                    this.out.lineTo(x1, y1);
                };
                Stroker.prototype.emitLineTo$float$float$boolean = function (x1, y1, rev) {
                    if (rev) {
                        this.reverse.pushLine(x1, y1);
                    }
                    else {
                        this.emitLineTo$float$float(x1, y1);
                    }
                };
                Stroker.prototype.emitLineTo = function (x1, y1, rev) {
                    if (((typeof x1 === 'number') || x1 === null) && ((typeof y1 === 'number') || y1 === null) && ((typeof rev === 'boolean') || rev === null)) {
                        return this.emitLineTo$float$float$boolean(x1, y1, rev);
                    }
                    else if (((typeof x1 === 'number') || x1 === null) && ((typeof y1 === 'number') || y1 === null) && rev === undefined) {
                        return this.emitLineTo$float$float(x1, y1);
                    }
                    else
                        throw new Error('invalid overload');
                };
                Stroker.prototype.emitQuadTo = function (x0, y0, x1, y1, x2, y2, rev) {
                    if (rev) {
                        this.reverse.pushQuad(x0, y0, x1, y1);
                    }
                    else {
                        this.out.quadTo(x1, y1, x2, y2);
                    }
                };
                Stroker.prototype.emitCurveTo = function (x0, y0, x1, y1, x2, y2, x3, y3, rev) {
                    if (rev) {
                        this.reverse.pushCubic(x0, y0, x1, y1, x2, y2);
                    }
                    else {
                        this.out.curveTo(x1, y1, x2, y2, x3, y3);
                    }
                };
                Stroker.prototype.emitClose = function () {
                    this.out.closePath();
                };
                Stroker.prototype.drawJoin = function (pdx, pdy, x0, y0, dx, dy, omx, omy, mx, my) {
                    if (this.prev !== Stroker.DRAWING_OP_TO) {
                        this.emitMoveTo(x0 + mx, y0 + my);
                        this.sdx = dx;
                        this.sdy = dy;
                        this.smx = mx;
                        this.smy = my;
                    }
                    else {
                        var cw = Stroker.isCW(pdx, pdy, dx, dy);
                        if (this.joinStyle === Stroker.JOIN_MITER) {
                            this.drawMiter(pdx, pdy, x0, y0, dx, dy, omx, omy, mx, my, cw);
                        }
                        else if (this.joinStyle === Stroker.JOIN_ROUND) {
                            this.drawRoundJoin$float$float$float$float$float$float$boolean$float(x0, y0, omx, omy, mx, my, cw, Stroker.ROUND_JOIN_THRESHOLD_$LI$());
                        }
                        this.emitLineTo$float$float$boolean(x0, y0, !cw);
                    }
                    this.prev = Stroker.DRAWING_OP_TO;
                };
                Stroker.within = function (x1, y1, x2, y2, ERR) {
                    return (sun.java2d.pisces.Helpers.within$float$float$float(x1, x2, ERR) && sun.java2d.pisces.Helpers.within$float$float$float(y1, y2, ERR));
                };
                Stroker.prototype.getLineOffsets = function (x1, y1, x2, y2, left, right) {
                    Stroker.computeOffset(x2 - x1, y2 - y1, this.lineWidth2, this.offset[0]);
                    left[0] = x1 + this.offset[0][0];
                    left[1] = y1 + this.offset[0][1];
                    left[2] = x2 + this.offset[0][0];
                    left[3] = y2 + this.offset[0][1];
                    right[0] = x1 - this.offset[0][0];
                    right[1] = y1 - this.offset[0][1];
                    right[2] = x2 - this.offset[0][0];
                    right[3] = y2 - this.offset[0][1];
                };
                Stroker.prototype.computeOffsetCubic = function (pts, off, leftOff, rightOff) {
                    var x1 = pts[off + 0];
                    var y1 = pts[off + 1];
                    var x2 = pts[off + 2];
                    var y2 = pts[off + 3];
                    var x3 = pts[off + 4];
                    var y3 = pts[off + 5];
                    var x4 = pts[off + 6];
                    var y4 = pts[off + 7];
                    var dx4 = x4 - x3;
                    var dy4 = y4 - y3;
                    var dx1 = x2 - x1;
                    var dy1 = y2 - y1;
                    var p1eqp2 = Stroker.within(x1, y1, x2, y2, 6 * (function (x) { var buffer = new ArrayBuffer(8); var dataView = new DataView(buffer); dataView.setFloat64(0, x); var first = dataView.getUint32(0); var second = dataView.getUint32(4); var rawExponent = first & 0x7ff00000; if (rawExponent == 0x7ff00000) {
                        dataView.setUint32(0, first & 0x7fffffff);
                    }
                    else if (rawExponent == 0) {
                        dataView.setUint32(4, 1);
                        dataView.setUint32(0, 0);
                    }
                    else if (rawExponent >= (52 << 20) + 0x00100000) {
                        dataView.setUint32(0, rawExponent - (52 << 20));
                        dataView.setUint32(4, 0);
                    }
                    else if (rawExponent >= (33 << 20)) {
                        dataView.setUint32(0, 1 << ((rawExponent - (33 << 20)) >>> 20));
                        dataView.setUint32(4, 0);
                    }
                    else {
                        dataView.setUint32(4, 1 << ((rawExponent - 0x00100000) >>> 20));
                        dataView.setUint32(0, 0);
                    } return dataView.getFloat64(0); })(y2));
                    var p3eqp4 = Stroker.within(x3, y3, x4, y4, 6 * (function (x) { var buffer = new ArrayBuffer(8); var dataView = new DataView(buffer); dataView.setFloat64(0, x); var first = dataView.getUint32(0); var second = dataView.getUint32(4); var rawExponent = first & 0x7ff00000; if (rawExponent == 0x7ff00000) {
                        dataView.setUint32(0, first & 0x7fffffff);
                    }
                    else if (rawExponent == 0) {
                        dataView.setUint32(4, 1);
                        dataView.setUint32(0, 0);
                    }
                    else if (rawExponent >= (52 << 20) + 0x00100000) {
                        dataView.setUint32(0, rawExponent - (52 << 20));
                        dataView.setUint32(4, 0);
                    }
                    else if (rawExponent >= (33 << 20)) {
                        dataView.setUint32(0, 1 << ((rawExponent - (33 << 20)) >>> 20));
                        dataView.setUint32(4, 0);
                    }
                    else {
                        dataView.setUint32(4, 1 << ((rawExponent - 0x00100000) >>> 20));
                        dataView.setUint32(0, 0);
                    } return dataView.getFloat64(0); })(y4));
                    if (p1eqp2 && p3eqp4) {
                        this.getLineOffsets(x1, y1, x4, y4, leftOff, rightOff);
                        return 4;
                    }
                    else if (p1eqp2) {
                        dx1 = x3 - x1;
                        dy1 = y3 - y1;
                    }
                    else if (p3eqp4) {
                        dx4 = x4 - x2;
                        dy4 = y4 - y2;
                    }
                    var dotsq = (dx1 * dx4 + dy1 * dy4);
                    dotsq = dotsq * dotsq;
                    var l1sq = dx1 * dx1 + dy1 * dy1;
                    var l4sq = dx4 * dx4 + dy4 * dy4;
                    if (sun.java2d.pisces.Helpers.within$float$float$float(dotsq, l1sq * l4sq, 4 * (function (x) { var buffer = new ArrayBuffer(8); var dataView = new DataView(buffer); dataView.setFloat64(0, x); var first = dataView.getUint32(0); var second = dataView.getUint32(4); var rawExponent = first & 0x7ff00000; if (rawExponent == 0x7ff00000) {
                        dataView.setUint32(0, first & 0x7fffffff);
                    }
                    else if (rawExponent == 0) {
                        dataView.setUint32(4, 1);
                        dataView.setUint32(0, 0);
                    }
                    else if (rawExponent >= (52 << 20) + 0x00100000) {
                        dataView.setUint32(0, rawExponent - (52 << 20));
                        dataView.setUint32(4, 0);
                    }
                    else if (rawExponent >= (33 << 20)) {
                        dataView.setUint32(0, 1 << ((rawExponent - (33 << 20)) >>> 20));
                        dataView.setUint32(4, 0);
                    }
                    else {
                        dataView.setUint32(4, 1 << ((rawExponent - 0x00100000) >>> 20));
                        dataView.setUint32(0, 0);
                    } return dataView.getFloat64(0); })(dotsq))) {
                        this.getLineOffsets(x1, y1, x4, y4, leftOff, rightOff);
                        return 4;
                    }
                    var x = 0.125 * (x1 + 3 * (x2 + x3) + x4);
                    var y = 0.125 * (y1 + 3 * (y2 + y3) + y4);
                    var dxm = x3 + x4 - x1 - x2;
                    var dym = y3 + y4 - y1 - y2;
                    Stroker.computeOffset(dx1, dy1, this.lineWidth2, this.offset[0]);
                    Stroker.computeOffset(dxm, dym, this.lineWidth2, this.offset[1]);
                    Stroker.computeOffset(dx4, dy4, this.lineWidth2, this.offset[2]);
                    var x1p = x1 + this.offset[0][0];
                    var y1p = y1 + this.offset[0][1];
                    var xi = x + this.offset[1][0];
                    var yi = y + this.offset[1][1];
                    var x4p = x4 + this.offset[2][0];
                    var y4p = y4 + this.offset[2][1];
                    var invdet43 = 4.0 / (3.0 * (dx1 * dy4 - dy1 * dx4));
                    var two_pi_m_p1_m_p4x = 2 * xi - x1p - x4p;
                    var two_pi_m_p1_m_p4y = 2 * yi - y1p - y4p;
                    var c1 = invdet43 * (dy4 * two_pi_m_p1_m_p4x - dx4 * two_pi_m_p1_m_p4y);
                    var c2 = invdet43 * (dx1 * two_pi_m_p1_m_p4y - dy1 * two_pi_m_p1_m_p4x);
                    var x2p;
                    var y2p;
                    var x3p;
                    var y3p;
                    x2p = x1p + c1 * dx1;
                    y2p = y1p + c1 * dy1;
                    x3p = x4p + c2 * dx4;
                    y3p = y4p + c2 * dy4;
                    leftOff[0] = x1p;
                    leftOff[1] = y1p;
                    leftOff[2] = x2p;
                    leftOff[3] = y2p;
                    leftOff[4] = x3p;
                    leftOff[5] = y3p;
                    leftOff[6] = x4p;
                    leftOff[7] = y4p;
                    x1p = x1 - this.offset[0][0];
                    y1p = y1 - this.offset[0][1];
                    xi = xi - 2 * this.offset[1][0];
                    yi = yi - 2 * this.offset[1][1];
                    x4p = x4 - this.offset[2][0];
                    y4p = y4 - this.offset[2][1];
                    two_pi_m_p1_m_p4x = 2 * xi - x1p - x4p;
                    two_pi_m_p1_m_p4y = 2 * yi - y1p - y4p;
                    c1 = invdet43 * (dy4 * two_pi_m_p1_m_p4x - dx4 * two_pi_m_p1_m_p4y);
                    c2 = invdet43 * (dx1 * two_pi_m_p1_m_p4y - dy1 * two_pi_m_p1_m_p4x);
                    x2p = x1p + c1 * dx1;
                    y2p = y1p + c1 * dy1;
                    x3p = x4p + c2 * dx4;
                    y3p = y4p + c2 * dy4;
                    rightOff[0] = x1p;
                    rightOff[1] = y1p;
                    rightOff[2] = x2p;
                    rightOff[3] = y2p;
                    rightOff[4] = x3p;
                    rightOff[5] = y3p;
                    rightOff[6] = x4p;
                    rightOff[7] = y4p;
                    return 8;
                };
                Stroker.prototype.computeOffsetQuad = function (pts, off, leftOff, rightOff) {
                    var x1 = pts[off + 0];
                    var y1 = pts[off + 1];
                    var x2 = pts[off + 2];
                    var y2 = pts[off + 3];
                    var x3 = pts[off + 4];
                    var y3 = pts[off + 5];
                    var dx3 = x3 - x2;
                    var dy3 = y3 - y2;
                    var dx1 = x2 - x1;
                    var dy1 = y2 - y1;
                    Stroker.computeOffset(dx1, dy1, this.lineWidth2, this.offset[0]);
                    Stroker.computeOffset(dx3, dy3, this.lineWidth2, this.offset[1]);
                    leftOff[0] = x1 + this.offset[0][0];
                    leftOff[1] = y1 + this.offset[0][1];
                    leftOff[4] = x3 + this.offset[1][0];
                    leftOff[5] = y3 + this.offset[1][1];
                    rightOff[0] = x1 - this.offset[0][0];
                    rightOff[1] = y1 - this.offset[0][1];
                    rightOff[4] = x3 - this.offset[1][0];
                    rightOff[5] = y3 - this.offset[1][1];
                    var x1p = leftOff[0];
                    var y1p = leftOff[1];
                    var x3p = leftOff[4];
                    var y3p = leftOff[5];
                    this.computeIntersection(x1p, y1p, x1p + dx1, y1p + dy1, x3p, y3p, x3p - dx3, y3p - dy3, leftOff, 2);
                    var cx = leftOff[2];
                    var cy = leftOff[3];
                    if (!(Stroker.isFinite(cx) && Stroker.isFinite(cy))) {
                        x1p = rightOff[0];
                        y1p = rightOff[1];
                        x3p = rightOff[4];
                        y3p = rightOff[5];
                        this.computeIntersection(x1p, y1p, x1p + dx1, y1p + dy1, x3p, y3p, x3p - dx3, y3p - dy3, rightOff, 2);
                        cx = rightOff[2];
                        cy = rightOff[3];
                        if (!(Stroker.isFinite(cx) && Stroker.isFinite(cy))) {
                            this.getLineOffsets(x1, y1, x3, y3, leftOff, rightOff);
                            return 4;
                        }
                        leftOff[2] = 2 * x2 - cx;
                        leftOff[3] = 2 * y2 - cy;
                        return 6;
                    }
                    rightOff[2] = 2 * x2 - cx;
                    rightOff[3] = 2 * y2 - cy;
                    return 6;
                };
                Stroker.isFinite = function (x) {
                    return (Number.NEGATIVE_INFINITY < x && x < Number.POSITIVE_INFINITY);
                };
                Stroker.c_$LI$ = function () { if (Stroker.c == null)
                    Stroker.c = new sun.java2d.pisces.Curve(); return Stroker.c; };
                ;
                Stroker.findSubdivPoints = function (pts, ts, type, w) {
                    var x12 = pts[2] - pts[0];
                    var y12 = pts[3] - pts[1];
                    if (y12 !== 0.0 && x12 !== 0.0) {
                        var hypot = Math.sqrt(x12 * x12 + y12 * y12);
                        var cos = x12 / hypot;
                        var sin = y12 / hypot;
                        var x1 = cos * pts[0] + sin * pts[1];
                        var y1 = cos * pts[1] - sin * pts[0];
                        var x2 = cos * pts[2] + sin * pts[3];
                        var y2 = cos * pts[3] - sin * pts[2];
                        var x3 = cos * pts[4] + sin * pts[5];
                        var y3 = cos * pts[5] - sin * pts[4];
                        switch ((type)) {
                            case 8:
                                var x4 = cos * pts[6] + sin * pts[7];
                                var y4 = cos * pts[7] - sin * pts[6];
                                Stroker.c_$LI$().set$float$float$float$float$float$float$float$float(x1, y1, x2, y2, x3, y3, x4, y4);
                                break;
                            case 6:
                                Stroker.c_$LI$().set$float$float$float$float$float$float(x1, y1, x2, y2, x3, y3);
                                break;
                        }
                    }
                    else {
                        Stroker.c_$LI$().set$float_A$int(pts, type);
                    }
                    var ret = 0;
                    ret += Stroker.c_$LI$().dxRoots(ts, ret);
                    ret += Stroker.c_$LI$().dyRoots(ts, ret);
                    if (type === 8) {
                        ret += Stroker.c_$LI$().infPoints(ts, ret);
                    }
                    ret += Stroker.c_$LI$().rootsOfROCMinusW(ts, ret, w, 1.0E-4);
                    ret = sun.java2d.pisces.Helpers.filterOutNotInAB(ts, 0, ret, 1.0E-4, 0.9999);
                    sun.java2d.pisces.Helpers.isort(ts, 0, ret);
                    return ret;
                };
                /**
                 *
                 * @param {number} x1
                 * @param {number} y1
                 * @param {number} x2
                 * @param {number} y2
                 * @param {number} x3
                 * @param {number} y3
                 */
                Stroker.prototype.curveTo = function (x1, y1, x2, y2, x3, y3) {
                    this.middle[0] = this.cx0;
                    this.middle[1] = this.cy0;
                    this.middle[2] = x1;
                    this.middle[3] = y1;
                    this.middle[4] = x2;
                    this.middle[5] = y2;
                    this.middle[6] = x3;
                    this.middle[7] = y3;
                    var xf = this.middle[6];
                    var yf = this.middle[7];
                    var dxs = this.middle[2] - this.middle[0];
                    var dys = this.middle[3] - this.middle[1];
                    var dxf = this.middle[6] - this.middle[4];
                    var dyf = this.middle[7] - this.middle[5];
                    var p1eqp2 = (dxs === 0.0 && dys === 0.0);
                    var p3eqp4 = (dxf === 0.0 && dyf === 0.0);
                    if (p1eqp2) {
                        dxs = this.middle[4] - this.middle[0];
                        dys = this.middle[5] - this.middle[1];
                        if (dxs === 0.0 && dys === 0.0) {
                            dxs = this.middle[6] - this.middle[0];
                            dys = this.middle[7] - this.middle[1];
                        }
                    }
                    if (p3eqp4) {
                        dxf = this.middle[6] - this.middle[2];
                        dyf = this.middle[7] - this.middle[3];
                        if (dxf === 0.0 && dyf === 0.0) {
                            dxf = this.middle[6] - this.middle[0];
                            dyf = this.middle[7] - this.middle[1];
                        }
                    }
                    if (dxs === 0.0 && dys === 0.0) {
                        this.lineTo(this.middle[0], this.middle[1]);
                        return;
                    }
                    if (Math.abs(dxs) < 0.1 && Math.abs(dys) < 0.1) {
                        var len = Math.sqrt(dxs * dxs + dys * dys);
                        dxs /= len;
                        dys /= len;
                    }
                    if (Math.abs(dxf) < 0.1 && Math.abs(dyf) < 0.1) {
                        var len = Math.sqrt(dxf * dxf + dyf * dyf);
                        dxf /= len;
                        dyf /= len;
                    }
                    Stroker.computeOffset(dxs, dys, this.lineWidth2, this.offset[0]);
                    var mx = this.offset[0][0];
                    var my = this.offset[0][1];
                    this.drawJoin(this.cdx, this.cdy, this.cx0, this.cy0, dxs, dys, this.cmx, this.cmy, mx, my);
                    var nSplits = Stroker.findSubdivPoints(this.middle, this.subdivTs, 8, this.lineWidth2);
                    var kind = 0;
                    var it = sun.java2d.pisces.Curve.breakPtsAtTs(this.middle, 8, this.subdivTs, nSplits);
                    while ((it.hasNext())) {
                        var curCurveOff = it.next();
                        kind = this.computeOffsetCubic(this.middle, curCurveOff, this.lp, this.rp);
                        this.emitLineTo$float$float(this.lp[0], this.lp[1]);
                        switch ((kind)) {
                            case 8:
                                this.emitCurveTo(this.lp[0], this.lp[1], this.lp[2], this.lp[3], this.lp[4], this.lp[5], this.lp[6], this.lp[7], false);
                                this.emitCurveTo(this.rp[0], this.rp[1], this.rp[2], this.rp[3], this.rp[4], this.rp[5], this.rp[6], this.rp[7], true);
                                break;
                            case 4:
                                this.emitLineTo$float$float(this.lp[2], this.lp[3]);
                                this.emitLineTo$float$float$boolean(this.rp[0], this.rp[1], true);
                                break;
                        }
                        this.emitLineTo$float$float$boolean(this.rp[kind - 2], this.rp[kind - 1], true);
                    }
                    ;
                    this.cmx = (this.lp[kind - 2] - this.rp[kind - 2]) / 2;
                    this.cmy = (this.lp[kind - 1] - this.rp[kind - 1]) / 2;
                    this.cdx = dxf;
                    this.cdy = dyf;
                    this.cx0 = xf;
                    this.cy0 = yf;
                    this.prev = Stroker.DRAWING_OP_TO;
                };
                /**
                 *
                 * @param {number} x1
                 * @param {number} y1
                 * @param {number} x2
                 * @param {number} y2
                 */
                Stroker.prototype.quadTo = function (x1, y1, x2, y2) {
                    this.middle[0] = this.cx0;
                    this.middle[1] = this.cy0;
                    this.middle[2] = x1;
                    this.middle[3] = y1;
                    this.middle[4] = x2;
                    this.middle[5] = y2;
                    var xf = this.middle[4];
                    var yf = this.middle[5];
                    var dxs = this.middle[2] - this.middle[0];
                    var dys = this.middle[3] - this.middle[1];
                    var dxf = this.middle[4] - this.middle[2];
                    var dyf = this.middle[5] - this.middle[3];
                    if ((dxs === 0.0 && dys === 0.0) || (dxf === 0.0 && dyf === 0.0)) {
                        dxs = dxf = this.middle[4] - this.middle[0];
                        dys = dyf = this.middle[5] - this.middle[1];
                    }
                    if (dxs === 0.0 && dys === 0.0) {
                        this.lineTo(this.middle[0], this.middle[1]);
                        return;
                    }
                    if (Math.abs(dxs) < 0.1 && Math.abs(dys) < 0.1) {
                        var len = Math.sqrt(dxs * dxs + dys * dys);
                        dxs /= len;
                        dys /= len;
                    }
                    if (Math.abs(dxf) < 0.1 && Math.abs(dyf) < 0.1) {
                        var len = Math.sqrt(dxf * dxf + dyf * dyf);
                        dxf /= len;
                        dyf /= len;
                    }
                    Stroker.computeOffset(dxs, dys, this.lineWidth2, this.offset[0]);
                    var mx = this.offset[0][0];
                    var my = this.offset[0][1];
                    this.drawJoin(this.cdx, this.cdy, this.cx0, this.cy0, dxs, dys, this.cmx, this.cmy, mx, my);
                    var nSplits = Stroker.findSubdivPoints(this.middle, this.subdivTs, 6, this.lineWidth2);
                    var kind = 0;
                    var it = sun.java2d.pisces.Curve.breakPtsAtTs(this.middle, 6, this.subdivTs, nSplits);
                    while ((it.hasNext())) {
                        var curCurveOff = it.next();
                        kind = this.computeOffsetQuad(this.middle, curCurveOff, this.lp, this.rp);
                        this.emitLineTo$float$float(this.lp[0], this.lp[1]);
                        switch ((kind)) {
                            case 6:
                                this.emitQuadTo(this.lp[0], this.lp[1], this.lp[2], this.lp[3], this.lp[4], this.lp[5], false);
                                this.emitQuadTo(this.rp[0], this.rp[1], this.rp[2], this.rp[3], this.rp[4], this.rp[5], true);
                                break;
                            case 4:
                                this.emitLineTo$float$float(this.lp[2], this.lp[3]);
                                this.emitLineTo$float$float$boolean(this.rp[0], this.rp[1], true);
                                break;
                        }
                        this.emitLineTo$float$float$boolean(this.rp[kind - 2], this.rp[kind - 1], true);
                    }
                    ;
                    this.cmx = (this.lp[kind - 2] - this.rp[kind - 2]) / 2;
                    this.cmy = (this.lp[kind - 1] - this.rp[kind - 1]) / 2;
                    this.cdx = dxf;
                    this.cdy = dyf;
                    this.cx0 = xf;
                    this.cy0 = yf;
                    this.prev = Stroker.DRAWING_OP_TO;
                };
                /**
                 *
                 * @return {number}
                 */
                Stroker.prototype.getNativeConsumer = function () {
                    throw Object.defineProperty(new Error("Stroker doesn\'t use a native consumer"), '__classes', { configurable: true, value: ['java.lang.Throwable', 'java.lang.VirtualMachineError', 'java.lang.InternalError', 'java.lang.Error', 'java.lang.Object'] });
                };
                return Stroker;
            }());
            Stroker.MOVE_TO = 0;
            Stroker.DRAWING_OP_TO = 1;
            Stroker.CLOSE = 2;
            /**
             * Constant value for join style.
             */
            Stroker.JOIN_MITER = 0;
            /**
             * Constant value for join style.
             */
            Stroker.JOIN_ROUND = 1;
            /**
             * Constant value for join style.
             */
            Stroker.JOIN_BEVEL = 2;
            /**
             * Constant value for end cap style.
             */
            Stroker.CAP_BUTT = 0;
            /**
             * Constant value for end cap style.
             */
            Stroker.CAP_ROUND = 1;
            /**
             * Constant value for end cap style.
             */
            Stroker.CAP_SQUARE = 2;
            Stroker.MAX_N_CURVES = 11;
            pisces.Stroker = Stroker;
            Stroker["__class"] = "sun.java2d.pisces.Stroker";
            Stroker["__interfaces"] = ["sun.awt.geom.PathConsumer2D"];
            (function (Stroker) {
                var PolyStack = (function () {
                    function PolyStack() {
                        this.curves = null;
                        this.end = 0;
                        this.curveTypes = null;
                        this.numCurves = 0;
                        this.curves = (function (s) { var a = []; while (s-- > 0)
                            a.push(0); return a; })(8 * PolyStack.INIT_SIZE);
                        this.curveTypes = (function (s) { var a = []; while (s-- > 0)
                            a.push(0); return a; })(PolyStack.INIT_SIZE);
                        this.end = 0;
                        this.numCurves = 0;
                    }
                    PolyStack.prototype.isEmpty = function () {
                        return this.numCurves === 0;
                    };
                    PolyStack.prototype.ensureSpace = function (n) {
                        if (this.end + n >= this.curves.length) {
                            var newSize = (this.end + n) * 2;
                            this.curves = this.curves.slice(0, newSize);
                        }
                        if (this.numCurves >= this.curveTypes.length) {
                            var newSize = this.numCurves * 2;
                            this.curveTypes = this.curveTypes.slice(0, newSize);
                        }
                    };
                    PolyStack.prototype.pushCubic = function (x0, y0, x1, y1, x2, y2) {
                        this.ensureSpace(6);
                        this.curveTypes[this.numCurves++] = 8;
                        this.curves[this.end++] = x2;
                        this.curves[this.end++] = y2;
                        this.curves[this.end++] = x1;
                        this.curves[this.end++] = y1;
                        this.curves[this.end++] = x0;
                        this.curves[this.end++] = y0;
                    };
                    PolyStack.prototype.pushQuad = function (x0, y0, x1, y1) {
                        this.ensureSpace(4);
                        this.curveTypes[this.numCurves++] = 6;
                        this.curves[this.end++] = x1;
                        this.curves[this.end++] = y1;
                        this.curves[this.end++] = x0;
                        this.curves[this.end++] = y0;
                    };
                    PolyStack.prototype.pushLine = function (x, y) {
                        this.ensureSpace(2);
                        this.curveTypes[this.numCurves++] = 4;
                        this.curves[this.end++] = x;
                        this.curves[this.end++] = y;
                    };
                    PolyStack.prototype.pop$float_A = function (pts) {
                        var ret = this.curveTypes[this.numCurves - 1];
                        this.numCurves--;
                        this.end -= (ret - 2);
                        /* arraycopy */ (function (srcPts, srcOff, dstPts, dstOff, size) { if (srcPts !== dstPts || dstOff >= srcOff + size) {
                            while (--size >= 0)
                                dstPts[dstOff++] = srcPts[srcOff++];
                        }
                        else {
                            var tmp = srcPts.slice(srcOff, srcOff + size);
                            for (var i = 0; i < size; i++)
                                dstPts[dstOff++] = tmp[i];
                        } })(this.curves, this.end, pts, 0, ret - 2);
                        return ret;
                    };
                    PolyStack.prototype.pop = function (pts) {
                        if (((pts != null && pts instanceof Array && (pts.length == 0 || pts[0] == null || (typeof pts[0] === 'number'))) || pts === null)) {
                            return this.pop$float_A(pts);
                        }
                        else if (((pts != null && (pts["__interfaces"] != null && pts["__interfaces"].indexOf("sun.awt.geom.PathConsumer2D") >= 0 || pts.constructor != null && pts.constructor["__interfaces"] != null && pts.constructor["__interfaces"].indexOf("sun.awt.geom.PathConsumer2D") >= 0)) || pts === null)) {
                            return this.pop$sun_awt_geom_PathConsumer2D(pts);
                        }
                        else
                            throw new Error('invalid overload');
                    };
                    PolyStack.prototype.pop$sun_awt_geom_PathConsumer2D = function (io) {
                        this.numCurves--;
                        var type = this.curveTypes[this.numCurves];
                        this.end -= (type - 2);
                        switch ((type)) {
                            case 8:
                                io.curveTo(this.curves[this.end + 0], this.curves[this.end + 1], this.curves[this.end + 2], this.curves[this.end + 3], this.curves[this.end + 4], this.curves[this.end + 5]);
                                break;
                            case 6:
                                io.quadTo(this.curves[this.end + 0], this.curves[this.end + 1], this.curves[this.end + 2], this.curves[this.end + 3]);
                                break;
                            case 4:
                                io.lineTo(this.curves[this.end], this.curves[this.end + 1]);
                        }
                    };
                    return PolyStack;
                }());
                PolyStack.INIT_SIZE = 50;
                Stroker.PolyStack = PolyStack;
                PolyStack["__class"] = "sun.java2d.pisces.Stroker.PolyStack";
            })(Stroker = pisces.Stroker || (pisces.Stroker = {}));
        })(pisces = java2d.pisces || (java2d.pisces = {}));
    })(java2d = sun.java2d || (sun.java2d = {}));
})(sun || (sun = {}));
sun.java2d.pisces.Stroker.c_$LI$();
sun.java2d.pisces.Stroker.ROUND_JOIN_THRESHOLD_$LI$();
