//// <reference path="../../lib/phaser.comments.d.ts"/>
//// <reference path="./baserenderer.ts"

/**
 * Rendering the fretboard notes.
 * 
 * @class FretboardBarRenderer
 * @extends {BaseRenderer}
 */
class FretboardBarRenderer extends BaseRenderer {

    private noteBoxes:Phaser.Image[];
    private noteText:Phaser.BitmapText[];
    private barMarker:Phaser.Image;

    protected initialiseRenderer(): void {
        this.noteBoxes = [];
        this.noteText = [];
    }

    protected terminateRenderer(): void {
        this.noteBoxes = this.noteText = null;        
    }
    protected renderDrawBarFrame(bar:Bar) : void {
        this.barMarker = this.game.add.image(0,0,"sprites","bar",this);
        this.barMarker.anchor.setTo(0.5,0.5);
        this.barMarker.width = this.xWidth / 40;
        this.barMarker.height = this.yHeight * 0.8;
    }

    protected renderEraseBarFrame(bar:Bar) : void {
        this.barMarker.destroy();
        this.barMarker = null;
    }

    protected renderMoveBarFrame(bar:Bar,xPos:number) : void {  
        this.barMarker.position.setTo(xPos,this.yCentre);
    }

    private static _colours:number[] = [ 0xFF0000,0x00FF00,0x0040FF,0xFFFF00,0x00FFFF,0xFF00FF,0xFF8000,
                                         0x808080,0xFFFFFF,0x8B4513 ];

    protected renderDrawBarNote(bar:Bar,note:Note) : void {  
        var fbr:FretboardBackground = <FretboardBackground>this.background;
        // For each voice
        for (var n:number = 0;n < this.instrument.getVoices();n++) {
            // If not a rest
            if (note.chromaticOffsets[n] != Note.NO_STRUM) {
                var ix:number = this.getItemIndex(note.time,n);
                // Create the button
                var box:Phaser.Image = this.game.add.image(0,0,"sprites","notebutton",this);
                this.noteBoxes[ix] = box;
                box.anchor.setTo(0.5,0.5);
                // Work out a best fit
                var xsc:number = (this.xWidth / 8) / box.width;
                var ysc:number = (fbr.getYString(1)-fbr.getYString(0)) / box.height;
                box.scale.setTo(Math.min(xsc,ysc))
                // Tint it
                var colNo:number = note.chromaticOffsets[n] % FretboardBarRenderer._colours.length;
                box.tint = FretboardBarRenderer._colours[colNo];
                // Create a note text.
                var noteText:string = this.instrument.getDisplayedFretForChromatic(note.chromaticOffsets[n]);
                var txt:Phaser.BitmapText = this.game.add.bitmapText(0,0,"font",noteText,
                                                                    this.xWidth/13,this);
                this.noteText[ix] = txt;
                txt.anchor.setTo(0.5,0.5);txt.tint = 0xFFFFFF;
            }
        }
    }

    protected renderEraseBarNote(bar:Bar,note:Note) : void {  
        for (var n:number = 0;n < this.instrument.getVoices();n++) {
            var ix:number = this.getItemIndex(note.time,n);
            if (note.chromaticOffsets[n] != Note.NO_STRUM) {
                this.noteBoxes[ix].destroy();
                this.noteBoxes[ix] = null;
                this.noteText[ix].destroy();
                this.noteText[ix] = null;
            }
        }
    }

    protected renderMoveBarNote(bar:Bar,note:Note,xPos:number) : void {  
        var fbr:FretboardBackground = <FretboardBackground>this.background;
        for (var n:number = 0;n < this.instrument.getVoices();n++) {
            var ix:number = this.getItemIndex(note.time,n);
            if (note.chromaticOffsets[n] != Note.NO_STRUM) {
                this.noteBoxes[ix].position.setTo(Math.floor(xPos+note.time*this.xWidth / 1000),
                                                  fbr.getYString(n));            
                this.noteText[ix].x = this.noteBoxes[ix].x;                                              
                this.noteText[ix].y = this.noteBoxes[ix].y;                                              
            }                
        }
    }

    /**
     * Creates unique array index from time and string number to be used as an 
     * index in the various arrays.
     * 
     * @private
     * @param {number} time 
     * @param {number} str 
     * @returns 
     * 
     * @memberOf FretboardBarRenderer
     */
    private getItemIndex(time:number,str:number) {
        return time * 100 + str;
    }
}