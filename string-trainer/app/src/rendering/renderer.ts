/// <reference path="../../lib/phaser.comments.d.ts"/>

class HorizontalScrollRenderer extends Phaser.Group implements IRenderer {
    private rWidth:number;
    private rHeight:number;
    private bar:IBar;
    private currentSinePos:number;
    private curveHeight:number;
    private music:IMusic;
    private instrument:IInstrument;
    private voices:number;

    constructor(game:Phaser.Game,bar:IBar,music:IMusic,instrument:IInstrument,
                                                        width:number,height:number) {
        super(game);
        this.rWidth = width;this.rHeight = height;this.bar = bar;
        this.music = music;
        this.instrument = instrument;
        this.voices = instrument.getVoices();
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
        var bc:number = (this.bar == null) ? this.music.getStandardBeats(): this.bar.beats;
        for (var n:number = 0;n <= bc;n++) {
            var vbr:Phaser.Image = this.game.add.image(this.rWidth * n / bc,0,
                                                       "sprites","rectangle",this);
            vbr.width = Math.max(2,this.rWidth / 128);vbr.height = bgr.height;vbr.tint = 0x00000;
            vbr.anchor.setTo(0.5,0);
            if (n == 0 || n == bc) {
                vbr.tint = 0xFFD700;vbr.width *= 2;
                vbr.anchor.setTo(n == 0 ? 0 : 1,0);
            }
        }

        // Strings. Special code for the Dulcimer.
        var c:number = (this.voices == 3) ? 4 : this.voices;
        for (var s:number = 0;s < c;s++) {
            var str:Phaser.Image = this.game.add.image(0,this.yString(s),"sprites","rectangle",this);
            str.width = this.rWidth;str.anchor.setTo(0,0.5);str.tint = 0xE0DFDB;
            // Scale the strings to the back except for three string instruments.
            if (this.voices != 3) {
                str.height = this.rHeight / 64 + s; 
            } else {
                str.height = this.rHeight / 64 + (this.voices-s);
                if (s == 3) {
                    str.y = this.yString(2)-str.height*2;
                    str.height += 2;
                }
            }
            var ss:Phaser.Image = this.game.add.image(0,str.bottom,"sprites","rectangle",this);
            ss.width = this.rWidth;ss.height = this.rHeight/128;ss.tint = 0x000000;
        }
        if (this.bar != null) {
            this.drawNotesSeperate();
        }
        // Debug frame
        var dbg:Phaser.Image = this.game.add.image(0,0,"sprites","frame",this);
        dbg.width = this.rWidth;dbg.height = this.rHeight;dbg.tint = 0xFF8000;dbg.alpha = 0.3;
    }

    /**
     * Draw the notes and sine curve for this bar.
     * 
     * @private
     * 
     * @memberOf HorizontalScrollRenderer
     */
    private drawNotesSeperate(): void {
        // Draw the notes.
        var hPix:number = 0.7*Math.abs(this.yString(0)-this.yString(1));
        // These are the aspect ratios of the rounded rectangles.
        var rrSizes:number[] = [ 102/50,124/50, 152/50, 183/50, 199/50, 75/50, 50/50,250/50 ];
        // current note position for sinecurves.
        this.currentSinePos = 0;
        // For each strum in bar
        for (var strum of this.bar.strums) {
            // Sine curve to this point.
            this.drawSineCurveTo(strum.time);
            // Do each string, if played
            for (var strn:number = 0;strn < this.voices;strn++) {
                if (strum.fretting[strn] != Strum.SILENT) {
                    // Note width
                    var wPix:number = strum.length * this.rWidth / 1000;
                    // Work out the best image to use from the rounded rectangles
                    var best:number = 2;
                    var nearest:number = 42;
                    for (var i:number = 0;i < rrSizes.length;i++) {
                        if (Math.abs(rrSizes[i] - wPix/hPix) < nearest) {
                            best = i;nearest = Math.abs(rrSizes[i]-wPix/hPix);
                        }
                    }
                    // Create rounded rectangle using the best fit.
                    var nbar:Phaser.Image = this.game.add.image(strum.time * this.rWidth / 1000,
                                                                this.yString(strn),
                                                                "sprites","rr"+(best+1),this);
                    nbar.height = hPix;nbar.width = wPix;                                                                
                    nbar.anchor.setTo(0,0.66);     
                    // Colour it using the fretting number as a base.
                    nbar.tint = HorizontalScrollRenderer.COLOURS[strum.fretting[strn] % HorizontalScrollRenderer.COLOURS.length];
                    var n:number = strum.fretting[strn];
                    var s1:string = this.instrument.getFretNameFromChromatic(n);
                    // Put text therein.
                    var txt:Phaser.BitmapText = this.game.add.bitmapText(nbar.x+wPix*0.5,nbar.y,
                                                                        "font",s1,hPix*0.56,this);               
                    txt.anchor.setTo(0.5,0.65);
                    txt.tint = 0xFFFFFF;
                }
            }
        }
        // Draw curve to the end of the bar
        this.drawSineCurveTo(1000);
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
        return (s+0.5) / (this.voices+0) * this.rHeight * 0.9;
    }

    /**
     * Position sphere in correct position from this bar.
     * 
     * @param sphere object to position.
     * @param millibeat 
     */
    public positionSphere(sphere:Phaser.Image,millibeat:number) : void {
        sphere.x = this.x + millibeat * this.rWidth / 1000;
        sphere.y = this.getBounceY();
        // default is no notes
        var from:number = 0;
        var to:number = 1000;
        if (this.bar.count > 0) {
            // some notes. if before first then 0-first
            if (millibeat < this.bar.strums[0].time) {
                to = this.bar.strums[0].time;            
            } else {
            // else default is last note, if in each note it's that note length
                from = this.bar.strums[this.bar.count-1].time;
                for (var strum of this.bar.strums) {
                    if (millibeat >= strum.time && millibeat < strum.time+strum.length) {
                        from = strum.time;
                        to = strum.time + strum.length;
                    }
                }
            }
        }
        var angle:number = (millibeat-from) / (to - from) * Math.PI;
        sphere.y -= Math.sin(angle) * this.curveHeight;
        sphere.bringToTop();
    }

    getBounceY(): number {
        return (this.voices == 3) ? this.yString(1.5) : 0;
    }

    destroy() : void {
        super.destroy();
        this.music = null;
        this.bar = null;
    }
}