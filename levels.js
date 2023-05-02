import { SpriteSheet, gridParser } from "./spritesheet";
import { Game } from "./game.js";
import { Engine } from "./engine.js";
import { Vec } from "./vec.js";
import { PizzaMan } from "./pizzaman.js";
import { Util, Constants as C } from "./util.js";
import { Queue } from "./queue";
import { Steam } from "./steam";
import { Timer } from "./timer";
import { Floodlights } from "./floodlights";
import { Walls } from "./walls";
import { Goal } from "./goal";

export class Levels {
    constructor(game) {
        this.data = null;
        this.game = game;
        this.levels = new Map();
        this.ground = game.engine.spriteSheet("ground.png", gridParser(C.cellSize.x, C.cellSize.y, 256, 256));
        this.walls = game.engine.spriteSheet("walls.png", gridParser(C.cellSize.x, C.cellSize.y, 256, 256));
        fetch("world.ldtk")
            .then(response => response.json())
            .then(data => {
                this.data = data;
                let levels = data.levels;
                for (let i = 0; i < levels.length; i++) {
                    const level = new Level(game, levels[i], { ground: this.ground, walls: this.walls });
                    this.levels.set(level.name, level);
                }
                console.log(data);
            })
            .catch(error => {
                console.error(error);
            });
    }
}

export class Level {
    constructor(game, data, spritesheets) {
        this.data = data;
        this.game = game;
        this.width = C.cellSize.x;
        this.height = C.cellSize.y;
        this.name = data.identifier;
        this.spritesheets = spritesheets;
        this.tileLayers = null;
        this.player = null;//new PizzaMan(this);
        this.steams = [];
        this.state = new LevelStateLoading(this);
        this.silencerZones = [];
        this.floodlights = new Floodlights(this);
        this.walls = new Walls(this);
        this.help = null;
        this.gg = null;
        this.goal = null;
        this.blurb = "";
        this.reset();
        this.drawer = null;
        const self = this;
        this.onkeypress = event => {
            if (event.code === "KeyR") {
                self.reset();
            }
        };
    }

    enter() {
        document.addEventListener("keypress", this.onkeypress);
    }

    exit() {
        document.removeEventListener("keypress", this.onkeypress);
    }

    reset() {
        this.steams = [];
        this.silencerZones = [];
        this.tileLayers = new Map();
        this.floodlights = new Floodlights(this);
        this.walls = new Walls(this);
        //const fields = new Map();
        const self = this;
        this.data.fieldInstances.forEach(fi => {
            if (fi.__identifier === "Blurb") {
                self.blurb = fi.__value;
            }
        });
        //console.log(this.blurb);
        for (let i = 0; i < this.data.layerInstances.length; i++) {
            const layerInstance = this.data.layerInstances[i];
            if (layerInstance.__type === "Tiles") {
                const layer = new Tiles(this.game, layerInstance);
                this.tileLayers.set(layer.name, layer);
                //} else if (layerInstance.__identifier === "Walls") {
            } else if (layerInstance.__type === "Entities") {
                const entityInstances = layerInstance.entityInstances;
                for (let i = 0; i < entityInstances.length; i++) {
                    const entityInstance = entityInstances[i];
                    if (entityInstance.__identifier === "Player") {
                        this.player = new PizzaMan(this.game, this);
                        this.player.gridPos.x = entityInstance.__grid[0];
                        this.player.gridPos.y = entityInstance.__grid[1];
                    }
                    if (entityInstance.__identifier === "Truck") {
                        this.truck = this.game.engine.sprite("truck.png");
                        this.truck.scale.x = 3;
                        this.truck.scale.y = 3;
                        this.truck.center.y = 20;
                        this.trucklight = this.game.engine.sprite("trucklight.png");
                        this.trucklight.scale.x = 2;
                        this.trucklight.scale.y = 4;
                        this.trucklight.alpha = 1.0;
                        this.truck.gridPos = new Vec(entityInstance.__grid[0], entityInstance.__grid[1]);
                        this.truck.pos = posToCoord(this.truck.gridPos.x, this.truck.gridPos.y, C.scale);
                        this.addSilencerZone(this.truck.gridPos.add(new Vec(2, 0)));
                    }
                    if (entityInstance.__identifier === "Floodlight") {
                        this.floodlights.addFromLdtk(entityInstance);
                    }
                    if (entityInstance.__identifier === "HelpText") {
                        this.help = this.game.engine.sprite("help.png");
                        this.help.scale = new Vec(3, 3);
                        this.help.pos = Util.posToCoord(entityInstance.__grid[0], entityInstance.__grid[1], C.scale);
                    }
                    if (entityInstance.__identifier === "GG") {
                        this.help = this.game.engine.sprite("gg.png");
                        this.help.scale = new Vec(8, 4);
                        this.help.pos = Util.posToCoord(entityInstance.__grid[0], entityInstance.__grid[1], C.scale);
                    }
                    if (entityInstance.__identifier === "Goal") {
                        this.goal = new Goal(this, new Vec(entityInstance.__grid[0], entityInstance.__grid[1]));
                    }
                }
            }
        }
        this.floodlights.init();
        this.tileLayers.get("Ground").spritesheet = this.spritesheets.ground;
        this.tileLayers.get("Walls").spritesheet = this.spritesheets.walls;
        this.walls.init(this.tileLayers.get("Walls"));
    }

