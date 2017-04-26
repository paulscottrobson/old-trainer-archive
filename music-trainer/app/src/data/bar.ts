//// <reference path="../../lib/phaser.comments.d.ts"/>

class Bar {

    public  barNumber:number;
    public  music:Music;
    public  note:Note[];
    public  count:number;

    /**
     * Creates an instance of Bar.
     * @param {number} barNumber Bar number
     * @param {Music} music Music object that owns it.
     * 
     * @memberOf Bar
     */
    constructor(barNumber:number,music:Music) {
        this.barNumber = barNumber;
        this.music = music;
        this.note = [];
        this.count = 0;
    }

    /**
     * Decode a bar definition for a single bar
     * 
     * @param {string} barDef  see formats documentation
     * 
     * @memberOf Bar
     */
    decode(barDef:string) : void {
        //console.log(this.barNumber,barDef);
        var p:number = 0;
        var barPosition:number = 0;
        while (p < barDef.length) {
            var cc:number = barDef.charCodeAt(p);
            // if 0..9 step forward that many quarter bars.
            if (cc >= 48 && cc < 58) {
                barPosition = barPosition + 1000 / this.music.beats * (cc - 48) / 4;
                p++;
            } else {
                // Build up a new note.
                var note:Note = new Note();
                note.chromaticOffsets = [];
                note.time = barPosition;
                note.len = 0;
                for (var n = 0;n < this.music.voices;n++) {
                    cc = barDef.charCodeAt(p);
                    p = p + 1;
                    // Code is A-Z
                    if (cc >= 65 && cc <= 90) {
                        note.chromaticOffsets.push(cc - 65);
                    } else {
                        // Code is '-' (rest)
                        if (cc != 45) {
                            console.log("WARN: Syntax "+barDef);
                        }
                        note.chromaticOffsets.push(Note.NO_STRUM);
                    }
                }
                this.note.push(note);
                this.count++;
            }
        }
        // Go back and calculate the note lengths.
        for (var n:number = 0;n < this.count;n++) {
            this.note[n].len = (n != this.count-1 ? 
                                this.note[n+1].time : 1000) 
                                            - this.note[n].time;
        }
    }
}