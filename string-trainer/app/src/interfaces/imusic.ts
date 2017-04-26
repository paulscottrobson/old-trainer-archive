/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Additional information that can be retrieved
 * 
 * @enum {number}
 */
enum InformationType {
    TITLE, AUTHOR
}


/**
 * Interface to a single piece of music.
 * 
 * @interface IMusic
 */

interface IMusic {
    /**
     * Get the default tempo in beats/minute
     * 
     * @returns {number} 
     * 
     * @memberOf IMusic
     */
    getTempo(): number;
    /**
     * Get the standard number of beats in a bar. Bars should be 'subdivided'
     * individually using their beats method. It does happen (see Lucy in the Sky with Diamonds)
     * 
     * @returns {number} 
     * 
     * @memberOf IMusic
     */
    getStandardBeats(): number;
    /**
     * Get the number of bars
     * 
     * @returns {number} 
     * 
     * @memberOf IMusic
     */
    getBarCount(): number;
    /**
     * Get a reference to a bar
     * 
     * @param {number} barNumber 
     * @returns {IBar} 
     * 
     * @memberOf IMusic
     */
    getBar(barNumber:number):  IBar;
    /**
     * Get any additional information as required.
     * 
     * @param {InformationType} info 
     * @returns {string} 
     * 
     * @memberOf IMusic
     */
    getInformation(info:InformationType):string;
}
