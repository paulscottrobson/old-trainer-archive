/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * Object responsible for rendering a bar. Exist on a 1:1 basis with bars. It 
 * is a Phaser Group so you can do Phaser Group-y things with it.
 * 
 * @class BarRenderer
 * @extends {Phaser.Group}
 */
class BarRenderer extends Phaser.Group {

    private bar:Bar;
    private yStaveHeight:number;
    private yBarBottom:number;
    public static barHeight:number = 200;
    public static xStep:number = 64;
    private static DEBUG:boolean = false;

    /**
     * Creates an instance of BarRenderer.
     * @param {Phaser.Game} game 
     * @param {Bar} bar 
     * 
     * @memberOf BarRenderer
     */
    constructor(game:Phaser.Game,bar:Bar) {
        super(game);
        this.bar = bar;
        this.draw();
    }

    /**
     * Destroy a bar
     * 
     * 
     * @memberOf BarRenderer
     */
    destroy(): void {
        super.destroy();
        this.bar = null;
    }

    /**
     * Get bar drawn width
     * 
     * @returns {number} 
     * 
     * @memberOf BarRenderer
     */
    getWidth(): number { 
        return (this.bar.count+0.5) * BarRenderer.xStep; 
    }
    
    /**
     * Get bar drawn height
     * 
     * @returns {number} 
     * 
     * @memberOf BarRenderer
     */
    getHeight() : number {
        return BarRenderer.barHeight;
    }

    /**
     * Draw the bar and all its accoutrements
     * 
     * @private
     * 
     * @memberOf BarRenderer
     */
    private draw(): void {
        // Calculate stave space/bar bottom
        this.yStaveHeight = BarRenderer.barHeight * 0.7;
        this.yBarBottom = BarRenderer.barHeight * 0.95;
        // Background white space.
        var img: Phaser.Image;
        //img = this.game.add.image(0, 0, "sprites", "rectangle", this);
        //img.width = this.getWidth(); img.height = this.getHeight();
        // String lines.
        for (var n: number = 0; n < this.bar.music.voices; n++) {
            img = this.game.add.image(0, this.getYString(n), "sprites", "rectangle", this);
            img.tint = 0x000000; img.anchor.setTo(0, 0.5);
            img.width = this.getWidth(); img.height = Math.max(1, this.yStaveHeight / 32);
        }
        // Bar lines 
        for (var n: number = 0; n < 2; n++) {
            img = this.game.add.image(n * this.getWidth(), this.getYString(0), "sprites", "rectangle", this);
            img.tint = 0x000000; img.anchor.setTo(0.5, 0);
            img.width = Math.max(1, this.yStaveHeight / 16);
            img.height = this.getYString(this.bar.music.voices - 1) - this.getYString(0);
        }
        // Notes
        for (var n: number = 0; n < this.bar.count; n++) {
            this.drawNote(n);
        }
        // Connecting lines.
        var crotchet:number = Math.floor(1000 / this.bar.music.beats / 2) + 1;
        var n:number = 0;
        // Look for notes that are
        while (n < this.bar.count) {
            if (this.bar.note[n].len < crotchet) {
                var start:number = n;
                while (n != this.bar.count && this.bar.note[n].len < crotchet) {
                    n++;
                }
                n--;
                this.connectNotes(start,n);
            } 
            n = n + 1;
        }
        // Debugging object
        if (BarRenderer.DEBUG) {
            img = this.game.add.image(0, 0, "sprites", "frame", this);
            img.width = this.getWidth(); img.height = this.getHeight();
            img.tint = 0xFF0000; img.alpha = 0.3;
        }
    }

    /**
     * Draw a single note and its vertical line.
     * 
     * @private
     * @param {number} n 
     * 
     * @memberOf BarRenderer
     */
    private drawNote(n:number) {
        // We do not draw rests.
        var isRest:boolean = true;
        for (var str = 0;str < this.bar.music.voices;str++) {
           if (this.bar.note[n].chromaticOffsets[str] != Note.NO_STRUM) { isRest = false; }
        }
        if (isRest) { return; }
                
        // vertical line 
        var img:Phaser.Image = this.game.add.image(this.getXNote(n),this.getYString(this.bar.music.voices-0.5),
                                                   "sprites","rectangle",this);
        img.width = Math.max(1,this.yStaveHeight/32);
        img.height = this.yBarBottom - img.y;
        img.anchor.setTo(0.5,0);img.tint = 0x000000;  
        for (var str = 0;str < this.bar.music.voices;str++) {
            var note:number = this.bar.note[n].chromaticOffsets[str];
            if (note != Note.NO_STRUM) {
                var s:string = this.bar.music.instrument.getDisplayedFretForChromatic(note);
                if (s.slice(-1) == '+') {
                    s = s.slice(0,-1)+"plus";
                }
                img = this.game.add.image(this.getXNote(n),this.getYString(str),
                                          "sprites",s,this);
                img.anchor.setTo(0.5,0.5);
                img.width = BarRenderer.xStep * 0.7;
                img.height = (this.getYString(1)-this.getYString(0)) * 0.8;                                          
            }
        }  
        // Check for a minim+ which has a circle round it.
        if (this.bar.note[n].len >= Math.floor(1000*2/this.bar.music.beats)) {
            var crc:Phaser.Image = this.game.add.image(img.x,img.y,"sprites","circle",this);
            crc.tint = 0x000000; crc.anchor.setTo(0.5,0.5);
            crc.width = crc.height = this.getHeight()*0.25;
        }
    }

