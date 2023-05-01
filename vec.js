// import { Util } from "./util";

/**
 * A class representing a two-dimensional vector.
 * @class
 */
export class Vec {
    /**
     * Creates a new Vec object.
     * @constructor
     * @param {number} x - The x-component of the vector.
     * @param {number} y - The y-component of the vector.
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Returns a new vector representing the result of adding another vector to this vector.
     * @param {Vec} otherVec - The vector to add to this vector.
     * @returns {Vec} A new vector representing the result of the addition.
     */
    add(otherVec) {
        return new Vec(this.x + otherVec.x, this.y + otherVec.y);
    }

    /**
     * Returns a new vector representing the result of multiplying this vector by a scalar value.
     * @param {number} number - The scalar value to multiply this vector by.
     * @returns {Vec} A new vector representing the result of the multiplication.
     */
    mul(number) {
        return new Vec(this.x * number, this.y * number);
    }

    /**
     * Returns the length of this vector.
     * @returns {number} The length of this vector.
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /**
     * Returns the squared length of this vector.
     * @returns {number} The squared length of this vector.
     */
    squareLength() {
        return this.x * this.x + this.y * this.y;
    }

    /**
     * Returns a new vector representing the normalized version of this vector.
     * @returns {Vec} A new vector representing the normalized version of this vector.
     */
    normalize() {
        if (this.x === 0 && this.y === 0) return this;
        const invLength = 1 / this.length();
        return new Vec(this.x * invLength, this.y * invLength);
    }

    scale(otherVec) {
        return new Vec(this.x * otherVec.x, this.y * otherVec.y);
    }

    lerp(t, toVec) {
        return new Vec(lerp(t, this.x, toVec.x), lerp(t, this.y, toVec.y));
    }

    equals(toVec) {
        return this.x == toVec.x && this.y == toVec.y;
    }

    /**
     * A Vec representing a zero vector.
     * @static
     * @type {Vec}
     */
    static ZERO = new Vec(0.0, 0.0);

    /**
     * A Vec representing an up vector.
     * @static
     * @type {Vec}
     */
    static UP = new Vec(0.0, -1.0);

    /**
     * A Vec representing a down vector.
     * @static
     * @type {Vec}
     */
    static DOWN = new Vec(0.0, 1.0);

    /**
     * A Vec representing a right vector.
     * @static
     * @type {Vec}
     */
    static RIGHT = new Vec(1.0, 0.0);

    /**
     * A Vec representing a left vector.
     * @static
     * @type {Vec}
     */
    static LEFT = new Vec(-1.0, 0.0);
}

function lerp(t, start, end) {
    return start + t * (end - start);
}