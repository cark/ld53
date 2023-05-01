import { Engine } from "./engine.js"
import { Game } from "./game.js"
import { Vec } from "./vec.js"
import { AnimatedSprite } from './animatedsprite.js'
import { kennyParser } from "./spritesheet.js"
import { PizzaMan } from "./pizzaman.js"
import { Levels } from "./levels.js"

/**
 * Represents the Ld53 game.
 * @extends Game
 */
export class Ld53 extends Game {
    /**
     * Constructs a new Game instance.
     * @param {Engine} engine - The engine on which this game will run.
     */
    constructor(engine) {
        super(engine);
        this.levels = new Levels(this);
        this.state = new GameStateLevel(this, "Level_1");
        this.currentLevel = null;
        // this.state = new GameStateTitle(this);
    }

    /**
     * Animates the game.
     * @param {Engine} engine - The engine to use for drawing.
     * @param {number} timeElapsed - The amount of time elapsed since the last frame.
     * @returns {void}
     */
    animate(timeElapsed) {
        this.engine.clear("#444");
        this.state.update(timeElapsed);
        this.state.draw();
    }
}

class GameStateLevel {
    constructor(game, levelName) {
        this.game = game;
        this.levelName = levelName
    }

    update(timeElapsed) {
        let level = this.game.levels.levels.get(this.levelName);
        if (level) {
            if (this.game.currentLevel) {
                if (this.game.currentLevel !== level) {
                    this.game.currentLevel.exit();
                    this.game.currentLevel = level;
                    level.enter();
                }
            } else {
                this.game.currentLevel = level;
                level.enter();
            }
            level.update(timeElapsed);
        }
    }

    draw() {
        let level = this.game.currentLevel;
        if (level) {
            const engine = this.game.engine;
            let lightSurface = engine.activateSurface(engine.ensureSurface("lights", new Vec(1280, 768)).name);
            engine.clear("#443");
            let defaultSurface = engine.activateSurface("default");

            level.draw();

            lightSurface.context.save();
            defaultSurface.context.save();
            lightSurface.context.setTransform();
            defaultSurface.context.setTransform();
            defaultSurface.context.globalCompositeOperation = "multiply";
            defaultSurface.context.drawImage(lightSurface.canvas, 0, 0);
            defaultSurface.context.restore();
            lightSurface.context.restore();
        }
    }
}

class GameStateTitle {
    constructor(game) {
        this.game = game;
        this.sprite = game.engine.sprite("title.png");
        this.sprite.scale.x = 3.0;
        this.sprite.scale.y = 3.0;
        this.registerEvents();
    }

    registerEvents() {
        const self = this;
        function handleEvent() {
            console.log("event");
            self.game.state = new GameStateLevel(self.game, "Level_1");
            document.removeEventListener("keypress", handleEvent);
            self.game.engine.canvas.removeEventListener("click", handleEvent);
        }
        document.addEventListener("keypress", handleEvent);
        this.game.engine.canvas.addEventListener("click", handleEvent);
    }

    update(timeElapsed) {
    }

    draw() {
        this.game.engine.stamp(this.sprite, new Vec(0, 0), 0);
    }
}