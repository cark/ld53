import { Vec } from "./vec.js";

export class Constants {
    static cellSize = new Vec(16, 16);
    static scale = new Vec(4, 4);
    static bodyScale = new Vec(2, 2);
    static turnDuration = 0.5;
}

export class Util {
    static remap(value, fromMin, fromMax, toMin, toMax) {
        // Calculate the percentage of the value between the input range
        const percentage = (value - fromMin) / (fromMax - fromMin);

        // Use the percentage to calculate the output value within the output range
        const output = percentage * (toMax - toMin) + toMin;

        return output;
    }

    static oneOf(values) {
        return values[Math.trunc(Math.random() * values.length)];
    }

    static lerp(t, start, end) {
        return start + t * (end - start);
    }

    static posToCoord(x, y, scale) {
        return (new Vec(x * Constants.cellSize.x, y * Constants.cellSize.y)).scale(scale);
    }
}

export function assert(value) {
    if (!value) {
        throw new Error("assertion failed");
    }
}

function testRemap() {
    assert(Util.remap(0, 0, 1, 3, 5) == 3);
    assert(Util.remap(0.5, 0, 1, 3, 5) == 4);
    assert(Util.remap(1, 0, 1, 3, 5) == 5);
}

// testRemap()