/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Representing a single bar.
 * 
 * @interface IBar
 */
interface IBar {
    /**
     * Number of beats in this particular bar. 
     * 
     * @type {number}
     * @memberOf IBar
     */
    beats:number;
    /**
     * Number of the bar, indexed from zero.
     * 
     * @type {number}
     * @memberOf IBar
     */
    barNumber:number;
    /**
     * Strums in each bar.
     * 
     * @type {IStrum[]}
     * @memberOf IBar
     */
    strums:IStrum[];
    /**
     * Number of strums in bar
     * 
     * @type {number}
     * @memberOf IBar
     */
    count:number;
    /**
     * Convert bar to string.
     * 
     * @returns {string} 
     * 
     * @memberOf IBar
     */
    toString(): string;
}