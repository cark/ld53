import { Engine } from "./engine.js"
import { Game } from "./game.js"
import { Vec } from "./vec.js"
import { AnimatedSprite } from './animatedsprite.js'
import { kennyParser } from "./spritesheet.js"

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
        this.ship = engine.sprite("ship.png");
        this.ship.scale.x = 0.2;
        this.ship.scale.y = 0.2;
        const adventurerSheet = engine.spriteSheet("character_femaleAdventurer_sheet.png", kennyParser("character_femaleAdventurer_sheet.xml"));
        this.adventurer = engine.animatedSprite(adventurerSheet, "walk0", 0.1)
            .addFrame("walk1")
            .addFrame("walk2")
            .addFrame("walk3")
            .addFrame("walk4")
            .addFrame("walk5")
            .addFrame("walk6")
            .addFrame("walk7")
            .setRepeat(true);
        this.adventurer.scale = new Vec(1.0, 1.0);
    }

    /**
     * Animates the game.
     * @param {Engine} engine - The engine to use for drawing.
     * @param {number} timeElapsed - The amount of time elapsed since the last frame.
     * @returns {void}
     */
    animate(engine, timeElapsed) {
        engine.clear("black");
        // engine.context.fillStyle = "red";  // set fill color
        // engine.context.fillRect(0, 0, 10, 10);
        engine.stamp(this.ship, new Vec(0, 0), 0);
        this.adventurer.update(timeElapsed);
        engine.stamp(this.adventurer, new Vec(0, 0), 0);
        // console.log(this.ship.center);
    }
}