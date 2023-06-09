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

const levels = ["Level_0", "Level_1", "GG"];
export class Ld53 extends Game {
    /**
     * Constructs a new Game instance.
     * @param {Engine} engine - The engine on which this game will run.
     */
    constructor(engine) {
        super(engine);
        this.levels = new Levels(this);
        this.levelIndex = 0;
        // this.state = new GameStateLevel(this, levels[this.levelIndex]);
        // this.state = new GameStateBlurb(this, levels[this.levelIndex]);
        this.currentLevel = null;
        this.music = engine.audio.getSound("music.mp3");
        this.music.setVolume(0.05);
        this.music.setLoop(true);
        this.music.play();
        this.state = new GameStateTitle(this);
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

    wonLevel() {
        if (this.levelIndex < levels.length - 1) {
            this.levelIndex = this.levelIndex + 1;
        }
        this.state = new GameStateBlurb(this, levels[this.levelIndex]);
    }

    nextLevel() {
        if (this.levelIndex < levels.length - 1) {
            this.levelIndex = this.levelIndex + 1;
            this.state = new GameStateBlurb(this, levels[this.levelIndex]);
        }
    }

    previousLevel() {
        if (this.levelIndex > 0) {
            this.levelIndex = this.levelIndex - 1;
            this.state = new GameStateBlurb(this, levels[this.levelIndex]);
        }
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

class GameStateBlurb {
    constructor(game, levelName) {
        this.game = game;
        this.levelName = levelName;
        this.levelState = new GameStateLevel(game, levelName);
        this.registerEvents();
    }

    registerEvents() {
        const self = this;
        function handleEvent() {
            self.game.state = self.levelState;
            //self.game.state = new GameStateBlurb(self.game, levels[self.game.levelIndex]);
            //self.game.state = new GameStateLevel(self.game, "Level_1");
            document.removeEventListener("keypress", handleEvent);
            self.game.engine.canvas.removeEventListener("click", handleEvent);
        }
        document.addEventListener("keypress", handleEvent);
        this.game.engine.canvas.addEventListener("click", handleEvent);
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
        }
    }

    draw() {
        let level = this.game.levels.levels.get(this.levelName);
        if (level && level.blurb) {
            this.game.engine.text(level.blurb, 500, -200, -100, 30)
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
            self.game.state = new GameStateBlurb(self.game, levels[self.game.levelIndex]);
            //self.game.state = new GameStateLevel(self.game, "Level_1");
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