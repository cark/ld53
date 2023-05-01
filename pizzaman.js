import { SpriteSheet, gridParser } from "./spritesheet";
import { AnimatedSprite } from "./animatedsprite"
import { Engine } from "./engine";
import { Game } from "./game.js"
import { Sprite } from "./sprite.js"
import { Timer } from "./timer";
import { Vec } from "./vec.js";
import { Util, Constants as C } from "./util";


const MAX_SPEED = 90.0;
const lookingLeft = {};
const lookingRight = {};
const bodyScale = new Vec(2.0, 2.0);
//const cellSize = new Vec(16, 16);
//const scale = new Vec(4, 4);

export class PizzaMan {
    constructor(game, level) {
        this.game = game;
        this.pos = new Vec(0.0, 0.0);
        this.level = level;
        this.dying = false;

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
        this.glowSprite = game.engine.sprite("CharGlow.png");
        this.glowSprite.alpha = 0.3;
        this.glowSprite.scale.x = 2.0;
        this.glowSprite.scale.y = 2.0;
        this.silencerDeath = game.engine.animatedSprite(game.engine.spriteSheet("silencerdeath.png", gridParser(32, 32, 256, 32)), 0, 0.2);
        this.silencerDeath.scale = bodyScale;
        for (let i = 1; i < 7; i++) {
            this.silencerDeath.addFrame(i);
        }
        this.drawer = new RegularDrawer(this);
        // this.steam = game.engine.animatedSprite(game.engine.spriteSheet("steam.png", gridParser(8, 8, 24, 8)), 0, 0.5)
        //     .addFrame(1)
        //     .addFrame(2)
        //     .setRepeat(true);
        // this.steam.scale = bodyScale;
        // this.steam.alpha = 0.3;
        // this.steamPos = new Vec(-6, -12);
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

        this.moveState.update(timeElapsed);

        this.bodySprite.scale = bodyScale;
        this.eyesSprite.scale = bodyScale;
        this.drawer.update(timeElapsed);
    }

    draw() {
        this.drawer.draw();
        // const engine = this.game.engine;
        // engine.stamp(this.bodySprite, this.pos, 0);
        // engine.stamp(this.eyesSprite, this.pos.add(this.eyesPos), 0);
        // engine.activateSurface("lights");
        // engine.stamp(this.glowSprite, this.pos, 0);
        // engine.activateSurface("default");
    }
}

class RegularDrawer {
    constructor(pizzaman) {
        this.pizzaman = pizzaman;
    }
    update(timeElapsed) {

    }
    draw() {
        const engine = this.pizzaman.game.engine;
        engine.stamp(this.pizzaman.bodySprite, this.pizzaman.pos, 0);
        engine.stamp(this.pizzaman.eyesSprite, this.pizzaman.pos.add(this.pizzaman.eyesPos), 0);
        engine.activateSurface("lights");
        engine.stamp(this.pizzaman.glowSprite, this.pizzaman.pos, 0);
        engine.activateSurface("default");
    }
}

class ReadyMoveState {
    constructor(pizzaman) {
        this.pizzaman = pizzaman;
    }
    update(timeElapsed) {
        if (this.pizzaman.level.isSilencerZone(this.pizzaman.gridPos)) {
            this.pizzaman.moveState = new SilencerDeath(this.pizzaman);
            return;
        }

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
        this.timer = new Timer(C.turnDuration);
        this.pizzaman = pizzaman;
        this.sourcePos = this.pizzaman.gridPos;
        this.pizzaman.gridPos = dest;
        // console.log(pizzaman);
        pizzaman.level.turn();
    }
    update(timeElapsed) {
        if (this.pizzaman.level.isInFloodLight(this.pizzaman.pos)) {
            console.log("bleh!");
            this.pizzaman.moveState = new SilencerDeath(this.pizzaman);
            return;
        }
        this.timer.update(timeElapsed);
        if (this.timer.isDone()) {
            //this.pizzaman.gridPos = this.dest;
            this.pizzaman.moveState = new ReadyMoveState(this.pizzaman);
        } else {
            const coord = posToCoord(this.sourcePos.x, this.sourcePos.y, C.scale)
                .lerp(this.timer.percentDone(), posToCoord(this.pizzaman.gridPos.x, this.pizzaman.gridPos.y, C.scale));
            this.pizzaman.pos = coord;
        }
    }
}

function posToCoord(x, y, scale) {
    return (new Vec(x * C.cellSize.x, y * C.cellSize.y)).scale(scale);
}

class SilencerDeath {
    constructor(pizzaman) {
        this.pizzaman = pizzaman;
        pizzaman.dying = true;
        pizzaman.drawer = new SilencerDeathDrawer(pizzaman);
    }
    update(timeElapsed) {
    }
}

class SilencerDeathDrawer {
    constructor(pizzaman) {
        this.pizzaman = pizzaman;
        this.pizzaman.silencerDeath.reset();
        this.pizzaman.level.steamTurn();
    }
    update(timeElapsed) {
        this.pizzaman.silencerDeath.update(timeElapsed);
    }
    draw() {
        const engine = this.pizzaman.game.engine;
        engine.stamp(this.pizzaman.silencerDeath, this.pizzaman.pos, 0);
        engine.activateSurface("lights");
        engine.stamp(this.pizzaman.glowSprite, this.pizzaman.pos, 0);
        engine.activateSurface("default");
    }
}