    addSilencerZone(gridPos) {
        this.silencerZones.push(gridPos);
    }

    removeSilencerZone(gridPos) {
        const found = this.silencerZones.find(pos => pos.equals(gridPos));
        if (found) {
            const index = this.silencerZones.indexOf(found);
            if (index >= 0) {
                this.silencerZones.slice(index, 1);
            }
        }
    }

    isSilencerZone(gridPos) {
        return this.silencerZones.find(pos => pos.equals(gridPos)) != null;
    }

    update(timeElapsed) {
        const player = this.player;
        if (player) {
            player.update(timeElapsed);
        }
        // const truck = this.truck;
        // if (truck) {
        //     truck.pos = posToCoord(truck.gridPos.x, truck.gridPos.y, C.scale);
        // }
        this.steams.forEach(steam => steam.update(timeElapsed));
        if (!this.player.dying) this.floodlights.update(timeElapsed);
        if (this.goal) {
            this.goal.update(timeElapsed);
        }
        this.state.update(timeElapsed);
    }

    draw() {
        // if (this.drawer) {
        //     this.drawer.draw();
        // }
        const engine = this.game.engine;
        const context = engine.context;
        const lightsContext = engine.getSurface("lights").context;
        lightsContext.save();
        context.save();
        const player = this.player;
        if (player) {
            // let coord = [Math.trunc(-player.pos.x), Math.trunc(-player.pos.y)]
            player.pos.x = Math.trunc(player.pos.x);
            player.pos.y = Math.trunc(player.pos.y);
            context.translate(-player.pos.x, -player.pos.y);
            lightsContext.translate(-player.pos.x, -player.pos.y);
            this.tileLayers.get("Ground").draw();
            this.tileLayers.get("Walls").draw();
            player.draw();
            if (this.goal) {
                this.goal.draw();
            }
            const truck = this.truck;
            if (truck) {
                engine.stamp(truck, truck.pos, 0);
                const trucklight = this.trucklight;
                if (trucklight) {
                    engine.activateSurface("lights");
                    engine.stamp(trucklight, truck.pos.add(new Vec(115, -20), 0));
                    engine.activateSurface("default");
                }
            }
            this.steams.forEach(steam => steam.draw());
            this.floodlights.draw();
            if (this.help) {
                engine.stamp(this.help, this.help.pos);
            }
        }
        lightsContext.restore();
        context.restore();
    }

    turn() {
        this.steamTurn();
        this.floodlights.turn();
        this.state.turn();
    }

    isPlayerAtGoal() {
        return this.goal && this.player.gridPos.equals(this.goal.gridPos.add(Vec.DOWN));
    }

    steamTurn() {
        this.steams.forEach(steam => steam.turn());
    }

    steamDone(steam) {
        const index = this.steams.indexOf(steam);
        if (index !== -1) {
            this.steams.splice(index, 1);
        }
    }

    isInFloodLight(pos) {
        return this.floodlights.isInFloodLight(pos);
    }

    isPassable(pos) {
        let goalBlock = this.goal && this.goal.gridPos.equals(pos);
        return this.walls.isPassable(pos) && !goalBlock;
    }
}

