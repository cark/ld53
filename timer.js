/**
 * Timer class for tracking time and duration.
 */
export class Timer {
    /**
     * Create a new Timer object.
     * @param {number} duration - The duration of the timer in seconds.
     * @param {number} [startAt=0.0] - The starting time of the timer in seconds. Defaults to 0.
     */
    constructor(duration, startAt) {
        /**
         * The current time of the timer in seconds.
         * @type {number}
         */
        this.time = startAt ? startAt : 0.0;

        /**
         * The duration of the timer in seconds.
         * @type {number}
         */
        this.duration = duration;
    }

    /**
     * Check if the timer has finished.
     * @returns {boolean} - True if the timer is done, false otherwise.
     */
    isDone() {
        return this.time >= this.duration;
    }

    /**
     * Update the timer with the elapsed time.
     * @param {number} timeElapsed - The elapsed time in seconds.
     */
    update(timeElapsed) {
        this.time += timeElapsed;
    }

    /**
     * Returns the amount of time by which this timer has exceeded its duration.
     * @returns {number} The excess time, in seconds.
     */
    excessTime() {
        return this.time - this.duration;
    }

    percentDone() {
        return this.time / this.duration;
    }

    /**
     * Reset the timer with a new duration and start time.
     * @param {number} [duration] - The new duration in seconds. If not provided, the current duration is used.
     * @param {number} [startAt] - The new start time in seconds. If not provided, the timer starts from 0.
     */
    reset(duration, startAt) {
        this.time = startAt ? startAt : 0.0;
        this.duration = duration ? duration : this.duration;
    }
}