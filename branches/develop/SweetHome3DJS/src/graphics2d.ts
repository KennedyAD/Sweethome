
class Graphics2D {

  public context : CanvasRenderingContext2D;

  public constructor(canvas: HTMLCanvasElement) {
    this.context = canvas.getContext("2d");
    var computedStyle = window.getComputedStyle(canvas);
    this.color = computedStyle.color;
    this.background = computedStyle.background;
  }

  public create() : Graphics2D {
    return this;
  }
  
  public clear() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);    
  }

  public getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  public clearRect(x: number, y: number, width: number, height: number) {
    this.context.clearRect(x, y, width, height);
  }

  public drawArc(x: number, y: number, width: number, height: number, startAngle: number, arcAngle: number) {
    this.context.beginPath();
    (<any>this.context["ellipse"])(x - (width / 2 | 0), y - (height / 2 | 0), (width / 2 | 0), (height / 2 | 0), 0, /* toRadians */(x => x * Math.PI / 180)(startAngle), /* toRadians */(x => x * Math.PI / 180)(startAngle) + /* toRadians */(x => x * Math.PI / 180)(arcAngle));
    this.context.stroke();
  }

  public drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.stroke();
  }

  public drawOval(x: number, y: number, width: number, height: number) {
    this.context.beginPath();
    (<any>this.context["ellipse"])(x - (width / 2 | 0), y - (height / 2 | 0), (width / 2 | 0), (height / 2 | 0), 0, 0, Math.PI * 2);
    this.context.stroke();
  }

  public drawRoundRect(x: number, y: number, width: number, height: number, arcWidth: number, arcHeight: number) {
    this.drawRect(x, y, width, height);
  }

  public drawRect(x: number, y: number, width: number, height: number) {
    this.context.beginPath();
    this.context.rect(x, y, width, height);
    this.context.stroke();
  }

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

  public draw3DRect(x: number, y: number, width: number, height: number, raised: boolean) {
    this.drawRect(x, y, width, height);
  }

  /*public hitClip(x: number, y: number, width: number, height: number): boolean {
    return this.clip.getBounds().intersects(x, y, width, height);
  }*/

  public drawPolyline(xPoints: number[], yPoints: number[], nPoints: number) {
    this.context.beginPath();
    if (nPoints <= 0) {
      return;
    }
    this.context.moveTo(xPoints[0], yPoints[0]);
    for (let i: number = 0; i < nPoints; i++) {
      this.context.lineTo(xPoints[i], yPoints[i]);
    }
    this.context.stroke();
  }

  public draw(s: java.awt.Shape) {
    this.createPathFromShape(s);
    this.context.stroke();
  }

  private createPathFromShape(s: java.awt.Shape) {
    this.context.beginPath();
    let it: java.awt.geom.PathIterator = s.getPathIterator(java.awt.geom.AffineTransform.getTranslateInstance(0, 0));
    let coords: number[] = new Array(6);
    while (!it.isDone()) {
      switch (it.currentSegment(coords)) {
        case java.awt.geom.PathIterator.SEG_MOVETO:
          this.context.moveTo(coords[0], coords[1]);
          break;
        case java.awt.geom.PathIterator.SEG_LINETO:
          this.context.lineTo(coords[0], coords[1]);
          break;
        case java.awt.geom.PathIterator.SEG_QUADTO:
          console.error("QUADTO: "+coords);
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
    };
  }

  public fill(s: java.awt.Shape) {
    this.createPathFromShape(s);
    this.context.fill();
  }

  public drawImage(img: HTMLImageElement, x: number, y: number, bgcolor?: string, observer?: any): boolean {
    this.context.drawImage(img, x, y);
    return true;
  }

  public drawImageWithSize(img: HTMLImageElement, x: number, y: number, width: number, height: number, bgcolor?: string, observer?: any): boolean {
    this.context.drawImage(img, x, y, width, height);
    return true;
  }

  public drawImageFromSource(img: HTMLImageElement, dx1: number, dy1: number, dx2: number, dy2: number, sx1: number, sy1: number, sx2: number, sy2: number, bgcolor?: string, observer?: any): boolean {
    this.context.drawImage(img, Math.min(sx1, sx2), Math.min(sy1, sy2), Math.abs(sx2 - sx1), Math.abs(sy2 - sy1), Math.min(dx1, dx2), Math.min(dy1, dy2), Math.abs(dx2 - dx1), Math.abs(dy2 - dy1));
    return true;
  }

  clip: java.awt.Shape;

  public getClip(): java.awt.Shape {
    return this.clip;
  }

  public setClip(clip: java.awt.Shape) {
    this.clip = clip;
    if (clip != null) {
      this.createPathFromShape(clip);
      this.context.clip();
    }
  }

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

  public clipRect(x: number, y: number, width: number, height: number) {
    if (this.clip == null) {
      this.setClip(new java.awt.geom.Rectangle2D.Double(x, y, width, height));
    } else {
      this.setClip(this.clip.getBounds2D().createIntersection(new java.awt.geom.Rectangle2D.Double(x, y, width, height)));
    }
  }

  /*public getClipBounds$(): java.awt.Rectangle {
    return this.clip.getBounds();
  }*/

  public translate(x: number, y: number): any {
    this.context.translate(x, y);
  }

  public drawString(str: string, x: number, y: number) {
    this.context.strokeText(str, x, y);
  }

  public fillArc(x: number, y: number, width: number, height: number, startAngle: number, arcAngle: number) {
    this.context.beginPath();
    (<any>this.context["ellipse"])(x - (width / 2 | 0), y - (height / 2 | 0), (width / 2 | 0), (height / 2 | 0), 0, /* toRadians */(x => x * Math.PI / 180)(startAngle), /* toRadians */(x => x * Math.PI / 180)(startAngle) + /* toRadians */(x => x * Math.PI / 180)(arcAngle));
    this.context.fill();
  }

  public fillOval(x: number, y: number, width: number, height: number) {
    this.context.beginPath();
    (<any>this.context["ellipse"])(x - (width / 2 | 0), y - (height / 2 | 0), (width / 2 | 0), (height / 2 | 0), 0, 0, Math.PI * 2);
    this.context.fill();
  }

  public fillRect(x: number, y: number, width: number, height: number) {
    this.context.fillRect(x, y, width, height);
  }

  public fillRoundRect(x: number, y: number, width: number, height: number, arcWidth: number, arcHeight: number) {
    this.fillRect(x, y, width, height);
  }

  color: string;

  public setColor(c: string) {
    this.color = c;
    this.context.strokeStyle = c;
    this.context.fillStyle = c;
  }

  public getColor(): string {
    return this.color;
  }

  public setComposite(c : string) {
    this.setColor(c);
  }

  public rotate(theta: number, x?: number, y?: number): any {
    if (typeof x === 'number' && typeof y === 'number') {
        this.context.translate(-x, -y);
        this.context.rotate(theta);
        this.context.translate(x, y);
    } else {
      this.context.rotate(theta);
    }
  }

  public scale(sx: number, sy: number) {
    this.context.scale(sx, sy);
  }

  public shear(shx: number, shy: number) {
    this.context.transform(0, shx, shy, 0, 0, 0);
  }

  public dispose() {
  }

  font: string;

  public setFont(font: string) {
    this.font = font;
    this.context.font = font;
  }

  public getFont(): string {
    return this.font;
  }

  background: string;

  public setBackground(color: string) {
    this.background = color;
    this.context.fillStyle = color;
  }

  public getBackground(): string {
    return this.background;
  }

  public setTransform(transform: java.awt.geom.AffineTransform) {
    this.context.setTransform(transform.getScaleX(), transform.getShearX(), transform.getShearY(), transform.getScaleY(), transform.getTranslateX(), transform.getTranslateY());
  }

  public getTransform(): java.awt.geom.AffineTransform {
    var t = this.context.getTransform();
    return new java.awt.geom.AffineTransform(t.m11, t.m21, t.m12, t.m22, t.m13, t.m23);
  }

  public transform(transform: java.awt.geom.AffineTransform) {
    this.context.transform(transform.getScaleX(), transform.getShearX(), transform.getShearY(), transform.getScaleY(), transform.getTranslateX(), transform.getTranslateY());
  }

  public setPaintMode() {
  }

  public getPaint(): string|CanvasPattern {
    return this.color;
  }

  public setPaint(paint: string|CanvasPattern) {
    if(typeof paint === "string") {
      this.setColor(paint);
    } else {
     this.context.strokeStyle = paint;
     this.context.fillStyle = paint;
    }
  }

  public setStroke(s: java.awt.Stroke) {
    this.context.lineWidth = s.getLineWidth();
  }
  
  public createPattern(image : HTMLImageElement) : CanvasPattern {
    return this.context.createPattern(image, 'repeat');
  }
  
}

