import { gridParser } from "./spritesheet";
import { Constants, Util } from "./util";
import { Vec } from "./vec";

export class Goal {
    constructor(level, gridPos) {
        this.level = level;
        this.gridPos = gridPos;
        const engine = this.level.game.engine;
        this.headshot = engine.audio.getSound("headshot.mp3");
        this.headshot.setVolume(0.1);
        this.sprite = engine.spriteSheet("goal.png", gridParser(16, 16, 32, 16));
        this.capo = engine.animatedSprite(engine.spriteSheet("capo.png", gridParser(32, 32, 512, 32)), 0, 1.5)
            .addFrame(1, 1)
            .addFrame(2, 0.3)
            .addFrame(1, 1)
            .addFrame(2, 0.3)
            .addFrame(3, 0.5)
            .addFrame(4, 1)
            .addFrame(5, 0.3)
            .addFrame(4, 1)
            .addFrame(6, 0.5)
            .addFrame(7, 0.5)
            .addFrame(8, 1)
            .addFrame(9, 0.3)
            .addFrame(8, 0.5)
            .addFrame(10, 0.5)
            .addFrame(11, 0.3, this.headshot)
            .addFrame(12, 0.3)
            .addFrame(13, 0.8)
            .addFrame(14, 0.15)
            .addFrame(15, 0.3);
        this.light = engine.sprite("goallight.png");
        this.light.scale = Constants.bodyScale;
        this.light.pos = Util.posToCoord(gridPos.x, gridPos.y, Constants.scale);;
        this.light.center = new Vec(16, 16);
        this.capo.scale = Constants.bodyScale;
        this.capo.pos = Util.posToCoord(gridPos.x, gridPos.y, Constants.scale);
        this.pos = Util.posToCoord(gridPos.x, gridPos.y, Constants.scale);
        this.doorIndex = 0;
        this.state = null;
    }

    update(timeElapsed) {
        if (this.state) {
            this.state.update(timeElapsed);
        }
    }

    open() {
        this.doorIndex = 1;
        this.state = new Open(this);
    }

    draw() {
        const engine = this.level.game.engine;
        const sprite = this.sprite.sprites.get(this.doorIndex);
        sprite.scale = Constants.scale;
        engine.stamp(sprite, this.pos);
        if (this.state) {
            this.state.draw();
        }
    }
}

class Open {
    constructor(goal) {
        this.goal = goal;
        this.level = goal.level;
        this.capo = goal.capo;
        this.light = goal.light;
    }

    update(timeElapsed) {
        // console.log(this.capo);
        this.goal.capo.update(timeElapsed);
    }

    draw() {
        const engine = this.level.game.engine;
        engine.stamp(this.capo, this.capo.pos, 0);
        if (this.goal.doorIndex == 1) {
            engine.activateSurface("lights");
            engine.stamp(this.light, this.light.pos, 0);
            engine.activateSurface("default");
        }
    }
}