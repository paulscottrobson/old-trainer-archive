/// <reference path="../../../lib/phaser.comments.d.ts"/>

interface INote {
   /**
     * Chromatic offsets for each note.
     * 
     * @type {number[]}
     * @memberOf Note
     */
    chromaticOffset:number[];
    /**
     * Time of note/rest in millibeats
     * 
     * @type {number}
     * @memberOf Note
     */
    mbTime:number;
    /**
     * Length of note in millibeats
     * 
     * @type {number}
     * @memberOf Note
     */
    mbLength:number;
    /**
     * Offset position in quarterbeats
     * 
     * @type {number}
     * @memberOf Note
     */
    quarterBeatPos:number;
}