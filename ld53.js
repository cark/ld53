import { Engine } from "./engine.js"
import { Game } from "./game.js"

/**
 * Represents the Ld53 game.
 * @extends Game
 */
export class Ld53 extends Game {
    /**
     * Animates the game.
     * @param {Engine} engine - The engine to use for drawing.
     * @param {number} timeElapsed - The amount of time elapsed since the last frame.
     * @returns {void}
     */
    animate(engine, timeElapsed) {
        engine.clear("black");
    }
}