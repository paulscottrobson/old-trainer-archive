//// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * This draws the Fretboard Background
 * 
 * @class FretboardBackground
 * @extends {Background}
 */
class FretboardBackground extends Background {
    
    createBackground() : void {

        // Fretboard background
        var img:Phaser.Image = this.game.add.image(0,this.yCentre,"sprites","fretboard",this);        
        img.anchor.setTo(0,0.5);img.tint = 0x800000;
        img.height = this.yHeight;img.width = this.game.width;

        // Draw strings
        for (var str:number = 0;str < this.instrument.getVoices();str++) {
            // Figure out if doubled
            var isDouble:boolean = this.instrument.isDoubleString(str);
            // Create image and position it, set anchor and size.
            var s:Phaser.Image = this.game.add.image(0,this.getYString(str),
                                                     "sprites",
                                                     isDouble ? "mstring":"string",this);
                                                      
            s.anchor.setTo(0,0.5);s.width = this.game.width;            
            // Adjust for different graphics.
            s.height = this.game.height / (isDouble ? 64 : 192) * 130 / 100;
            // Change strings size dependent on tuning.
            s.height = s.height * (1.5 - this.instrument.getTuning()[str]/PreloadState.NOTE_COUNT);
            }
    }

    public getYString(str:number) {
        var y:number = this.yHeight*0.8*0.75;
        return y * str / (this.instrument.getVoices()-1) + this.yCentre - y / 2;
    }
}