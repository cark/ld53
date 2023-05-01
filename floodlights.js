import { Timer } from "./timer";
import { Constants, Util } from "./util";
import { Vec } from "./vec";

export class Floodlights {
    constructor(level) {
        this.level = level;
        this.items = new Map();
    }

    ensureId(id) {
        const found = this.items.get(id);
        if (found) {
            return found;
        } else {
            const light = new FLoodlight(id, this.level);
            this.items.set(id, light);
            return light;
        }
    }

    addFromLdtk(entityInstance) {
        const fields = new Map();
        entityInstance.fieldInstances.forEach(field => fields.set(field.__identifier, field.__value));
        const fLoodlight = this.ensureId(fields.get("id"));
        const gridCoord = entityInstance.__grid;
        fLoodlight.waypoints[fields.get("order")] = new Vec(gridCoord[0], gridCoord[1]);
    }

    init() {
        this.items.forEach((v, k) => v.init());
    }

    update(elapsedTime) {
        this.items.forEach((v, k) => v.update(elapsedTime));
    }

    draw() {
        const engine = this.level.game.engine;
        engine.activateSurface("lights");
        this.items.forEach((v, k) => v.draw());
        engine.activateSurface("default");
    }

    turn() {
        this.items.forEach((v, k) => v.turn());
    }

    isInFloodLight(pos) {
        return Array.from(this.items.values()).some(light => light.isInLight(pos));
    }

}

export class FLoodlight {
    constructor(id, level) {
        this.id = id;
        this.level = level;
        this.waypoints = [];
        //this.waypointIndex = 0;
        this.targetWaypointIndex = 0;
        this.gridPos = null;
        this.pos = null;
        const engine = level.game.engine;
        this.sprite = engine.sprite("floodlight.png");
        this.sprite.alpha = 0.5;
        this.sprite.scale = new Vec(3, 3);
        this.state = null;
        //this.gridPos = this.waypoint[1];
    }

    nextWaypointIndex(index) {
        return (index + 1) % this.waypoints.length;
    }

    init() {
        this.gridPos = this.waypoints[this.targetWaypointIndex];
        //this.targetWaypointIndex = this.nextWaypointIndex(this.waypointIndex);
        this.state = new RestState(this);
    }

    update(elapsedTime) {
        this.state.update(elapsedTime);
    }

    draw() {
        if (this.pos) {
            const engine = this.level.game.engine;
            engine.stamp(this.sprite, this.pos, 0);
        }
    }

    turn() {
        this.state.turn();
    }

    isInLight(pos) {
        let result = this.pos.sub(pos).length() < 5;
        return result;
    }
}

class RestState {
    constructor(light) {
        this.light = light;
        this.update();
        // change target if we arrived
        if (this.light.gridPos.equals(this.light.waypoints[this.light.targetWaypointIndex])) {
            this.light.targetWaypointIndex = this.light.nextWaypointIndex(this.light.targetWaypointIndex);
        }
    }

    update(elapsedTime) {
        let gridPos = this.light.gridPos;
        this.light.pos = Util.posToCoord(gridPos.x, gridPos.y, Constants.scale);
    }

    turn() {
        let dest = this.light.waypoints[this.light.targetWaypointIndex];
        let delta = dest.add(this.light.gridPos.mul(-1)).normalize();
        this.light.state = new MoveState(this.light, this.light.gridPos.add(delta));

    }
}

class MoveState {
    constructor(light, targetGridPos) {
        this.light = light;
        this.timer = new Timer(Constants.turnDuration);
        this.targetGridPos = targetGridPos;
    }

    update(elapsedTime) {
        this.timer.update(elapsedTime);
        const gridPos = this.light.gridPos;
        if (this.timer.isDone()) {
            this.light.gridPos = this.targetGridPos;
            this.light.state = new RestState(this.light);
        } else {
            const start = Util.posToCoord(gridPos.x, gridPos.y, Constants.scale);
            const dest = Util.posToCoord(this.targetGridPos.x, this.targetGridPos.y, Constants.scale);
            this.light.pos = start.lerp(this.timer.percentDone(), dest);
        }
    }
}
