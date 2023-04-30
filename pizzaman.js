import { SpriteSheet, gridParser } from "./spritesheet";
import { AnimatedSprite } from "./animatedsprite"
import { Engine } from "./engine";
import { Game } from "./game.js"
import { Sprite } from "./sprite.js"
import { Timer } from "./timer";
import { Util } from "./util";
import { Vec } from "./vec.js";
import { Constants as C } from "./constants.js";


const MAX_SPEED = 90.0;
const lookingLeft = {};
const lookingRight = {};
const bodyScale = new Vec(2.0, 2.0);
//const cellSize = new Vec(16, 16);
//const scale = new Vec(4, 4);

export class PizzaMan {
    constructor(game) {
        this.game = game;
        this.pos = new Vec(0.0, 0.0);
        // const bodyScale = new Vec(1.0, 1.0);

        this.bodyScale = bodyScale;
        this.eyesPos = (new Vec(1, -5)).scale(this.bodyScale);
        this.bodySprite = game.engine.sprite("pizzaman.png");
        this.bodySprite.scale = bodyScale;
        this.eyesSprite = game.engine.sprite("pizzamaneyes.png");
        this.eyesSprite.scale = bodyScale;
        this.blinkTimer = new Timer(0.2);
        this.eyePosTimer = new Timer(0.5);
        this.eyePosX = 1;
        this.gridPos = new Vec(0, 0);
        this.moveState = new ReadyMoveState(this);
        this.steam = game.engine.animatedSprite(game.engine.spriteSheet("steam.png", gridParser(8, 8, 24, 8)), 0, 0.5)
            .addFrame(1)
            .addFrame(2)
            .setRepeat(true);
        this.steam.scale = bodyScale;
        this.steam.alpha = 0.3;
        this.steamPos = new Vec(-6, -12);
    }

    update(timeElapsed) {
        this.blinkTimer.update(timeElapsed);
        if (this.blinkTimer.isDone()) {
            if (this.eyesSprite.visible) {
                this.eyesSprite.visible = false;
                this.blinkTimer.reset(0.1);
            } else {
                this.eyesSprite.visible = true;
                this.blinkTimer.reset(Util.remap(Math.random(), 0, 1, 0.2, 4));
            }
        }
        this.eyePosTimer.update(timeElapsed);
        if (this.eyePosTimer.isDone()) {
            this.eyePosTimer.reset(Util.remap(Math.random(), 0, 1, 0.4, 3));
            this.eyePosX = Util.oneOf([1, 2, 3]);
            if (this.eyePosX == 1) {
                this.eyePosTimer.duration = Util.remap(this.eyePosTimer.duration, 0.4, 4, 0.2, 0.5);
            }
        }
        this.eyesPos = (new Vec(this.eyePosX, -5)).scale(this.bodyScale);
        this.steam.update(timeElapsed);

        this.moveState.update(timeElapsed);

        //this.pos = posToCoord(this.gridPos.x, this.gridPos.y, C.scale);


        // let speed = new Vec(0.0, 0.0);
        // const keys = this.game.engine.keysDown;
        // if (keys.has("ArrowLeft")) {
        //     speed = speed.add(Vec.LEFT);
        // }
        // if (keys.has("ArrowRight")) {
        //     speed = speed.add(Vec.RIGHT);
        // }
        // if (keys.has("ArrowUp")) {
        //     speed = speed.add(Vec.UP);
        // }
        // if (keys.has("ArrowDown")) {
        //     speed = speed.add(Vec.DOWN);
        // }
        // let delta = speed.normalize().mul(timeElapsed * MAX_SPEED);
        // this.pos = this.pos.add(delta);
        // if (delta.x > 0) {
        //     this.direction = lookingRight;
        //     this.bodyScale.x = Math.abs(this.bodyScale.x);
        // } else if (delta.x < 0) {
        //     this.direction = lookingLeft;
        //     this.bodyScale.x = -Math.abs(this.bodyScale.x);
        // }
        this.bodySprite.scale = bodyScale;
        this.eyesSprite.scale = bodyScale;
    }

    draw() {
        const engine = this.game.engine;
        this.actualPos = new Vec(Math.trunc(this.pos.x), Math.trunc(this.pos.y));
        engine.stamp(this.bodySprite, this.pos, 0);
        engine.stamp(this.eyesSprite, this.pos.add(this.eyesPos), 0);
        this.game.engine.stamp(this.steam, this.pos.add(this.steamPos.scale(this.bodyScale)), 0);
    }
}

class ReadyMoveState {
    constructor(pizzaman) {
        this.pizzaman = pizzaman;
    }
    update(timeElapsed) {
        let self = this;
        this.pizzaman.pos = posToCoord(this.pizzaman.gridPos.x, this.pizzaman.gridPos.y, C.scale);
        const keys = this.pizzaman.game.engine.keysDown;
        function move(dir) {
            self.pizzaman.moveState = new MovingState(self.pizzaman, self.pizzaman.gridPos.add(dir));
        }
        if (keys.has("ArrowLeft")) {
            move(Vec.LEFT);
        } else if (keys.has("ArrowRight")) {
            move(Vec.RIGHT);
        } else if (keys.has("ArrowUp")) {
            move(Vec.UP);
        } else if (keys.has("ArrowDown")) {
            move(Vec.DOWN);
        }
    }
}

class MovingState {
    constructor(pizzaman, dest) {
        this.timer = new Timer(0.5);
        this.pizzaman = pizzaman;
        this.dest = dest;
    }
    update(timeElapsed) {
        this.timer.update(timeElapsed);
        if (this.timer.isDone()) {
            this.pizzaman.gridPos = this.dest;
            this.pizzaman.moveState = new ReadyMoveState(this.pizzaman);
        } else {
            const coord = posToCoord(this.pizzaman.gridPos.x, this.pizzaman.gridPos.y, C.scale)
                .lerp(this.timer.percentDone(), posToCoord(this.dest.x, this.dest.y, C.scale));
            this.pizzaman.pos = coord;
        }
    }
}

function posToCoord(x, y, scale) {
    return (new Vec(x * C.cellSize.x, y * C.cellSize.y)).scale(scale);
}
