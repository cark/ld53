/**
 * abstract class represents a game.
 */
export class Game {
    /**
     * Constructs a new Game instance.
     * @param {Engine} engine - The engine on which this game will run.
     */
    constructor(engine) {
        this.engine = engine;
    }
    /**
     * Animates the game.
     * @param {Engine} engine - The engine to use for drawing.
     * @param {number} timeElapsed - The amount of time elapsed since the last frame.
     * @returns {void}
     */
    animate(timeElapsed) {
    }
}
