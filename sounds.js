export class Sounds {
    constructor() {
        this.cache = new Map();
    }

    getSound(url) {
        const found = this.cache.get(url);
        if (found) {
            return found;
        } else {
            const result = new Sound(url);
            this.cache.set(url, result);
            return result;
        }
    }
}

export class Sound {
    constructor(url) {
        this.url = url;
        this.wantsToPlay = false;
        this.ready = false;
        this.audio = new Audio(url);
        const self = this;
        this.audio.addEventListener("canplaythrough", () => {
            self.ready = true;
            if (self.wantsToPlay) {
                self.audio.play();
            }
        });
    }

    setLoop(value) {
        this.audio.loop = value;
    }

    setVolume(value) {
        this.audio.volume = value;
    }

    play(value) {
        if (this.ready) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.wantsToPlay = true;
        }
    }

    stop(value) {
        this.audio.stop();
    }

    // spawnPlay() {
    //     const audio = new Audio(this.url);
    //     audio.play();
    // }
}