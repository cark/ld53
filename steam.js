// TODO: wiggle the steam a little bit


import { Timer } from "./timer";
import { Util, Constants as C } from "./util.js";
import { gridParser } from "./spritesheet";
import { Vec } from "./vec";
//import { Constants } from "./constants.js";

const base_alpha = 0.2;
const low_alpha = 0.04;
const max_steams = 10;
export class Steam {
    constructor(game, gridPos) {
        this.game = game;
        this.sprite = game.engine.animatedSprite(game.engine.spriteSheet("steam.png", gridParser(8, 8, 24, 8)), 0, 0.7)
            .addFrame(1)
            .addFrame(2)
            .setRepeat(true);
        this.sprite.scale = C.bodyScale;
        this.sprite.alpha = base_alpha;
        this.relPos = new Vec(-6, -12);
        this.gridPos = gridPos;
        this.age = 0;
        this.state = new StateOnPlayer(this);
        this.ondone = null;
    }

    update(timeElapsed) {
        this.sprite.update(timeElapsed);
        this.state.update(timeElapsed);
    }

    draw() {
        const coord = Util.posToCoord(this.gridPos.x, this.gridPos.y, C.scale).add(this.relPos.scale(C.bodyScale));
        this.game.engine.stamp(this.sprite, coord, 0);
    }

    turn() {
        this.age += 1;
        this.state.turn();
    }

    isActive() {
        return this.age <= max_steams;
    }
}

class StateOnPlayer {
    constructor(steam) {
        this.steam = steam;
    }

    update(timeElapsed) {

    }

    turn() {
        this.steam.state = new StateExpand(this.steam);
    }
}

class StateExpand {
    constructor(steam) {
        this.steam = steam;
        this.timer = new Timer(4);
        this.startScale = this.steam.sprite.scale;
        this.targetScale = new Vec(8, 8);
        this.startRelPos = this.steam.relPos;
        this.targetRelPos = new Vec(0, 0);
    }

    update(timeElapsed) {
        this.timer.update(timeElapsed);
        if (this.timer.isDone()) {
            this.steam.sprite.scale = this.targetScale;
            this.steam.relPos = this.targetRelPos;
            this.steam.state = new StateAging(this.steam);
        } else {
            this.steam.sprite.scale = this.startScale.lerp(this.timer.percentDone(), this.targetScale);
            this.steam.relPos = this.startRelPos.lerp(this.timer.percentDone(), this.targetRelPos);
            this.steam.sprite.alpha = Util.lerp(this.steam.age / 10.0, base_alpha, low_alpha)
        }
    }

    turn() {
    }
}

class StateAging {
    constructor(steam) {
        this.steam = steam;
    }
    update(timeElapsed) {

    }
    turn() {
        if (this.steam.isActive()) {
            this.steam.sprite.alpha = Util.lerp(this.steam.age / 10.0, base_alpha, low_alpha)
        } else {
            this.steam.state = new StateDisapear(this.steam);
        }
    }
}

class StateDisapear {
    constructor(steam) {
        this.steam = steam;
        this.timer = new Timer(0.5);
    }

    update(timeElapsed) {
        this.timer.update(timeElapsed);
        if (this.timer.isDone()) {
            this.steam.sprite.alpha = 0.001;
            //console.log(this.steam);
            if (this.steam.ondone) {
                //console.log(this.steam);
                this.steam.ondone(this.steam);
            }
        } else {
            this.steam.sprite.alpha = Util.lerp(this.timer.percentDone(), low_alpha, 0);
        }
    }

    turn() {

    }
}