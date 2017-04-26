//// <reference path="../../lib/phaser.comments.d.ts"/>

class Music {

    /**
     * Bars in music, indexed from zero.
     * 
     * @type {Bar[]}
     * @memberOf Music
     */
    public bar:Bar[];
    /**
     * Number of bars
     * 
     * @type {number}
     * @memberOf Music
     */
    public count:number;
    /**
     * Beats in a bar
     * 
     * @type {number}
     * @memberOf Music
     */
    public beats:number;
    /**
     * Instrument definition
     * 
     * @type {BaseInstrument}
     * @memberOf Music
     */
    public instrument:BaseInstrument;
    /**
     * Number of voices/strings
     * 
     * @type {number}
     * @memberOf Music
     */
    public voices:number;
    /**
     * Composition name
     * 
     * @type {string}
     * @memberOf Music
     */
    public musicName:string;
    /**
     * Composers name
     * 
     * @type {string}
     * @memberOf Music
     */
    public authorName:string;
    /**
     * Instrument name
     * 
     * @type {string}
     * @memberOf Music
     */
    public instrumentName:string;
    /**
     * Music speed in beats/minute, default value
     * 
     * @type {number}
     * @memberOf Music
     */
    public beatsPerMinute:number;
    
    private type:string;

    /**
     * Creates an instance of Music.
     * 
     * @memberOf Music
     */
    constructor() {
        this.bar = [];
        this.count = 0;
        this.beats = -1;
        this.type = null;
    }

    /**
     * Load a JSON music definition in
     * 
     * @param {Object} json JSON object.
     * 
     * @memberOf Music
     */
    load(json:Object) : void {
        // Fetch data from JSON
        this.beats = parseInt(json["beats"]);
        this.type = json["type"];
        this.musicName = json["name"] || "";
        this.authorName = json["author"] || "";
        this.instrumentName = json["instrument"] || "";
        this.beatsPerMinute = parseInt(json["speed"]);
        // Get instrument type
        this.instrument = InstrumentFactory.get(this.type);
        // Get the number of strings/voices.
        this.voices = this.instrument.getVoices();
        // Load Bars in.
        for (var bDef of json["bars"]) {
            var bar:Bar = new Bar(this.count,this);
            bar.decode(bDef);
            this.bar.push(bar);
            this.count ++;
        }
    }
}


