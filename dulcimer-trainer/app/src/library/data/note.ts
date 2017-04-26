/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Note class
 * 
 * @class Note
 */
class Note implements INote {

    public chromaticOffset:number[];
    public quarterBeatPos:number;
    public mbTime:number;
    public mbLength:number;
    
    public static QUIET:number = -1;

    constructor() {
        this.chromaticOffset = [];
    }

    toString() : string {
        var s = "";
        for (var n = 0;n < this.chromaticOffset.length;n++) {
            s = s + this.chromaticOffset[n] + ":";
        }
        s = s + "@ "+this.mbTime.toString();
        return s;
    }
}