import { Game } from "./game.js"

/**
 * The Engine class manages the rendering loop and provides a context to draw on a canvas.
 * @class
 */
export class Engine {
    /**
     * Creates an instance of Engine.
     * @constructor
     * @param {HTMLCanvasElement} canvas - The canvas element to render on.
     * @param {Game} game - The game instance.
     */
    constructor(canvas, game) {
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

        /**
         * The time of the last frame.
         * @type {number}
         * @private
         */
        this.lastFrameTime = performance.now();

        /**
         * The game instance.
         * @type {Game}
         */
        this.game = game;

        /**
         * A map of loaded images for the Engine.
         * @type {Map<string, HTMLImageElement>}
         */
        this.images = new Map();

        this.animate(this.lastFrameTime);
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

    _ensureImage(imageOrUrl) {
        let image;
        if (imageOrUrl instanceof Image) {
            image = imageOrUrl;
        } else {
            image = this.image(imageOrUrl);
        }
        return image;
    }

    /**
     * The rendering loop.
     * @param {number} currentTime - The current time.
     */
    animate(currentTime) {
        const timeElapsed = (currentTime - this.lastFrameTime) / 1000.0;
        this.lastFrameTime = currentTime;
        this.game.animate(this, timeElapsed);
        const self = this;
        window.requestAnimationFrame((ct) => self.animate(ct));
    }
}
