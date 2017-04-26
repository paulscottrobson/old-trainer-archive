/// <reference path="../../lib/phaser.comments.d.ts"/>

class Strum implements IStrum {

    public static SILENT:number = -1;

    public fretting: number[];
    public time: number;
    public length:number;
    public label: string;
    public isChordDisplay: boolean;

    /**
     * Creates an instance of Strum.
     * 
     * @param {string} fretting Fretting of correct length in -47 format (see docs)
     * @param {number} time time of fretting in millibeats
     * @param {string} label label if chordal strum.
     * 
     * @memberOf Strum
     */
    constructor(fretting:string,time:number,label:string) {
        // Convert fretting to an array.
        this.fretting = [];
        for (var n = 0;n < fretting.length;n++) {
            this.fretting[n] = Strum.SILENT;
            if (fretting.charAt(n) != '-') {
                this.fretting[n] = fretting.charCodeAt(n) - 65;
            }
        }
        // Copy time and label information
        this.time = time;
        this.label = label;
        // Will be chord display if label is not blank
        this.isChordDisplay = (label != "");
        // Auto droning ?
        if (SeagullMerlinApplication.getURLName("drone","0") != "0") {
            for (var n = 0;n < this.fretting.length;n++) {
                if (this.fretting[n] != Strum.SILENT) {
                    for (var f = 0;f < n;f++) {
                        this.fretting[f] = 0;
                    }
                n = this.fretting.length;
                }
            }
        }
    }

    /**
     * Convert strum to displayable format.
     * 
     * @returns {string} 
     * 
     * @memberOf Strum
     */
    public toString(): string {
        var s = "";
        for (var n = 0;n < this.fretting.length;n++) {
            if (this.fretting[n] == Strum.SILENT) {
                s = s + "-";
            } else {
                s = s + this.fretting[n].toString();
            }
        }
        s = s + "@"+this.time.toString();
        if (this.isChordDisplay) {
            s = s + "("+this.label+")";
        }
        return s;
    }

    /**
     * Convert note of form C#4 to an index offset from C0.
     * 
     * @static
     * @param {string} note 
     * 
     * @memberOf Strum
     */
    public static convertNoteToIndex(note:string) {
        note = note.toUpperCase();
        var re:RegExp = /([A-Z]\#?)([1-5])/
        var res:RegExpExecArray = re.exec(note);
        return Strum.NOTENAMES.indexOf(res[1])+(parseInt(res[2])-1) * 12        
    }

    private static NOTENAMES:string[] = [
      "C","C#","D","D#","E","F","F#","G","G#","A","A#"
    ];
}