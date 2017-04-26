/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Data holding class for Notes.
 * 
 * @class Note
 */
class Note {
    /**
     * Chromatic offsets for each string top down (also can be NO_STRUM)
     * 
     * @type {number[]}
     * @memberOf Note
     */
    public chromaticOffsets:number[];
    /**
     * Note length
     * 
     * @type {number} length in millibars
     * @memberOf Note
     */
    public len:number;
    /**
     * Time in millibars
     * 
     * @type {number}
     * @memberOf Note
     */
    public time:number;
    /**
     * Chromatic value when Strum does not occur.
     * 
     * @static
     * @type {number}
     * @memberOf Note
     */
    public static NO_STRUM:number = -1;

    toString(): string {
        return  this.chromaticOffsets.join("-")+" @ "+
            this.time.toString()+" ["+this.len.toString()+"]";
    }
}

