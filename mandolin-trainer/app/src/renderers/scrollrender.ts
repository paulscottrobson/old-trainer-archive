/// <reference path="../../lib/phaser.comments.d.ts"/>

class HorizontalScrollRenderer extends Phaser.Group {
    private rWidth:number;
    private rHeight:number;
    private bar:Bar;
    private currentSinePos:number;
    private curveHeight:number;
    private music:Music;

    constructor(game:Phaser.Game,bar:Bar,music:Music,width:number,height:number) {
        super(game);
        this.rWidth = width;this.rHeight = height;this.bar = bar;
        this.music = music;
        this.curveHeight = 0.3 * this.rHeight;
        this.renderBar();
    }

    private static COLOURS:number[] = [
        0x0000FF,0x00FF00,0xFF0000,0x008080,0x808000,0xFF8000,0x808080,
        0xFF00FF,0x800000,0x808000,0x008040,0xA03030,0x80FF00,0xFFC0D0
    ];

    /**
     * Render the whole bar.
     * 
     * @private
     * 
     * @memberOf HorizontalScrollRenderer
     */
    private renderBar(): void {
        // Background
        var bgr:Phaser.Image = this.game.add.image(0,0,"sprites","rectangle",this);
        bgr.width = this.rWidth;bgr.height = this.rHeight*0.9;bgr.tint = 0x303030;
        var bgr2:Phaser.Image = this.game.add.image(0,bgr.bottom,"sprites","rectangle",this);
        bgr2.height = this.rHeight-bgr.height;bgr2.width = this.width;bgr2.tint = 0x000000;
        // Bars and beat seperators.
        for (var n:number = 0;n <= this.music.beats;n++) {
            var vbr:Phaser.Image = this.game.add.image(this.rWidth * n / this.music.beats,0,
                                                       "sprites","rectangle",this);
            vbr.width = Math.max(2,this.rWidth / 128);vbr.height = bgr.height;vbr.tint = 0x00000;
            vbr.anchor.setTo(0.5,0);
            if (n == 0 || n == this.music.beats) {
                vbr.tint = 0xFFD700;vbr.width *= 2;
                vbr.anchor.setTo(n == 0 ? 0 : 1,0);
            }
        }
        // Strings. Special code for the Dulcimer.
        var c:number = (this.music.voices == 3) ? 4 : this.music.voices;
        for (var s:number = 0;s < c;s++) {
            var str:Phaser.Image = this.game.add.image(0,this.yString(s),"sprites","rectangle",this);
            str.width = this.rWidth;str.anchor.setTo(0,0.5);str.tint = 0xE0DFDB;
            // Scale the strings to the back except for three string instruments.
            if (this.music.voices != 3) {
                str.height = this.rHeight / 64 + s; 
            } else {
                str.height = this.rHeight / 64 + (this.music.voices-s);
                if (s == 3) {
                    str.y = this.yString(2)-str.height*2;
                    str.height += 2;
                }
            }
            var ss:Phaser.Image = this.game.add.image(0,str.bottom,"sprites","rectangle",this);
            ss.width = this.rWidth;ss.height = this.rHeight/128;ss.tint = 0x000000;
        }
        if (this.bar != null) {
            this.drawNotes();
        }
        // Debug frame
        var dbg:Phaser.Image = this.game.add.image(0,0,"sprites","frame",this);
        dbg.width = this.rWidth;dbg.height = this.rHeight;dbg.tint = 0xFF8000;dbg.alpha = 0.3;
    }

