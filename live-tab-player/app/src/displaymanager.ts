/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * Display window.
 * 
 * @class MusicDisplayManager
 * @extends {Phaser.Group}
 */
class MusicDisplayManager extends Phaser.Group {

    private music:Music;
    private xWidth:number;
    private viewportHeight:number;
    private renderer:BarRenderer[];
    private background:Phaser.Image;
    private vMargin:number;
    private yHeight:number;
    private cursorImg:Phaser.Image;
    private yScroll:number;
    private scrollToBar:number;
    private barCursor:number;
    private noteCursor:number;

    public  onClick:Phaser.Signal;

    /**
     * Creates an instance of MusicDisplayManager.
     * @param {Phaser.Game} game 
     * @param {Music} music 
     * @param {number} width 
     * @param {number} viewportHeight 
     * 
     * @memberOf MusicDisplayManager
     */
    constructor(game:Phaser.Game,music:Music,width:number,viewportHeight:number) {
        super(game);
        this.music = music;
        this.xWidth = width;
        this.viewportHeight = viewportHeight;
        this.yScroll = 0;        
        this.vMargin = 0;
        this.background = this.game.add.image(0,-this.vMargin,"sprites","rectangle",this);
        this.background.width = width;
        this.background.height = viewportHeight+this.vMargin * 2;
        this.background.anchor.setTo(0,0);
        this.background.events.onInputDown.add(this.clickHandler,this);
        this.background.inputEnabled = true;

        this.createBarRenders();
        this.createCursor();
        this.moveCursor(0,0);
        this.reformat();
        this.scrollToBar = 0;

        this.onClick = new Phaser.Signal();
        //this.scrollToBar = this.music.count - 1;
    }

    /**
     * Update scrolling display.
     * 
     * @memberOf MusicDisplayManager
     */
    update(): void {
        var height:number = this.renderer[this.scrollToBar].getHeight();
        var reqdScroll:number = this.renderer[this.scrollToBar].y+this.yScroll;
        if (this.viewportHeight >= height * 3) {
            reqdScroll -= this.viewportHeight/2 - height / 2;
        }
        

        //reqdScroll = Math.min(reqdScroll,this.yHeight-2*this.renderer[this.scrollToBar].getHeight());
        reqdScroll = Math.max(0,reqdScroll);
        if (reqdScroll != this.yScroll) {
            var dir:number = (reqdScroll > this.yScroll) ? 1 : -1;       
            var step:number = 1000*this.game.time.elapsed / 1000;
            this.yScroll+= dir * Math.min(step,Math.abs(this.yScroll-reqdScroll));
            this.reformat();
        }        
    }

    /**
     * Destroy object
     * 
     * @memberOf MusicDisplayManager
     */
    destroy() : void {
        super.destroy();
        this.renderer = this.music = this.background = this.cursor = null;
        this.onClick = null;
    }

    /**
     * Handle clicks on tab
     * 
     * @private
     * @param {*} object object clicked on
     * @param {Phaser.Pointer} pointer pointer position
     * 
     * @memberOf MusicDisplayManager
     */
    private clickHandler(object:any,pointer:Phaser.Pointer) : void {
        // Work out position in object
        var x:number = pointer.x - this.x;
        var y:number = pointer.y - this.y;
        // Figure out which bar it is in
        for (var n:number = 0;n < this.music.count;n++) {
            var br:BarRenderer = this.renderer[n];
            if (x > br.x && y > br.y) {
                if (x < br.x + br.getWidth() && y < br.y+br.getHeight()) {
                    // Convert horizontal position to note position
                    var nn:number = br.xPosToNote(x-br.x);
                    // If clicked dispatch
                    if (nn >=0) {
                        this.onClick.dispatch(n,nn);
                    }
                }
            }
        }
    }

    /**
     * Create the renderers for the music bars.
     * 
     * @private
     * 
     * @memberOf MusicDisplayManager
     */
    private createBarRenders() : void {
        this.renderer = [];
        for (var n:number = 0;n < this.music.count;n++) {
            this.renderer[n] = new BarRenderer(this.game,this.music.bar[n]);
            this.add(this.renderer[n]);
        }
    }

    /**
     * Set the bar to be scrolled to.
     * 
     * @param {number} barNumber 
     * 
     * @memberOf MusicDisplayManager
     */
    public scrollToView(barNumber:number) : void {
        this.scrollToBar = barNumber;
    }

    /**
     * Go to first bar
     * 
     * @memberOf MusicDisplayManager
     */
    public toHome() : void { this.scrollToView(0); }

    /**
     * Go to last bar
     * 
     * @memberOf MusicDisplayManager
     */
    public toEnd() : void { this.scrollToView(this.music.count-1); }
    /**
     * Position the cursor in the music
     * 
     * @param {number} barNumber 
     * @param {number} noteNumber 
     * 
     * @memberOf MusicDisplayManager
     */
    public moveCursor(barNumber:number,noteNumber:number) {
        barNumber = Math.max(0,Math.min(barNumber,this.music.count-1));
        if (noteNumber < 0 || noteNumber >= this.music.bar[barNumber].count) {
            console.log("Bad note number ?");
        }
        this.barCursor = barNumber;
        this.noteCursor = noteNumber;
        this.updateCursorPosition();
    }

    /**
     * Update the cursor position
     * 
     * @private
     * 
     * @memberOf MusicDisplayManager
     */
    private updateCursorPosition() : void {
        this.renderer[this.barCursor].positionCursor(this.noteCursor,this.cursorImg);
        this.cursorImg.visible = this.renderer[this.barCursor].visible;
    }

    /**
     * Reformat the page, fix scrolling.
     * 
     * @private
     * 
     * @memberOf MusicDisplayManager
     */
    private reformat() : void {
        var hMargin:number = 16;
        var x:number = hMargin;
        var y:number = -Math.round(this.yScroll);
        this.yHeight = this.renderer[0].getHeight();
        // Format each bar
        for (var n:number = 0;n < this.music.count;n++) {
            // If no space then goto next line
            if (x + this.renderer[n].getWidth() > this.xWidth -hMargin) {
                x = hMargin;
                y = y + this.renderer[n].getHeight();
                this.yHeight += this.renderer[n].getHeight();
            }
            // Update position
            this.renderer[n].position.setTo(x,y);
            // Hide if off viewport as we can't clip (I think ?)
            this.renderer[n].visible = true;
            if (y+this.renderer[n].getHeight() > this.viewportHeight || y < 0) {
                this.renderer[n].visible = false;
            }
            // Move next position left.
            x = x + this.renderer[n].getWidth();
        }
        // Reposition cursor.
        this.updateCursorPosition();
    }

    /**
     * Create the display cursor.
     * 
     * @private
     * 
     * @memberOf MusicDisplayManager
     */
    private createCursor(): void {
        // this.cursorImg = this.game.add.image(0,0,"sprites","cursor",this);
        // this.cursorImg.width = BarRenderer.xStep * 0.6;
        // this.cursorImg.height = BarRenderer.barHeight * 0.6;
        // this.cursorImg.anchor.setTo(0,0.5);
        
        this.cursorImg = this.game.add.image(0,0,"sprites","rectangle",this);
        this.cursorImg.width = BarRenderer.xStep * 0.6;
        this.cursorImg.height = BarRenderer.barHeight * 0.6;
        this.cursorImg.anchor.setTo(0.5,0.5);
        this.cursorImg.tint = 0x008080;this.cursorImg.alpha = 0.4;
        
    }

}