namespace java.awt {
  export interface Paint { }

  export interface Stroke { }
}

namespace java.awt.image {
    /**
     * RenderedImage is a common interface for objects which contain
     * or can produce image data in the form of Rasters.  The image
     * data may be stored/produced as a single tile or a regular array
     * of tiles.
     */
    export interface RenderedImage {
        getWidth(observer? : any) : any;

        getHeight(observer? : any) : any;
    }
}
/* Generated from Java with JSweet 1.2.0-SNAPSHOT - http://www.jsweet.org */
namespace java.awt {
    export class Image {
        public constructor(src : string) {
            this.source = document.createElement("img");
            this.source.src = src;
        }

        public getWidth(observer? : any) : any {
            if(((observer != null && (observer["__interfaces"] != null && observer["__interfaces"].indexOf("java.awt.image.ImageObserver") >= 0 || observer.constructor != null && observer.constructor["__interfaces"] != null && observer.constructor["__interfaces"].indexOf("java.awt.image.ImageObserver") >= 0)) || observer === null)) {
                let __args = Array.prototype.slice.call(arguments);
                return <any>(() => {
                    return (<number>this.source.width|0);
                })();
            } else throw new Error('invalid overload');
        }

        public getHeight(observer? : any) : any {
            if(((observer != null && (observer["__interfaces"] != null && observer["__interfaces"].indexOf("java.awt.image.ImageObserver") >= 0 || observer.constructor != null && observer.constructor["__interfaces"] != null && observer.constructor["__interfaces"].indexOf("java.awt.image.ImageObserver") >= 0)) || observer === null)) {
                let __args = Array.prototype.slice.call(arguments);
                return <any>(() => {
                    return (<number>this.source.height|0);
                })();
            } else throw new Error('invalid overload');
        }

        public source : HTMLImageElement;

        /**
         * Use the default image-scaling algorithm.
         * 
         * @since JDK1.1
         */
        public static SCALE_DEFAULT : number = 1;

        /**
         * Choose an image-scaling algorithm that gives higher priority to scaling
         * speed than smoothness of the scaled image.
         * 
         * @since JDK1.1
         */
        public static SCALE_FAST : number = 2;

        public static SCALE_SMOOTH : number = 4;

        public static SCALE_REPLICATE : number = 8;

        public static SCALE_AREA_AVERAGING : number = 16;

        public flush() {
        }
    }
    Image["__class"] = "java.awt.Image";

}

// TODO: remove - we have these in JS
class Color {
  static WHITE = "#FFFFFF";
  static BLACK = "#000000";
  static GRAY = "#808080";
  static RED = "#FF0000";
}
