/*
 * DO NOT MODIFY: this source code has been automatically generated from Java
 *                with JSweet (http://www.jsweet.org)
 *
 * Sweet Home 3D, Copyright (c) 2017 Emmanuel PUYBARET / eTeks <info@eteks.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */
/**
 * This class is a wrapper that implements 2D drawing functions on a canvas.
 */
var Graphics2D = (function () {
    /**
     * Creates a new instance wrapping the given HTML canvas.
     * @constructor
     */
    function Graphics2D(canvas) {
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = true;
        this._transform = new java.awt.geom.AffineTransform(1., 0., 0., 1., 0., 0.);
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        var computedStyle = window.getComputedStyle(canvas);
        this.color = computedStyle.color;
        this.background = computedStyle.background;
    }
    /**
     * Clears the canvas.
     */
    Graphics2D.prototype.clear = function () {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    };
    /**
     * Gets the wrapped canvas context.
     */
    Graphics2D.prototype.getContext = function () {
        return this.context;
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
    /*public hitClip(x: number, y: number, width: number, height: number): boolean {
      return this.clip.getBounds().intersects(x, y, width, height);
    }*/
    /**
     * Draws a shape on the canvas using the current stroke.
     * @param shape {java.awt.Shape} the shape to be drawn
     */
    Graphics2D.prototype.draw = function (shape) {
        this.createPathFromShape(shape);
        this.context.stroke();
    };
    /**
     * @param shape {java.awt.Shape} the shape to create a path from
     * @private
     */
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
    /**
     * Fills a shape on the canvas using the current paint.
     * @param shape {java.awt.Shape} the shape to be filled
     */
    Graphics2D.prototype.fill = function (s) {
        this.createPathFromShape(s);
        this.context.fill();
    };
    /**
     * Draws an image on the canvas.
     * @param img {HTMLImageElement} the image to be drawn
     * @param x {number}
     * @param y {number}
     * @param [bgcolor] {string}
     */
    Graphics2D.prototype.drawImage = function (img, x, y, bgcolor) {
        this.context.drawImage(img, x, y);
        return true;
    };
    /**
     * Draws an image on the canvas.
     * @param img {HTMLImageElement} the image to be drawn
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     * @param [bgcolor] {string}
     */
    Graphics2D.prototype.drawImageWithSize = function (img, x, y, width, height, bgcolor) {
        this.context.drawImage(img, x, y, width, height);
        return true;
    };
    /**
     * Gets the current clip.
     * @returns {java.awt.Shape} the clip as a shape
     */
    Graphics2D.prototype.getClip = function () {
        return this._clip;
    };
    /**
     * Sets the current clip.
     * @param clip {java.awt.Shape} the clip as a shape
     */
    Graphics2D.prototype.setClip = function (clip) {
        this._clip = clip;
        if (clip != null) {
            this.createPathFromShape(clip);
            this.context.clip();
        }
    };
    /**
     * Adds the given clip to the current clip.
     * @param clip {java.awt.Shape} the added clip as a shape
     */
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
    /**
     * Sets the current clip as a rectangle region.
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     */
    Graphics2D.prototype.clipRect = function (x, y, width, height) {
        if (this.clip == null) {
            this.setClip(new java.awt.geom.Rectangle2D.Double(x, y, width, height));
        }
        else {
            this.setClip(this.clip.getBounds2D().createIntersection(new java.awt.geom.Rectangle2D.Double(x, y, width, height)));
        }
    };
    /**
     * Translates the canvas transform matrix.
     * @param x {number}
     * @param y {number}
     */
    Graphics2D.prototype.translate = function (x, y) {
        this._transform.translate(x, y);
        this.context.translate(x, y);
    };
    /**
     * Draws a string outline with the current stroke.
     * @param str {string}
     * @param x {number}
     * @param y {number}
     */
    Graphics2D.prototype.drawStringOutline = function (str, x, y) {
        this.context.strokeText(str, x, y);
    };
    /**
     * Draws a string with the current paint.
     * @param str {string}
     * @param x {number}
     * @param y {number}
     */
    Graphics2D.prototype.drawString = function (str, x, y) {
        this.context.fillText(str, x, y);
    };
    /**
     * Fills the given rectangular region with the current paint.
     * @param x {number}
     * @param y {number}
     * @param width {number}
     * @param height {number}
     */
    Graphics2D.prototype.fillRect = function (x, y, width, height) {
        this.context.fillRect(x, y, width, height);
    };
    /**
     * Sets the current stroke and fill style as a CSS style.
     * @param color {string} a CSS style
     */
    Graphics2D.prototype.setColor = function (color) {
        this.color = color;
        this.context.strokeStyle = color;
        this.context.fillStyle = color;
    };
    /**
     * Gets the current color.
     */
    Graphics2D.prototype.getColor = function () {
        return this.color;
    };
    Graphics2D.prototype.setComposite = function (c) {
        this.setColor(c);
    };
    /**
     * Sets the alpha component for all subsequent drawing and fill operations.
     * @param alpha {number}
     */
    Graphics2D.prototype.setAlpha = function (alpha) {
        this.context.globalAlpha = alpha;
    };
    /**
     * Gets the alpha component of the canvas.
     * @returns {number}
     */
    Graphics2D.prototype.getAlpha = function () {
        return this.context.globalAlpha;
    };
    /**
     * Rotates the canvas current transform matrix.
     * @param theta {number} the rotation angle
     * @param [x] {number} the rotation origin (x)
     * @param [y] {number} the rotation origin (y)
     */
    Graphics2D.prototype.rotate = function (theta, x, y) {
        if (typeof x === 'number' && typeof y === 'number') {
            this._transform.rotate(theta, x, y);
            this.context.translate(-x, -y);
            this.context.rotate(theta);
            this.context.translate(x, y);
        }
        else {
            this._transform.rotate(theta);
            this.context.rotate(theta);
        }
    };
    /**
     * Scales the canvas current transform matrix.
     * @param sx {number} the x scale factor
     * @param sy {number} the y scale factor
     */
    Graphics2D.prototype.scale = function (sx, sy) {
        this._transform.scale(sx, sy);
        this.context.scale(sx, sy);
    };
    /**
     * Shears the canvas current transform matrix.
     * @param shx {number} the x shear factor
     * @param shy {number} the y shear factor
     */
    Graphics2D.prototype.shear = function (shx, shy) {
        this._transform.shear(shx, shy);
        this.context.transform(0, shx, shy, 0, 0, 0);
    };
    /**
     * @ignore
     */
    Graphics2D.prototype.dispose = function () {
    };
    /**
     * Sets the current font.
     * @param font {string} a CSS font descriptor
     */
    Graphics2D.prototype.setFont = function (font) {
        this.context.font = font;
    };
    /**
     * Gets the current font.
     * @returns {string} a CSS font descriptor
     */
    Graphics2D.prototype.getFont = function () {
        return this.context.font;
    };
    /**
     * Sets the fill style as a color.
     * @param color {string} a CSS color descriptor
     */
    Graphics2D.prototype.setBackground = function (color) {
        this.background = color;
        this.context.fillStyle = color;
    };
    /**
     * Gets the fill style.
     * @returns {string} a CSS color descriptor
     */
    Graphics2D.prototype.getBackground = function () {
        return this.background;
    };
    /**
     * Sets (overrides) the current transform matrix.
     * @param transform {java.awt.geom.AffineTransform} the new transform matrix
     */
    Graphics2D.prototype.setTransform = function (transform) {
        this._transform.setTransform(transform);
        this.context.setTransform(transform.getScaleX(), transform.getShearX(), transform.getShearY(), transform.getScaleY(), transform.getTranslateX(), transform.getTranslateY());
    };
    /**
     * Gets the current transform matrix.
     * @returns {java.awt.geom.AffineTransform} the current transform matrix
     */
    Graphics2D.prototype.getTransform = function () {
        return new java.awt.geom.AffineTransform(this._transform);
    };
    /**
     * Applies the given transform matrix to the current transform matrix.
     * @param transform {java.awt.geom.AffineTransform} the transform matrix to be applied
     */
    Graphics2D.prototype.transform = function (transform) {
        this._transform.concatenate(transform);
        this.context.transform(transform.getScaleX(), transform.getShearX(), transform.getShearY(), transform.getScaleY(), transform.getTranslateX(), transform.getTranslateY());
    };
    Graphics2D.prototype.setPaintMode = function () {
    };
    /**
     * Gets the current paint.
     * @returns {string|CanvasPattern}
     */
    Graphics2D.prototype.getPaint = function () {
        return this.color;
    };
    /**
     * Sets the current paint.
     * @param paint {string|CanvasPattern}
     */
    Graphics2D.prototype.setPaint = function (paint) {
        if (typeof paint === "string") {
            this.setColor(paint);
        }
        else {
            this.context.strokeStyle = paint;
            this.context.fillStyle = paint;
        }
    };
    /**
     * Sets the current stroke.
     */
    Graphics2D.prototype.setStroke = function (s) {
        this.context.lineWidth = s.getLineWidth();
    };
    /**
     * Creates a pattern from an image.
     * @param image {HTMLImageElement}
     * @returns CanvasPattern
     */
    Graphics2D.prototype.createPattern = function (image) {
        return this.context.createPattern(image, 'repeat');
    };
    return Graphics2D;
}());
/**
 * This utility class allows to get the metrics of a given font. Note that this class will approximate
 * the metrics on older browsers where CanvasRenderingContext2D.measureText() is only partially implemented.
 */
var FontMetrics = (function () {
    /**
     * Builds a font metrics instance for the given font.
     * @param font {string} the given font, in a CSS canvas-compatible representation
     */
    function FontMetrics(font) {
        this.font = font;
        this.cached = false;
    }
    /**
     * Gets the bounds of the given string for this font metrics.
     * @param aString {string} the string to get the bounds of
     * @returns {java.awt.geom.Rectangle2D} the bounds as an instance of java.awt.geom.Rectangle2D
     */
    FontMetrics.prototype.getStringBounds = function (aString) {
        this.compute(aString);
        return new java.awt.geom.Rectangle2D.Double(0, -this.ascent, this.width, this.height);
    };
    /**
     * Gets the font ascent.
     * @returns {number} the font ascent
     */
    FontMetrics.prototype.getAscent = function () {
        if (!this.cached) {
            this.compute("Llp");
        }
        return this.ascent;
    };
    /**
     * Gets the font descent.
     * @returns {number} the font descent
     */
    FontMetrics.prototype.getDescent = function () {
        if (!this.cached) {
            this.compute("Llp");
        }
        return this.descent;
    };
    /**
     * Gets the font height.
     * @returns {number} the font height
     */
    FontMetrics.prototype.getHeight = function () {
        if (!this.cached) {
            this.compute("Llp");
        }
        return this.height;
    };
    /**
     * Computes the various dimentions of the given string, for the current canvas and font.
     * This function caches the results so that it can be fast accessed in other functions.
     * @param aString {string} the string to compute the dimensions of
     * @private
     */
    FontMetrics.prototype.compute = function (aString) {
        var _this = this;
        if (!this.cached) {
            this.context = document.createElement("canvas").getContext("2d");
            this.context.font = this.font;
        }
        var textMetrics = this.context.measureText(aString);
        if (textMetrics.fontBoundingBoxAscent) {
            this.cached = true;
            this.ascent = textMetrics.fontBoundingBoxAscent;
            this.descent = textMetrics.fontBoundingBoxDescent;
            this.height = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
            this.width = textMetrics.width;
        }
        else if (textMetrics.actualBoundingBoxAscent) {
            this.cached = true;
            this.ascent = textMetrics.actualBoundingBoxAscent;
            this.descent = textMetrics.actualBoundingBoxDescent;
            this.height = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
            this.width = textMetrics.width;
        }
        else {
            // height info is not available on old browsers, so we build an approx.
            // TODO: use a font utility instead
            var heightArray = this.context.font.split(' ');
            heightArray.forEach(function (height) {
                if (height.slice(height.length - 2) == "px") {
                    _this.height = parseInt(height);
                }
            });
            this.cached = true;
            this.ascent = 0.77 * this.height;
            this.descent = 0.23 * this.height;
            this.width = textMetrics.width;
        }
    };
    return FontMetrics;
}());
/**
 * A font utility class.
 */
var Font = (function () {
    /**
     * Creates a new font from a CSS font descriptor.
     * @param cssFontDecriptor {string|string[]} the font descriptor as a CSS string or an array [style, size, family]
     */
    function Font(cssFontDecriptor) {
        // font desciptors are normalized by the browser using the getComputedStyle function
        if (!Font.element) {
            Font.element = document.createElement('span');
            Font.element.style.display = 'none';
            document.body.append(Font.element);
        }
        if (typeof cssFontDecriptor == 'string') {
            Font.element.style.font = cssFontDecriptor;
        }
        else if (Array.isArray(cssFontDecriptor)) {
            Font.element.style.font = cssFontDecriptor.join(' ');
        }
        var styles = window.getComputedStyle(Font.element);
        this.size = styles.fontSize;
        this.family = styles.fontFamily;
        this.style = styles.fontStyle;
    }
    /**
     * Returns the font as a CSS string.
     * @returns {string}
     */
    Font.prototype.toString = function () {
        return [this.style, this.size, this.family].join(' ');
    };
    return Font;
}());
/**
 * Converts a color given as an int to a CSS string representation. For instance, 0 will be converted to #000000.
 * Note that the alpha content is ignored.
 * @param color {number}
 * @returns a CSS string
 */
function intToColorString(color) {
    return "#" + (color & 0xFFFFFF).toString(16);
}
