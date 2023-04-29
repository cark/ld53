import { AnimatedSprite } from "./animatedsprite"
import { Engine } from "./engine";
import { Game } from "./game.js"
import { Sprite } from "./sprite.js"
import { Timer } from "./timer";
import { Util } from "./util";
import { Vec } from "./vec.js";


const MAX_SPEED = 90.0;
const lookingLeft = {};
const lookingRight = {};
const bodyScale = new Vec(4.0, 4.0);
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
        //this.direction = LookingLeft;
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
            this.eyePosTimer.reset(Util.remap(Math.random(), 0, 1, 0.2, 3));
            this.eyePosX = Util.oneOf([1, 2, 3])
        }
        this.eyesPos = (new Vec(this.eyePosX, -5)).scale(this.bodyScale);
        let speed = new Vec(0.0, 0.0);
        const keys = this.game.engine.keysDown;
        if (keys.has("ArrowLeft")) {
            speed = speed.add(Vec.LEFT);
        }
        if (keys.has("ArrowRight")) {
            speed = speed.add(Vec.RIGHT);
        }
        if (keys.has("ArrowUp")) {
            speed = speed.add(Vec.UP);
        }
        if (keys.has("ArrowDown")) {
            speed = speed.add(Vec.DOWN);
        }
        let delta = speed.normalize().mul(timeElapsed * MAX_SPEED);
        this.pos = this.pos.add(delta);
        if (delta.x > 0) {
            this.direction = lookingRight;
            this.bodyScale.x = 4;
        } else if (delta.x < 0) {
            this.direction = lookingLeft;
            this.bodyScale.x = -4;
        }
        this.bodySprite.scale = bodyScale;
        this.eyesSprite.scale = bodyScale;
    }

    draw() {
        const engine = this.game.engine;
        this.actualPos = new Vec(Math.trunc(this.pos.x), Math.trunc(this.pos.y));
        engine.stamp(this.bodySprite, this.pos, 0);
        engine.stamp(this.eyesSprite, this.pos.add(this.eyesPos), 0);
    }
}