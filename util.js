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