// class LevelDrawer {
//     constructor(level) {
//         this.level = level;
//     }
//     draw() {
//         const engine = this.level.game.engine;
//         const context = engine.context;
//         const lightsContext = engine.getSurface("lights").context;
//         lightsContext.save();
//         context.save();
//         const player = this.level.player;
//         if (player) {
//             // let coord = [Math.trunc(-player.pos.x), Math.trunc(-player.pos.y)]
//             player.pos.x = Math.trunc(player.pos.x);
//             player.pos.y = Math.trunc(player.pos.y);
//             context.translate(-player.pos.x, -player.pos.y);
//             lightsContext.translate(-player.pos.x, -player.pos.y);
//             this.level.tileLayers.get("Ground").draw();
//             this.level.tileLayers.get("Walls").draw();
//             player.draw();
//             if (this.level.goal) {
//                 this.level.goal.draw();
//             }
//             const truck = this.level.truck;
//             if (truck) {
//                 engine.stamp(truck, truck.pos, 0);
//                 const trucklight = this.level.trucklight;
//                 if (trucklight) {
//                     engine.activateSurface("lights");
//                     engine.stamp(trucklight, truck.pos.add(new Vec(115, -20), 0));
//                     engine.activateSurface("default");
//                 }
//             }
//             this.level.steams.forEach(steam => steam.draw());
//             this.level.floodlights.draw();
//             if (this.level.help) {
//                 engine.stamp(this.level.help, this.level.help.pos);
//             }
//         }
//         lightsContext.restore();
//         context.restore();

//     }
// }

class LevelStateLoading {
    constructor(level) {
        this.level = level;
        this.game = level.game;
    }

    turn() {

    }

    update(timeElapsed) {
        if (this.level.player && this.level.player.gridPos) {
            this.level.state = new LevelStateReady(this.level);
            // this.level.state = new LevelStateBlurb(this.level);
        }
    }
}

class LevelStateReady {
    constructor(level) {
        this.level = level;
        this.game = level.game;
        const steam = new Steam(this.game, level.player.gridPos);
        steam.ondone = (steam) => level.steamDone(steam);
        this.level.steams.push(steam);
        //this.level.drawer = new LevelDrawer(level);
    }

    turn() {
        this.level.state = new TurnStateTurn(this.level);
    }

    update(timeElapsed) {
        if (this.level.isPlayerAtGoal()) {
            this.level.player.disapear();
            this.level.goal.open();
        }
    }
}

class TurnStateTurn {
    constructor(level) {
        this.timer = new Timer(C.turnDuration);
        this.level = level;
        this.game = level.game;
        this.turnStart();
    }

    update(timeElapsed) {
        this.timer.update(timeElapsed);
        if (this.timer.isDone()) {
            this.level.state = new LevelStateReady(this.level);
        }
    }

    turnStart() {

    }

    turn() {

    }
}

function posToCoord(x, y, scale) {
    return (new Vec(x * C.cellSize.x, y * C.cellSize.y)).scale(scale);
}

export class Tiles {
    constructor(game, data) {
        this.game = game;
        this.name = data['__identifier'];
        this.width = data['__cWid'];
        this.height = data['__cHei'];
        this.tiles = data.gridTiles.map(tileDef => {
            const d = tileDef.d[0];
            const x = d % this.width;
            const y = Math.floor(d / this.width);
            return { id: tileDef.t, pos: new Vec(x, y) };
        });
        // console.log(this.tiles);
        this.spritesheet = null;
        // console.log(this.name);
    }

    draw() {
        const engine = this.game.engine;
        this.tiles.forEach(tile => {
            const sprite = this.spritesheet.sprites.get(tile.id);
            const coord = posToCoord(tile.pos.x, tile.pos.y, C.scale);
            sprite.scale = C.scale;
            engine.stamp(sprite, coord);
        });
    }
}

// class LevelStateBlurb {
//     constructor(level) {
//         this.level = level;
//     }

//     update(timeElapsed) {
//         const keys = this.level.game.engine.keysDown;
//         if (keys.has("Enter")) {
//             this.level.state = new LevelStateReady(this.level);
//         }
//     }

//     draw() {

//     }
// }