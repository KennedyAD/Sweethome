var Graphics2D = (function () {
    function Graphics2D(canvas) {
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = true;
        var computedStyle = window.getComputedStyle(canvas);
        this.color = computedStyle.color;
        this.background = computedStyle.background;
    }
    Graphics2D.prototype.create = function () {
        return this;
    };
    Graphics2D.prototype.clear = function () {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    };
    Graphics2D.prototype.getContext = function () {
        return this.context;
    };
    Graphics2D.prototype.clearRect = function (x, y, width, height) {
        this.context.clearRect(x, y, width, height);
    };
    Graphics2D.prototype.drawArc = function (x, y, width, height, startAngle, arcAngle) {
        this.context.beginPath();
        this.context["ellipse"](x - (width / 2 | 0), y - (height / 2 | 0), (width / 2 | 0), (height / 2 | 0), 0, /* toRadians */ (function (x) { return x * Math.PI / 180; })(startAngle), /* toRadians */ (function (x) { return x * Math.PI / 180; })(startAngle) + (function (x) { return x * Math.PI / 180; })(arcAngle));
        this.context.stroke();
    };
    Graphics2D.prototype.drawLine = function (x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    };
    Graphics2D.prototype.drawOval = function (x, y, width, height) {
        this.context.beginPath();
        this.context["ellipse"](x - (width / 2 | 0), y - (height / 2 | 0), (width / 2 | 0), (height / 2 | 0), 0, 0, Math.PI * 2);
        this.context.stroke();
    };
    Graphics2D.prototype.drawRoundRect = function (x, y, width, height, arcWidth, arcHeight) {
        this.drawRect(x, y, width, height);
    };
    Graphics2D.prototype.drawRect = function (x, y, width, height) {
        this.context.beginPath();
        this.context.rect(x, y, width, height);
        this.context.stroke();
    };
    /*public getClipBounds(r?: any): any {
      if (((r != null && r instanceof java.awt.Rectangle) || r === null)) {
        let __args = Array.prototype.slice.call(arguments);
        return <any>(() => {
          if (this.clip == null) {
            return r;
          } else {
            return this.clip.getBounds().createIntersection(r).getBounds();
          }
        })();
      } else if (r === undefined) {
        return <any>this.getClipBounds$();
      } else throw new Error('invalid overload');
    }*/
    Graphics2D.prototype.draw3DRect = function (x, y, width, height, raised) {
        this.drawRect(x, y, width, height);
    };
    /*public hitClip(x: number, y: number, width: number, height: number): boolean {
      return this.clip.getBounds().intersects(x, y, width, height);
    }*/
    Graphics2D.prototype.drawPolyline = function (xPoints, yPoints, nPoints) {
        this.context.beginPath();
        if (nPoints <= 0) {
            return;
        }
        this.context.moveTo(xPoints[0], yPoints[0]);
        for (var i = 0; i < nPoints; i++) {
            this.context.lineTo(xPoints[i], yPoints[i]);
        }
        this.context.stroke();
    };
    Graphics2D.prototype.draw = function (s) {
        this.createPathFromShape(s);
        this.context.stroke();
    };
    Graphics2D.prototype.createPathFromShape = function (s) {
        this.context.beginPath();
        var it = s.getPathIterator(java.awt.geom.AffineTransform.getTranslateInstance(0, 0));
        var coords = new Array(6);
        while (!it.isDone()) {
            switch (it.currentSegment(coords)) {
                case java.awt.geom.PathIterator.SEG_MOVETO:
                    this.context.moveTo(coords[0], coords[1]);
                    break;
                case java.awt.geom.PathIterator.SEG_LINETO:
                    this.context.lineTo(coords[0], coords[1]);
                    break;
                case java.awt.geom.PathIterator.SEG_QUADTO:
                    console.error("QUADTO: " + coords);
                    this.context.lineTo(coords[0], coords[1]);
                    break;
                case java.awt.geom.PathIterator.SEG_CUBICTO:
                    this.context.bezierCurveTo(coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]);
                    break;
                case java.awt.geom.PathIterator.SEG_CLOSE:
                    this.context.closePath();
                    break;
                default:
                    break;
            }
            it.next();
        }
        ;
    };
    Graphics2D.prototype.fill = function (s) {
        this.createPathFromShape(s);
        this.context.fill();
    };
    Graphics2D.prototype.drawImage = function (img, x, y, bgcolor, observer) {
        this.context.drawImage(img, x, y);
        return true;
    };
    Graphics2D.prototype.drawImageWithSize = function (img, x, y, width, height, bgcolor, observer) {
        this.context.drawImage(img, x, y, width, height);
        return true;
    };
    Graphics2D.prototype.drawImageFromSource = function (img, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, bgcolor, observer) {
        this.context.drawImage(img, Math.min(sx1, sx2), Math.min(sy1, sy2), Math.abs(sx2 - sx1), Math.abs(sy2 - sy1), Math.min(dx1, dx2), Math.min(dy1, dy2), Math.abs(dx2 - dx1), Math.abs(dy2 - dy1));
        return true;
    };
    Graphics2D.prototype.getClip = function () {
        return this._clip;
    };
    Graphics2D.prototype.setClip = function (clip) {
        this._clip = clip;
        if (clip != null) {
            this.createPathFromShape(clip);
            this.context.clip();
        }
    };
    Graphics2D.prototype.clip = function (clip) {
        this._clip = clip;
        if (clip != null) {
            this.createPathFromShape(clip);
            this.context.clip();
        }
    };
    /*public setClip(x?: any, y?: any, width?: any, height?: any): any {
      if (((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof width === 'number') || width === null) && ((typeof height === 'number') || height === null)) {
        let __args = Array.prototype.slice.call(arguments);
        return <any>(() => {
          this.setClip(new java.awt.Rectangle(x, y, width, height));
        })();
      } else if (((x != null && (x["__interfaces"] != null && x["__interfaces"].indexOf("java.awt.Shape") >= 0 || x.constructor != null && x.constructor["__interfaces"] != null && x.constructor["__interfaces"].indexOf("java.awt.Shape") >= 0)) || x === null) && y === undefined && width === undefined && height === undefined) {
        return <any>this.setClip$java_awt_Shape(x);
      } else throw new Error('invalid overload');
    }*/
    Graphics2D.prototype.clipRect = function (x, y, width, height) {
        if (this.clip == null) {
            this.setClip(new java.awt.geom.Rectangle2D.Double(x, y, width, height));
        }
        else {
            this.setClip(this.clip.getBounds2D().createIntersection(new java.awt.geom.Rectangle2D.Double(x, y, width, height)));
        }
    };
    /*public getClipBounds$(): java.awt.Rectangle {
      return this.clip.getBounds();
    }*/
    Graphics2D.prototype.translate = function (x, y) {
        this.context.translate(x, y);
    };
    Graphics2D.prototype.drawString = function (str, x, y) {
        this.context.strokeText(str, x, y);
    };
    Graphics2D.prototype.fillArc = function (x, y, width, height, startAngle, arcAngle) {
        this.context.beginPath();
        this.context["ellipse"](x - (width / 2 | 0), y - (height / 2 | 0), (width / 2 | 0), (height / 2 | 0), 0, /* toRadians */ (function (x) { return x * Math.PI / 180; })(startAngle), /* toRadians */ (function (x) { return x * Math.PI / 180; })(startAngle) + (function (x) { return x * Math.PI / 180; })(arcAngle));
        this.context.fill();
    };
    Graphics2D.prototype.fillOval = function (x, y, width, height) {
        this.context.beginPath();
        this.context["ellipse"](x - (width / 2 | 0), y - (height / 2 | 0), (width / 2 | 0), (height / 2 | 0), 0, 0, Math.PI * 2);
        this.context.fill();
    };
    Graphics2D.prototype.fillRect = function (x, y, width, height) {
        this.context.fillRect(x, y, width, height);
    };
    Graphics2D.prototype.fillRoundRect = function (x, y, width, height, arcWidth, arcHeight) {
        this.fillRect(x, y, width, height);
    };
    Graphics2D.prototype.setColor = function (c) {
        this.color = c;
        this.context.strokeStyle = c;
        this.context.fillStyle = c;
    };
    Graphics2D.prototype.getColor = function () {
        return this.color;
    };
    Graphics2D.prototype.setComposite = function (c) {
        this.setColor(c);
    };
    Graphics2D.prototype.setAlpha = function (alpha) {
        this.context.globalAlpha = alpha;
    };
    Graphics2D.prototype.getAlpha = function () {
        return this.context.globalAlpha;
    };
    Graphics2D.prototype.rotate = function (theta, x, y) {
        if (typeof x === 'number' && typeof y === 'number') {
            this.context.translate(-x, -y);
            this.context.rotate(theta);
            this.context.translate(x, y);
        }
        else {
            this.context.rotate(theta);
        }
    };
    Graphics2D.prototype.scale = function (sx, sy) {
        this.context.scale(sx, sy);
    };
    Graphics2D.prototype.shear = function (shx, shy) {
        this.context.transform(0, shx, shy, 0, 0, 0);
    };
    Graphics2D.prototype.dispose = function () {
    };
    Graphics2D.prototype.setFont = function (font) {
        this.font = font;
        this.context.font = font;
    };
    Graphics2D.prototype.getFont = function () {
        return this.font;
    };
    Graphics2D.prototype.setBackground = function (color) {
        this.background = color;
        this.context.fillStyle = color;
    };
    Graphics2D.prototype.getBackground = function () {
        return this.background;
    };
    Graphics2D.prototype.setTransform = function (transform) {
        this.context.setTransform(transform.getScaleX(), transform.getShearX(), transform.getShearY(), transform.getScaleY(), transform.getTranslateX(), transform.getTranslateY());
    };
    Graphics2D.prototype.getTransform = function () {
        var t = this.context.getTransform();
        return new java.awt.geom.AffineTransform(t.m11, t.m21, t.m12, t.m22, t.m13, t.m23);
    };
    Graphics2D.prototype.transform = function (transform) {
        this.context.transform(transform.getScaleX(), transform.getShearX(), transform.getShearY(), transform.getScaleY(), transform.getTranslateX(), transform.getTranslateY());
    };
    Graphics2D.prototype.setPaintMode = function () {
    };
    Graphics2D.prototype.getPaint = function () {
        return this.color;
    };
    Graphics2D.prototype.setPaint = function (paint) {
        if (typeof paint === "string") {
            this.setColor(paint);
        }
        else {
            this.context.strokeStyle = paint;
            this.context.fillStyle = paint;
        }
    };
    Graphics2D.prototype.setStroke = function (s) {
        this.context.lineWidth = s.getLineWidth();
    };
    Graphics2D.prototype.createPattern = function (image) {
        return this.context.createPattern(image, 'repeat');
    };
    return Graphics2D;
}());
//namespace java.awt {
//  export interface Paint { }
//
//  export interface Stroke { }
//}
//
//namespace java.awt.image {
//    /**
//     * RenderedImage is a common interface for objects which contain
//     * or can produce image data in the form of Rasters.  The image
//     * data may be stored/produced as a single tile or a regular array
//     * of tiles.
//     */
//    export interface RenderedImage {
//        getWidth(observer? : any) : any;
//
//        getHeight(observer? : any) : any;
//    }
//}
///* Generated from Java with JSweet 1.2.0-SNAPSHOT - http://www.jsweet.org */
//namespace java.awt {
//    export class Image {
//        public constructor(src : string) {
//            this.source = document.createElement("img");
//            this.source.src = src;
//        }
//
//        public getWidth(observer? : any) : any {
//            if(((observer != null && (observer["__interfaces"] != null && observer["__interfaces"].indexOf("java.awt.image.ImageObserver") >= 0 || observer.constructor != null && observer.constructor["__interfaces"] != null && observer.constructor["__interfaces"].indexOf("java.awt.image.ImageObserver") >= 0)) || observer === null)) {
//                let __args = Array.prototype.slice.call(arguments);
//                return <any>(() => {
//                    return (<number>this.source.width|0);
//                })();
//            } else throw new Error('invalid overload');
//        }
//
//        public getHeight(observer? : any) : any {
//            if(((observer != null && (observer["__interfaces"] != null && observer["__interfaces"].indexOf("java.awt.image.ImageObserver") >= 0 || observer.constructor != null && observer.constructor["__interfaces"] != null && observer.constructor["__interfaces"].indexOf("java.awt.image.ImageObserver") >= 0)) || observer === null)) {
//                let __args = Array.prototype.slice.call(arguments);
//                return <any>(() => {
//                    return (<number>this.source.height|0);
//                })();
//            } else throw new Error('invalid overload');
//        }
//
//        public source : HTMLImageElement;
//
//        /**
//         * Use the default image-scaling algorithm.
//         * 
//         * @since JDK1.1
//         */
//        public static SCALE_DEFAULT : number = 1;
//
//        /**
//         * Choose an image-scaling algorithm that gives higher priority to scaling
//         * speed than smoothness of the scaled image.
//         * 
//         * @since JDK1.1
//         */
//        public static SCALE_FAST : number = 2;
//
//        public static SCALE_SMOOTH : number = 4;
//
//        public static SCALE_REPLICATE : number = 8;
//
//        public static SCALE_AREA_AVERAGING : number = 16;
//
//        public flush() {
//        }
//    }
//    Image["__class"] = "java.awt.Image";
//
//}
//
