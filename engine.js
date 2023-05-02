import { Game } from "./game.js"
import { Sprite } from "./sprite.js"
import { AnimatedSprite } from "./animatedsprite.js"
import { SpriteSheet } from "./spritesheet.js"
import { Surface } from "./surface.js"
import { Sounds } from "./sounds.js"

/**
 * The Engine class manages the rendering loop and provides a context to draw on a canvas.
 * @class
 */
export class Engine {
    /**
     * Creates an instance of Engine.
     * @constructor
     * @param {HTMLCanvasElement} canvas - The canvas element to render on.
     * @param {typeof Game} gameClass - The class that defines the game logic.
     */
    constructor(canvas, gameClass) {
        /**
         * The canvas element.
         * @type {HTMLCanvasElement}
         */
        this.canvas = canvas;

        /**
         * The rendering context of the canvas.
         * @type {CanvasRenderingContext2D}
         */
        this.context = canvas.getContext("2d");
        //this.context.scale(1, -1);
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.context.imageSmoothingEnabled = false;
        //this.context.imageSmoothingQuality = "low";

        /**
         * The time of the last frame.
         * @type {number}
         * @private
         */
        this.lastFrameTime = performance.now();


        /**
         * A map of loaded images for the Engine.
         * @type {Map<string, HTMLImageElement>}
        */
        this.images = new Map();

        this.keysDown = new Set();
        document.addEventListener("keydown", ev => {
            this.keysDown.add(event.code);
        });

        document.addEventListener("keyup", ev => {
            this.keysDown.delete(event.code);
        });

        this.audio = new Sounds();

        /**
         * The game instance.
         * @type {Game}
         */
        this.game = new gameClass(this);

        this.surfaces = new Map();
        this.addSurface("default", this.canvas, this.context);

        this.animate(this.lastFrameTime);
    }

    addSurface(name, canvas, context) {
        const surface = new Surface(name, canvas, context);
        this.surfaces.set(name, surface);
        return surface;
    }

    getSurface(name) {
        return this.surfaces.get(name);
    }

    activateSurface(name) {
        const surface = this.getSurface(name);
        if (surface) {
            this.canvas = surface.canvas;
            this.context = surface.context;
        }
        return surface;
    }

    ensureSurface(name, size) {
        let surface = this.getSurface(name);
        if (surface) {
            return surface;
        } else {
            const canvas = document.createElement("canvas");
            canvas.width = size.x;
            canvas.height = size.y;
            const context = canvas.getContext("2d");
            context.translate(canvas.width / 2, canvas.height / 2);
            context.imageSmoothingEnabled = false;
            return this.addSurface(name, canvas, context);
        }
    }

    /**
     * Clears the canvas with a specified color.
     * @param {string} clearColor - The color to clear the canvas with.
     */
    clear(clearColor) {
        this.context.save();
        this.context.setTransform();
        this.context.fillStyle = clearColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
    }

    /**
     * Returns an image object for the specified URL. If the image has already been loaded, returns the cached object.
     * @param {string} url - The URL of the image to load.
     * @returns {HTMLImageElement} - The image object.
     * @throws {Error} - If the url parameter is null or undefined.
    */
    image(url) {
        if (url == null) throw new Error("Missing url parameter");
        let image = this.images.get(url);
        if (image) {
            return image;
        } else {
            image = new Image();
            image.src = url;
            image.addEventListener("error", () => {
                console.error(`Error trying to load image "${url}".`);
            });
            this.images.set(url, image);
            return image;
        }
    }

    /**
     * Ensures that the given image is loaded and returns it. If an URL is passed,
     * the method will first load the image before returning it.
     *
     * @param {string|HTMLImageElement} imageOrUrl - Either an URL or an already
     * loaded `HTMLImageElement`.
     *
     * @returns {HTMLImageElement} The loaded `HTMLImageElement`.
     */
    ensureImage(imageOrUrl) {
        if (imageOrUrl instanceof Image) {
            return imageOrUrl;
        } else {
            return this.image(imageOrUrl);
        }
    }

    /**
     * Creates and returns a new sprite instance from the given image. If an URL
     * is passed, the method will first load the image before creating the sprite.
     *
     * @param {string|HTMLImageElement} imageOrUrl - Either an URL or an already
     * loaded `HTMLImageElement`.
     *
     * @returns {Sprite} The new `Sprite` instance.
     */
    sprite(imageOrUrl) {
        return new Sprite(this.ensureImage(imageOrUrl));
    }

    animatedSprite(spriteSheet, firstFrameId, frameDuration) {
        return new AnimatedSprite(spriteSheet, firstFrameId, frameDuration);
    }

    spriteSheet(imageOrUrl, parser) {
        return new SpriteSheet(this.ensureImage(imageOrUrl), parser);
    }

    /**
     * The rendering loop.
     * @param {number} currentTime - The current time.
     */
    animate(currentTime) {
        const timeElapsed = (currentTime - this.lastFrameTime) / 1000.0;
        this.lastFrameTime = currentTime;
        this.game.animate(timeElapsed);
        const self = this;
        window.requestAnimationFrame((ct) => self.animate(ct));
    }

    stamp(sprite, pos, angle) {
        if (sprite == null) throw new Error("Missing sprite parameter");
        if (!(sprite instanceof Sprite || sprite instanceof AnimatedSprite)) throw new Error("sprite must be a Sprite or an AnimatedSprite.");
        sprite.stamp(this.context, pos, angle);
    }

    text(text, maxWidth, x, y, lineHeight) {
        this.context.save();
        this.context.font = "16px Arial";
        this.context.fillStyle = "#FFD";
        drawMultilineText(this.context, text, maxWidth, x, y, lineHeight);
        this.context.restore();
    }
}

function drawMultilineText(context, text, maxWidth, x, y, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for (var i = 0; i < words.length; i++) {
        var testLine = line + words[i] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;

        if (testWidth > maxWidth && i > 0) {
            context.fillText(line, x, y);
            line = words[i] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }

    context.fillText(line, x, y);
}