/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Strum data
 * 
 * @interface IStrum
 */
interface IStrum {
    /**
     * Fret positioning for each string, with the top string being string 0 (the bass on a
     * Merlin). Values are 0,1,2,3,4,5,6,7 representing each fret and -1 if this string is
     * not played this time.
     * 
     * @type {number[]}
     * @memberOf IStrum
     */
    fretting:number[];
    /**
     * Time of the strum in the bar in millibar (1/1000 of bar)
     * 
     * @type {number}
     * @memberOf IStrum
     */
    time:number;
    /**
     * Label for the strum, if needed.
     * 
     * @type {string}
     * @memberOf IStrum
     */
    label:string;   
    /**
     * Is this to be displayed as a chord+label, or the individual notes
     * 
     * @type {boolean}
     * @memberOf IStrum
     */
    isChordDisplay:boolean;
    /**
     * Note length in millibars
     * 
     * @type {number}
     * @memberOf IStrum
     */
    length:number;
    toString(): string;
}
