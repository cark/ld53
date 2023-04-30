import { Util } from "./util";

export class Steam {
    constructor(game, gridPos) {
        this.sprite = game.engine.animatedSprite(game.engine.spriteSheet("steam.png", gridParser(8, 8, 24, 8)), 0, 0.5)
            .addFrame(1)
            .addFrame(2)
            .setRepeat(true);
        this.sprite.scale = Util.bodyScale;
        this.sprite.alpha = 0.3;
        this.relPos = new Vec(-6, -12);
    }
}