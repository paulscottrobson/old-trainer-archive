/// <reference path="../../../lib/phaser.comments.d.ts"/>

interface IMusic {
    /**
     * Name of piece
     * 
     * @type {string}
     * @memberOf Music
     */
    name:string;
    /**
     * Author/Composer name
     * 
     * @type {string}
     * @memberOf Music
     */
    author:string;
    /**
     * Beats per bar
     * 
     * @type {number}
     * @memberOf Music
     */
    beats:number;
    /**
     * Beats per minute default speed.
     * 
     * @type {number}
     * @memberOf Music
     */
    beatsPerMinute:number;
    /**
     * Bar information
     * 
     * @type {Bar[]}
     * @memberOf Music
     */
    bar:Bar[];
    /**
     * Number of bars.
     * 
     * @type {number}
     * @memberOf Music
     */
    count:number;

    /**
     * Number of voices
     * 
     * @type {number}
     * @memberOf Music
     */
    voices:number;
    /**
     * Tuning information (dependent)
     * 
     * @type {string}
     * @memberOf Music
     */
    tuning:string;

    /**
     * True if instrument is Diatonic
     * 
     * @type {boolean}
     * @memberOf Music
     */
    isDiatonic:boolean;

    /**
     * Capo position. Note this position is a fret position, so for a diatonic this is a
     * diatonic offset not a chromatic one.
     * 
     * @type {number}
     * @memberOf Music
     */
    capo:number;

}