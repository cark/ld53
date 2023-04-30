import { Vec } from "./vec.js"

/**
 * Represents a 2D sprite with an image, position, size, and rotation.
 */
export class Sprite {
    /**
    * Creates a new Sprite instance with the specified image.
    * @param {HTMLImageElement} image - The image used by the sprite.
    * @throws {Error} If the image parameter is null or not an Image.
    */
    constructor(image) {
        if (image == null) throw new Error("Missing image parameter.");
        if (image.nodeName !== "IMG") throw Error("The image parameter must be an Image.")
        this.image = image;
        this.imageRect = {
            top: 0,
            left: 0,
            width: null,
            height: null
        };
        this.visible = true;
        this.scale = new Vec(1.0, 1.0);
        this.center = new Vec(null, null);
        this.alpha = 1.0;
        const self = this;
        function fixSizes() {
            if (self.imageRect.width == null) {
                self.imageRect.width = image.width;
            }
            if (self.imageRect.height == null) {
                self.imageRect.height = image.height;
            }
            if (self.center.x == null) {
                //console.log("fixed");
                self.center.x = image.width / 2;
            }
            if (self.center.y == null) {
                self.center.y = image.height / 2;
            }
        }
        if (image.complete) {
            fixSizes()
        } else {
            image.addEventListener("load", fixSizes);
        }
    }

    /**
     * Sets the rectangular portion of the image to use for the sprite.
     * @param {number} left - The x-coordinate of the top-left corner of the rectangle.
     * @param {number} top - The y-coordinate of the top-left corner of the rectangle.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     */
    setImageRect(left, top, width, height) {
        this.imageRect.top = top;
        this.imageRect.left = left;
        this.imageRect.width = width;
        this.imageRect.height = height;
    }

    /**
     * Sets the center point of the sprite.
     * @param { number } x - The x - coordinate of the center point.
     * @param { number } y - The y - coordinate of the center point.
     */
    setCenter(x, y) {
        this.center.x = x;
        this.center.y = y;
    }

    /**
     * Draws the sprite on the specified canvas context.
     * @param {CanvasRenderingContext2D} context - The context to draw on.
     * @param {Vec} pos - The position of the sprite.
     * @param {number} angle - The rotation angle of the sprite, in degrees.
     * @param {Vec} [scale] - The scale factor to apply to the sprite, as a Vec instance.
     * @throws {Error} If the angle parameter is not a number.
     */
    stamp(context, pos, angle, scale, alpha) {
        if (this.image.complete && this.visible) {
            var scale = scale ? new Vec(this.scale.x * scale.x, this.scale.y * scale.y) : this.scale;
            var angle = angle ? angle : 0;
            var alpha = alpha ? this.alpha * alpha : this.alpha;
            context.save();
            context.globalAlpha = alpha;
            context.translate(pos.x, pos.y);
            context.rotate(angle * Math.PI / 180);
            context.scale(scale.x, scale.y);
            context.translate(- this.center.x, - this.center.y);
            context.drawImage(
                this.image,
                this.imageRect.left, this.imageRect.top,
                this.imageRect.width, this.imageRect.height,
                0, 0, this.imageRect.width, this.imageRect.height
            );
            context.restore();
        }
    }
}