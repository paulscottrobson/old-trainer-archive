/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * Enumerated type, fingers that can pluck.
 * 
 * @enum {number}
 */
enum Finger {
    THUMB = 0,
    INDEX = 1,
    MIDDLE = 2
}

/**
 * This represents a single pluck.
 * 
 * @class Pluck
 */
class Pluck {
    /**
     * The finger used to play the note.
     * 
     * @type {Finger}
     * @memberOf Pluck
     */
    public finger:Finger;
    /**
     * The string to play. Note the top string on TAB is the 'G' and is index number 0.
     * 
     * @type {number}
     * @memberOf Pluck
     */
    public stringID:number;

    /**
     * Creates an instance of Pluck.
     * @param {number} stringID 
     * @param {Finger} finger 
     * 
     * @memberOf Pluck
     */
    constructor (stringID:number,finger:Finger) {
        this.stringID = stringID;
        this.finger = finger;
    }

    /**
     * Get the name of a finger, in lower case.
     * 
     * @param {Finger} finger 
     * @returns 
     * 
     * @memberOf Pluck
     */
    getName(finger:Finger) {
        if (finger == Finger.THUMB) return "thumb";
        if (finger == Finger.INDEX) return "index";
        if (finger == Finger.MIDDLE) return "middle";
        return "???";
    }

    /**
     * Get the letter name of a finger, in lower case
     * 
     * @param {Finger} finger 
     * @returns 
     * 
     * @memberOf Pluck
     */
    getLetter(finger:Finger) {
        return this.getName(finger).charAt(0);
    }
}
