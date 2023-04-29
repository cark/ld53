import { Vec } from "./vec.js"
import { Timer } from "./timer.js"
import { Sprite } from "./sprite.js"
import { SpriteSheet } from "./spritesheet.js"

export class AnimatedSprite {
    constructor(spriteSheet, firstFrameId, frameDuration) {
        if (spriteSheet == null) throw new Error("Missing spriteSheet parameter");
        if (!(spriteSheet instanceof SpriteSheet)) throw new Error("spriteSheet must be a SpriteSheet");
        if (firstFrameId == null) throw new Error("missing firstFrameId parameter");
        this.spriteSheet = spriteSheet;
        this.scale = new Vec(1.0, 1.0);
        this.frameDuration = frameDuration;
        this.frames = [];
        this.addFrame(firstFrameId, null);
        this.timer = new Timer(frameDuration);
        this.currIndex = 0;
        this.repeat = false;
    }

    addFrame(id, duration) {
        if (name == null) throw new Error("Missing name parameter");
        this.frames.push(new AnimationFrame(id, duration))
        return this;
    }

    setRepeat(value) {
        this.repeat = value;
        return this;
    }

    indexDuration(index) {
        if (index >= this.frames.length) throw Error(`Trying to access frame index $(index) when this.frames.length = ${this.frames.length}`);
        const frame = this.frames[index];
        let result = frame.duration ? frame.duration : this.frameDuration;
        return result;
    }

    reset() {
        this.timer.reset();
        this.currIndex = 0;
    }

    update(timeElapsed) {
        this.timer.update(timeElapsed);
        while (this.timer.isDone()) {
            let index = this.currIndex + 1;
            if (index >= this.frames.length) {
                if (this.repeat) {
                    this.currIndex = 0;
                } else {
                    this.currIndex = this.frames.length - 1;
                    break;
                }
            } else {
                this.currIndex = index;
            }
            this.timer.reset(this.indexDuration(this.currIndex), this.timer.excessTime());
        }
    }

    stamp(context, pos, angle) {
        if (this.spriteSheet.loaded) {
            const frame = this.frames[this.currIndex];
            let sprite = frame.sprite;
            if (sprite == null) {
                sprite = this.spriteSheet.sprites.get(frame.name);
                frame.sprite = sprite;
            }
            if (!sprite) throw new Error(`Invalid sprite name: ${frame.name}`);
            sprite.stamp(context, pos, angle, this.scale);
        }
    }

    isDone() {
        return !this.repeat && this.currIndex == this.frames.length - 1 && this.timer.isDone();
    }
}

export class AnimationFrame {
    constructor(id, duration) {
        this.name = id;
        this.duration = duration;
        this.sprite = null;
    }
}