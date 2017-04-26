//// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * This draws the Ocarina Music Background
 * 
 * @class OcarinaBackground
 * @extends {Background}
 */
class OcarinaBackground extends Background {
    
    createBackground() : void {

        // Fretboard background
        var img:Phaser.Image = this.game.add.image(0,this.yCentre,"sprites","rectangle",this);        
        img.anchor.setTo(0,0.5);img.tint = 0xFFFFFF;
        img.height = this.yHeight;img.width = this.game.width;

        // Draw staves
        for (var stv:number = 0;stv < 5;stv++) {
            // Create image and position it, set anchor and size.
            var s:Phaser.Image = this.game.add.image(0,this.getYStave(stv),
                                                     "sprites","rectangle",this);

                                                      
            s.anchor.setTo(0,0.5);s.width = this.game.width;            
            // Adjust for different graphics.
            s.height = this.game.height / 128;s.tint = 0x000000;
        }
        // Treble Clef.
        img = this.game.add.image(0,this.getYStave(2),"sprites","treble",this);
        img.anchor.setTo(0.2,0.5);
        var sc:number = 1.6*(this.getYStave(4)-this.getYStave(0)) / img.height;
        img.scale.setTo(sc,sc);
    }

    /**
     * Get stave position
     * 
     * @param {number} str stave line (0 = top)
     * @returns y position of stave line.
     * 
     * @memberOf OcarinaMusicBackground
     */
    public getYStave(str:number) {
        var y:number = this.yHeight*0.6;
        return y * (str+1) / 6 + this.yCentre - this.yHeight / 2;
    }
}