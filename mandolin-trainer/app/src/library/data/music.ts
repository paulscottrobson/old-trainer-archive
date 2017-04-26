/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Class encapsulating a piece of music.
 * 
 * @class Music
 */
class Music {
    /**
     * Name of piece
     * 
     * @type {string}
     * @memberOf Music
     */
    public name:string;
    /**
     * Author/Composer name
     * 
     * @type {string}
     * @memberOf Music
     */
    public author:string;
    /**
     * Beats per bar
     * 
     * @type {number}
     * @memberOf Music
     */
    public beats:number;
    /**
     * Beats per minute default speed.
     * 
     * @type {number}
     * @memberOf Music
     */
    public beatsPerMinute:number;
    /**
     * Bar information
     * 
     * @type {Bar[]}
     * @memberOf Music
     */
    public bar:Bar[];
    /**
     * Number of bars.
     * 
     * @type {number}
     * @memberOf Music
     */
    public count:number;

    /**
     * Number of voices
     * 
     * @type {number}
     * @memberOf Music
     */
    public voices:number;
    /**
     * Tuning information (dependent)
     * 
     * @type {string}
     * @memberOf Music
     */
    public tuning:string;

    /**
     * True if instrument is Diatonic
     * 
     * @type {boolean}
     * @memberOf Music
     */
    public isDiatonic:boolean;

    /**
     * Capo position. Note this position is a fret position, so for a diatonic this is a
     * diatonic offset not a chromatic one.
     * 
     * @type {number}
     * @memberOf Music
     */
    public capo:number;

    /**
     * Load a JSON object into a new music structure
     * @param {Object} data json data representing the music.
     * 
     * @memberOf Music
     */
    constructor(data:Object) {
        // Copy data into obkect
        this.name = data["name"]||"(unknown)";
        this.author = data["author"]||"(unknown)";
        this.beats = parseInt(data["beats"]||"4",10);
        this.beatsPerMinute = parseInt(data["speed"]||"120",10);
        this.voices = parseInt(data["voices"]||"3",10);
        this.tuning = (data["tuning"]||"").toLowerCase();
        this.isDiatonic = (parseInt(data["diatonic"],10)||0) != 0;
        this.capo = parseInt(data["capo"]||"0",10);
        // Initialise bars
        this.bar = [];
        this.count = 0;
        // Load each bar in in turn.
        for (var barDef of data["bars"]) {
            var b:Bar = MusicClassFactory.createBar(this,this.count,this.beats);
            b.load(barDef);
            this.bar[this.count] = b;
            this.count++;
        }    
        console.log(this.bar[0]);
    }
}