    private drawNotes(): void {
        // Draw the notes.
        var hPix:number = 0.7*Math.abs(this.yString(0)-this.yString(1));
        // These are the aspect ratios of the rounded rectangles.
        var rrSizes:number[] = [ 102/50,124/50, 152/50, 183/50, 199/50, 75/50, 50/50,250/50 ];
        // current note position for sinecurves.
        this.currentSinePos = 0;
        for (var note of this.bar.note) {
            this.drawSineCurveTo(note.mbTime);
            for (var strn:number = 0;strn < this.music.voices;strn++) {
                if (note.chromaticOffset[strn] != Note.QUIET) {
                    // Note width
                    var wPix:number = note.mbLength * this.rWidth / 1000;
                    // Work out the best image to use from the rounded rectangles
                    var best:number = 2;
                    var nearest:number = 42;
                    for (var i:number = 0;i < rrSizes.length;i++) {
                        if (Math.abs(rrSizes[i] - wPix/hPix) < nearest) {
                            best = i;nearest = Math.abs(rrSizes[i]-wPix/hPix);
                        }
                    }
                    // Create rounded rectangle
                    var nbar:Phaser.Image = this.game.add.image(note.mbTime * this.rWidth / 1000,
                                                                this.yString(strn),
                                                                "sprites","rr"+(best+1),this);
                    nbar.height = hPix;nbar.width = wPix;                                                                
                    nbar.anchor.setTo(0,0.66);     
                    nbar.tint = HorizontalScrollRenderer.COLOURS[note.chromaticOffset[strn] % HorizontalScrollRenderer.COLOURS.length];
                    var n:number = note.chromaticOffset[strn];
                    if (this.music.isDiatonic) {
                        n = this.convertToDiatonicFretting(n);
                    }
                    var s1:string = Math.floor(n).toString() + ((n == Math.floor(n)) ? "":"+");
                    // Put text therein.
                    var txt:Phaser.BitmapText = this.game.add.bitmapText(nbar.x+wPix*0.5,nbar.y,
                                                                        "font",s1,hPix*0.56,this);               
                    txt.anchor.setTo(0.5,0.65);
                    txt.tint = 0xFFFFFF;
                }
            }
        }
        this.drawSineCurveTo(1000);
    }

    /**
     * Table converting chromatic to frets
     * 
     * @private
     * @static
     * @type {number[]}
     * @memberOf HorizontalScrollRenderer
     */
    private static FRETTING: number[] = [
        0,  0.5,1,  1.5,2,  3,  3.5,4,  4.5,5,  6,  6.5
    //  D   D#  E   F   F#  G   G#  A   A#  B   C   C#
    ];

    /**
     * Convert chromatic offset to fret number.
     * 
     * @private
     * @param {number} n 
     * @returns {number} 
     * 
     * @memberOf HorizontalScrollRenderer
     */
    private convertToDiatonicFretting(n:number): number {
        return Math.floor(n/12) * 7 + HorizontalScrollRenderer.FRETTING[n % 12];
    }
    /**
     * Draw sine curve from current pos to here. Rejected if very small.
     * 
     * @private
     * @param {number} mbPos 
     * 
     * @memberOf HorizontalScrollRenderer
     */
    private drawSineCurveTo(mbPos:number) : void {
        if (Math.abs(mbPos-this.currentSinePos) > 20) {
            var crv:Phaser.Image = this.game.add.image(this.currentSinePos * this.rWidth / 1000,
                                                       this.getBounceY(),
                                                      "sprites",
                                                      mbPos-this.currentSinePos > 200 ? "sinecurve_wide":"sinecurve",
                                                      this);
            crv.width = (mbPos - this.currentSinePos) * this.rWidth / 1000;
            crv.height = this.curveHeight;
            crv.anchor.setTo(0,1);                                                      
        }
        this.currentSinePos = mbPos;
    }

    /**
     * Vertical position of string
     * 
     * @private
     * @param {number} s 
     * @returns {number} 
     * 
     * @memberOf HorizontalScrollRenderer
     */
    private yString(s:number) : number {
        return (s+0.5) / (this.music.voices+0) * this.rHeight * 0.9;
    }

    /**
     * Position sphere in correct position from this bar.
     * 
     * @param sphere object to position.
     * @param millibeat 
     */
    public positionSphere(sphere:Phaser.Image,millibeat:number) {
        sphere.x = this.x + millibeat * this.rWidth / 1000;
        sphere.y = this.getBounceY();
        // default is no notes
        var from:number = 0;
        var to:number = 1000;
        if (this.bar.count > 0) {
            // some notes. if before first then 0-first
            if (millibeat < this.bar.note[0].mbTime) {
                to = this.bar.note[0].mbTime;            
            } else {
            // else default is last note, if in each note it's that note length
                from = this.bar.note[this.bar.count-1].mbTime;
                for (var note of this.bar.note) {
                    if (millibeat >= note.mbTime && millibeat < note.mbTime+note.mbLength) {
                        from = note.mbTime;
                        to = note.mbTime + note.mbLength;
                    }
                }
            }
        }
        var angle:number = (millibeat-from) / (to - from) * Math.PI;
        sphere.y -= Math.sin(angle) * this.curveHeight;
        sphere.bringToTop();
    }

    getBounceY(): number {
        return (this.music.voices == 3) ? this.yString(1.5) : 0;
    }

    destroy() : void {
        super.destroy();
        this.music = null;
        this.bar = null;
    }
}