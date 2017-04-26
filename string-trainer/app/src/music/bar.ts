/// <reference path="../../lib/phaser.comments.d.ts"/>

class Bar implements IBar {

    public beats: number;
    public barNumber: number;
    public strums: IStrum[];
    public count:number;

    /**
     * Creates an instance of a Bar, decoding the bar contents.
     * 
     * @param {number} barNumber Bar number indexed from 0
     * @param {number} voices Number of voices
     * @param {number} beatsDefault Number of beats
     * @param {string} strumData Bar descriptor (see JSON format documentation)
     * 
     * @memberOf Bar
     */

    constructor(barNumber:number,voices:number,beatsDefault:number,strumData:string) {
        // Basic values
        this.barNumber = barNumber;
        this.beats = beatsDefault;
        this.strums = [];
        this.count = 0;
        // Process strumdata
        var mbPosition:number = 0;
        var currentLabel:string = "";
        var p:number = 0;
        strumData = strumData.toUpperCase();
        // Work through whole string
        while (p < strumData.length) {
            var ch:number = strumData.charCodeAt(p);
            var processed:boolean = false;
            // - or 0-9 means new strum/pluck
            if (ch == 45 || (ch >= 65 && ch < 91)) {
                this.strums[this.count] = new Strum(strumData.slice(p,p+3),
                                                    mbPosition,currentLabel);
                this.count++;                                                    
                p = p + 3;                
                processed = true;                                    
            }
            // 1-8 advance quarterbeat position
            if (ch >= 49 && ch < 57) {
                mbPosition += 1000 / this.beats / 4 * (ch - 48);
                p = p + 1;
                processed = true;
            }
            // (label)
            if (ch == 40) {
                var p2:number = strumData.indexOf(")",p);
                if (p2 < 0) {
                    throw new SyntaxError("Missing ( in "+strumData);
                }
                currentLabel = strumData.slice(p+1,p2-1);
                p = p2+1;
                processed = true;
            }
            // error, not recognised.
            if (!processed) {
                throw new SyntaxError("Bar "+barNumber+" Error in "+strumData);
            }
        }
        for (var n = 0;n < this.count;n++) {
            if (n == this.count-1) {
                this.strums[n].length = 1000- this.strums[n].time;                
            } else {
                this.strums[n].length = this.strums[n+1].time - this.strums[n].time;
            }
        }
    }

    /**
     * Convert bar to displayable format.
     * 
     * @returns {string} 
     * 
     * @memberOf Bar
     */
    toString(): string {
        var s:string = "Bar "+this.barNumber+" { B:"+this.beats+" C:"+this.count;
        for (var strum of this.strums) { 
            s = s + " " + strum.toString();
        }
        return s+" }";
    }
}
