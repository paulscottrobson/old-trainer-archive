/// <reference path="../../../lib/phaser.comments.d.ts"/>

abstract class Bar {
    /**
     * Notes in bar
     * 
     * @type {Note[]}
     * @memberOf Bar
     */
    public note:Note[];
    /**
     * Type of notes in bar.
     * 
     * @type {number}
     * @memberOf Bar
     */
    public count:number;

    protected barNumber:number;
    protected beats:number;
    public music:Music;

    constructor(music:Music,barNumber:number,beats:number) {
        this.note = [];
        this.count = 0;
        this.barNumber = barNumber;
        this.beats = beats;
        this.music = music;
    }

    /**
     * Load bar definition into Bar structure.
     * 
     * @param {string} defn 
     * 
     * @memberOf Bar
     */
    abstract load(defn:string) : void;

    /**
     * Calculate millibeat positions and lengths of note from quarterBeat Positions.
     * 
     * @protected
     * 
     * @memberOf Bar
     */
    protected updateMillibeatData() : void {
        if (this.count > 0) {
            for (var n:number = 0;n < this.count;n++) {
                this.note[n].mbTime = Math.floor(1000 / this.beats / 4 * this.note[n].quarterBeatPos);
            }
            for (var n:number = 0;n < this.count-1;n++) {
                this.note[n].mbLength = this.note[n+1].mbTime - this.note[n].mbTime;
            }
            this.note[this.count-1].mbLength = 1000 - this.note[this.count-1].mbTime;
        }
    }
}