    /**
     * Connect the notes with lines or double lines for short notes, can be mixed.
     * 
     * @private
     * @param {number} first first note in run
     * @param {number} last last note in run
     * @returns 
     * 
     * @memberOf BarRenderer
     */
    private connectNotes(first:number,last:number) {
        // first and last are the same. Just a half line on the current one.
        if (first == last) {
            if (first > 0) {
                this.drawConnection(first-0.5,first,this.bar.note[first].len);
            } else {
                this.drawConnection(first,first+0.5,this.bar.note[first].len);                
            }
            return;
        }
        // Find out the shortes note.
        var shortestNote:number = 1000;
        var allSameLength:boolean = true;
        for (var n:number = first;n <= last;n++) {
            shortestNote = Math.min(shortestNote,this.bar.note[n].len);
            if (Math.abs(this.bar.note[first].len - this.bar.note[n].len) > 3) {
                allSameLength = false;
            }
        }
        // all the notes are the same length. Draw a single bar of that length.
        if (allSameLength) {
            this.drawConnection(first,last,shortestNote);
            return;
        }
        // so we have a run where they are mixed up. first draw a single/quaver bar.
        this.drawConnection(first,last,1000 / this.bar.music.beats / 2);
        // Now work forward looking for semiquavers.
        var n:number = first;
        while (n <= last) {
            // Have we found a semiquaver or shorter.
            if (Math.abs(this.bar.note[n].len - 1000/this.bar.music.beats/4) < 3) {
                // See if the previous one and next one is a semiquaver.
                var isNext:boolean = false;
                var isPrev:boolean = false;
                if (n < last) {
                    if (Math.abs(this.bar.note[n+1].len - 1000/this.bar.music.beats/4) < 3) {
                        isNext = true;
                    }
                }
                if (n > first) {
                    if (Math.abs(this.bar.note[n-1].len - 1000/this.bar.music.beats/4) < 3) {
                        isPrev = true;
                    }
                }
                // If the last one is a semiquaver we have already drawn it.
                if (!isPrev) {
                    // Draw this one or a back half bar.
                    if (isNext) {
                        this.drawConnection(n,n+1,this.bar.note[n].len);
                    } else {
                        this.drawConnection(n-0.5,n,this.bar.note[n].len);
                    }
                }
            }
            n++;
        }
    }

    /**
     * Draw a semi/quaver connecting line.
     * 
     * @private
     * @param {number} start 
     * @param {number} end 
     * @param {number} length 
     * 
     * @memberOf BarRenderer
     */
    private drawConnection(start:number,end:number,length:number) {
        var isDouble:boolean = (Math.abs(length - 1000/this.bar.music.beats/4) < 3);
        this.drawConnectingBar(start,end,this.yBarBottom);
        if (isDouble) {
            this.drawConnectingBar(start,end,this.yBarBottom-this.yStaveHeight / 8);        
        }
    }

    /**
     * Draw a single connecting horizontal line
     * 
     * @private
     * @param {number} start 
     * @param {number} end 
     * @param {number} y 
     * 
     * @memberOf BarRenderer
     */
    private drawConnectingBar(start:number,end:number,y:number) {
        start = this.getXNote(start);
        end = this.getXNote(end);
        var img:Phaser.Image = this.game.add.image(start,y,"sprites","rectangle",this);
        img.tint = 0x000000;img.anchor.setTo(0,1);
        img.width = end-start;img.height = this.yStaveHeight / 16;
    }
    
    /**
     * Position a cursor object so that it is immediately to the right of the 
     * given note
     * 
     * @param {number} pos  note position
     * @param {Phaser.Image} object cursor object
     * 
     * @memberOf BarRenderer
     */
    positionCursor(pos:number,object:Phaser.Image) {
        var x:number = this.x + this.getXNote(pos);
        var y:number = this.y + this.yStaveHeight / 2;
        object.bringToTop();
        //this.game.add.tween(object).to({ x:x },70,Phaser.Easing.Linear.None,true);
        object.x = x;
        object.y = y;
    }

    /**
     * Get horizontal position corresponding to note.
     * 
     * @param {number} n 
     * @returns {number} 
     * 
     * @memberOf BarRenderer
     */
    getXNote(n:number) : number {
        return Math.round((n+0.75) * BarRenderer.xStep);
    }

    xPosToNote(x:number) : number {
        var result:number = -1;
        for (var n:number = 0;n < this.bar.count;n++) {
            if (x >= this.getXNote(n-0.5) && x < this.getXNote(n+0.5)) {
                result = n;
            }
        }
        return result;
    }

    /**
     * Get vertical position of string on a tab.
     * 
     * @param {number} str 
     * @returns {number} 
     * 
     * @memberOf BarRenderer
     */
    getYString(str:number) : number {
        return (str + 1) * this.yStaveHeight / (this.bar.music.voices+1);
    }
}