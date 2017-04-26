//// <reference path="../../lib/phaser.comments.d.ts"/>
//// <reference path="./baserenderer.ts"


class OcarinaDisplayStorage {
    displayNote:Phaser.Image;
    sharpNote:Phaser.Image;
    barLines:Phaser.Image[];
}

/**
 * Class responsible for rendering Ocarina bars
 * 
 * @class OcarinaBarRenderer
 * @extends {BaseRenderer}
 */
class OcarinaBarRenderer extends BaseRenderer {

    private info:OcarinaDisplayStorage[];
    private barMarker:Phaser.Image;

    protected initialiseRenderer(): void {
        this.info = [];
    }

    protected terminateRenderer(): void {
        this.info = null;
    }
    protected renderDrawBarFrame(bar:Bar) : void {
        var obr:OcarinaBackground = <OcarinaBackground>this.background;        
        this.barMarker = this.game.add.image(0,0,"sprites","bar",this);
        this.barMarker.anchor.setTo(0.5,0);
        this.barMarker.width = this.xWidth / 40;
        this.barMarker.height = obr.getYStave(4)-obr.getYStave(0);
    }

    protected renderEraseBarFrame(bar:Bar) : void {
        this.barMarker.destroy();
        this.barMarker = null;
    }

    protected renderMoveBarFrame(bar:Bar,xPos:number) : void {  
        var obr:OcarinaBackground = <OcarinaBackground>this.background;
        this.barMarker.position.setTo(xPos,obr.getYStave(0));
    }

    protected renderDrawBarNote(bar:Bar,note:Note) : void {  
        var obr:OcarinaBackground = <OcarinaBackground>this.background;
        this.info[note.time] = new OcarinaDisplayStorage();
        var info:OcarinaDisplayStorage = this.info[note.time];

        // Figure out note position on stave and if sharp
        var pos:number = this.convertToStavePosition(note.chromaticOffsets[0]);
        var hasSharp:boolean = Math.floor(pos) !== pos;
        pos = 4 - (Math.floor(pos) / 2 - 2);

        // add note graphic
        var dnote:Phaser.Image = this.game.add.image(0,obr.getYStave(pos),"notes",0,this);
        info.displayNote = dnote;dnote.anchor.setTo(0.5,0.5);
        dnote.scale.setTo(this.xWidth / 400 *(obr.getYStave(4)-obr.getYStave(0)) / dnote.height);

        // Adjust if sharp.
        if (hasSharp) {
            var shp:Phaser.Image = this.game.add.image(0,dnote.y,"sprites","sharp",this);
            shp.anchor.setTo(0.5,0.5);shp.scale.setTo(dnote.height/shp.height*0.23);
            info.sharpNote = shp;
        }

        // Add lines if below stave
        if (pos >= 5) {
            info.barLines = [];
            for (var l:number = 0;l < ((pos == 6) ? 2 : 1) ; l++) {
                info.barLines[l] = this.game.add.image(0,obr.getYStave(l+5),"sprites","rectangle",this);
                info.barLines[l].width = this.xWidth * 0.1;
                info.barLines[l].height = this.yHeight / 60;
                info.barLines[l].anchor.setTo(0.5);
                info.barLines[l].tint = 0x000000;
            }
        }
        // Handle note length.
        if (note.chromaticOffsets[0] == Note.NO_STRUM) {
            // Rest
            dnote.frame = (note.len >= Math.floor(1000/bar.music.beats)) ? 5 : 2;
        } else {
            // Get frame to use.
            var frame:number = this.getNoteGraphic(note.len/1000*bar.music.beats) * 3;
            // Flip if higher than B
            if (pos <= 2) { frame++; }
            dnote.frame = frame;
        }
        
    }

    protected renderEraseBarNote(bar:Bar,note:Note) : void {  
        var info:OcarinaDisplayStorage = this.info[note.time];
        info.displayNote.destroy();
        if (info.sharpNote != null) { info.sharpNote.destroy(); }
        if (info.barLines != null) {
            for (var bl of info.barLines) { bl.destroy();}
        }
        this.info[note.time] = null;
    }

    protected renderMoveBarNote(bar:Bar,note:Note,xPos:number) : void {  
        var obr:OcarinaBackground = <OcarinaBackground>this.background;
        var info:OcarinaDisplayStorage = this.info[note.time];
        info.displayNote.x = xPos + note.time * this.xWidth / 1000;
        if (info.sharpNote != null) {
            info.sharpNote.x = info.displayNote.x - info.displayNote.width*0.18;
        }
        if (info.barLines != null) {
            for (var bl of info.barLines) { bl.x = info.displayNote.x; }
        }
    }

    //
    // Starting with A = 0, for each chromatic value give a half step count
    // (in the whole value), 0.5 indicates sharp.
    //
    private static A_BASED_TO_POSITION:number [] = [
        0,                  // A 
        0.5,                // A#
        1,                  // B 
        2,                  // C 
        2.5,                // C#
        3,                  // D
        3.5,                // D# 
        4,                  // E 
        5,                  // F 
        5.5,                // F# 
        6,                  // G 
        6.5                   // G#
    ];

    /**
     * Convert a chromatic note to a stave position
     * 
     * @private
     * @param {number} chrom 
     * @returns {number} 
     * 
     * @memberOf OcarinaBarRenderer
     */
    private convertToStavePosition(chrom:number): number {
        if (chrom == Note.NO_STRUM) { return 8; }
        var n: number = OcarinaBarRenderer.A_BASED_TO_POSITION[chrom % 12];
        return n + Math.floor(chrom / 12) * 7;
    }
    
    /**
     * Convert note lengths in 1/4 beats to frame numbers
     * 
     * @private
     * @static
     * @type {number[]}
     * @memberOf OcarinaBarRenderer
     */
    private static QUARTER_TO_FRAME:number[] = [
        0,0,1,2,            // 0-1
        3,3,4,4,            // 1-2
        5,5,5,5,            // 2-3
        6,6,6,6,            // 3-4
        7                   // 4+
    ];

    /**
     * Get note graphic for length in beats
     * 
     * @param {number} beats 
     * @returns {number} 
     * 
     * @memberOf OcarinaBarRenderer
     */
    getNoteGraphic(beats:number) : number {
        return OcarinaBarRenderer.QUARTER_TO_FRAME[Math.min(16,Math.round(beats*4))];
    }
}