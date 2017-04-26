/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Note class
 * 
 * @class Note
 */
class Note {
    /**
     * Chromatic offsets for each note.
     * 
     * @type {number[]}
     * @memberOf Note
     */
    public chromaticOffset:number[];
    /**
     * Offset position in quarterbeats
     * 
     * @type {number}
     * @memberOf Note
     */
    public quarterBeatPos:number;
    /**
     * Time of note/rest in millibeats
     * 
     * @type {number}
     * @memberOf Note
     */
    public mbTime:number;
    /**
     * Length of note in millibeats
     * 
     * @type {number}
     * @memberOf Note
     */
    public mbLength:number;
    
    public static QUIET:number = -1;

    constructor() {
        this.chromaticOffset = [];
    }

    toString() : string {
        var s = "";
        for (var n = 0;n < this.chromaticOffset.length;n++) {
            s = s + this.chromaticOffset[n] + ":";
        }
        s = s + "@ "+this.mbTime.toString();
        return s;
    }
}