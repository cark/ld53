import { SpriteSheet, gridParser } from "./spritesheet";
import { Game } from "./game.js";
import { Engine } from "./engine.js";
import { Vec } from "./vec.js";
import { PizzaMan } from "./pizzaman.js";
import { Constants as C } from "./util.js";
import { Queue } from "./queue";
import { Steam } from "./steam";
import { Timer } from "./timer";

// const scale = new Vec(4, 4);
// const cellSize = new Vec(16, 16);

export class Levels {
    constructor(game) {
        this.data = null;
        this.game = game;
        this.levels = new Map();
        this.ground = game.engine.spriteSheet("ground.png", gridParser(C.cellSize.x, C.cellSize.y, 256, 256));
        fetch("world.ldtk")
            .then(response => response.json())
            .then(data => {
                this.data = data;
                let levels = data.levels;
                for (let i = 0; i < levels.length; i++) {
                    const level = new Level(game, levels[i], { ground: this.ground });
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
        this.reset();
    }

    reset() {
        this.steams = [];
        this.silencerZones = [];
        this.tileLayers = new Map();
        for (let i = 0; i < this.data.layerInstances.length; i++) {
            const layerInstance = this.data.layerInstances[i];
            if (layerInstance.__type === "Tiles") {
                const layer = new Tiles(this.game, layerInstance);
                this.tileLayers.set(layer.name, layer);
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
                        this.addSilencerZone(this.truck.gridPos.add(new Vec(2, 0)));
                    }
                }
            }
        }
        this.tileLayers.get("Ground").spritesheet = this.spritesheets.ground;
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
        const truck = this.truck;
        if (truck) {
            truck.pos = posToCoord(truck.gridPos.x, truck.gridPos.y, C.scale);
        }
        this.steams.forEach(steam => steam.update(timeElapsed));
        this.state.update(timeElapsed);
    }

    draw() {
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
            player.draw();
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
        }
        lightsContext.restore();
        context.restore();
    }

    turn() {
        this.steamTurn();
        this.state.turn();
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
}

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
    }

    turn() {
        this.level.state = new TurnStateTurn(this.level);
    }

    update(timeElapsed) {

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
        this.tiles = data.gridTiles.map(tileDef => tileDef.t);
        // console.log(this.tiles);
        this.spritesheet = null;
        // console.log(this.name);
    }

    draw() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const index = x + y * this.width;
                const sprite = this.spritesheet.sprites.get(this.tiles[index]);
                const coord = posToCoord(x, y, C.scale);
                //console.log(coord);
                sprite.scale = C.scale;
                // const pos = (new Vec(x * sprite.imageRect.width, y * sprite.imageRect.height)).scale(scale);
                //console.log(pos);
                //console.log(coord);
                // coord.x = Math.trunc(coord.x);
                // coord.y = Math.trunc(coord.y);
                this.game.engine.stamp(sprite, coord);
            }
        }
    }
}