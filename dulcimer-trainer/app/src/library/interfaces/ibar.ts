/// <reference path="../../../lib/phaser.comments.d.ts"/>

interface IBar {
    /**
     * Notes in bar
     * 
     * @type {Note[]}
     * @memberOf Bar
     */
    note:INote[];
    /**
     * Type of notes in bar.
     * 
     * @type {number}
     * @memberOf Bar
     */
    count:number;
    /**
     * Reference to owning Music.
     * 
     * @type {Music}
     * @memberOf IBar
     */
    music:Music;

}