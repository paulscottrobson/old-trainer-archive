/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * A sequence is effectively a "tune".
 * 
 * @interface ISequence
 */

interface ISequence {
    /**
     * Get the length of the sequence
     * 
     * @returns {number} 
     * 
     * @memberOf ISequence
     */
    getSequenceSize(): number;

    /**
     * Get subitem within sequence
     * 
     * @param {number} index 
     * @returns {IRoll} 
     * 
     * @memberOf ISequence
     */
    getSequenceRoll(index:number): IRoll;
}