/// <reference path="../../../lib/phaser.comments.d.ts"/>

class StaticTabManager extends Phaser.Group implements IManager {

    protected drawWidth:number;
    protected drawHeight:number;
    private music:IMusic;
    protected renderer:IRenderer[];
    protected musicCursor:Phaser.Image;
    protected tabWidth:number;
    protected tabHeight:number;
    protected totalHeight:number;
    public  onSelect:Phaser.Signal;

    /**
     * Creates an instance of Manager.
     * @param {Phaser.Game} game 
     * @param {Music} music 
     * @param {number} [width=null] 
     * @param {number} [height=null] 
     * 
     * @memberOf Manager
     */

    constructor(game:Phaser.Game,music:IMusic,width:number = null,height:number = null) {
        super(game);
        this.drawWidth = width || game.width;
        this.drawHeight = height || game.height;
        this.music = music;
        this.onSelect = new Phaser.Signal();
        this.renderer = null;
        // Figure out sizes
        this.fitToArea();
        // Create all rendererers
        this.redrawAll();
        // Lay out on the screen
        this.layout();
        // Add extras.
        this.controlGraphics();
    }

    destroy(): void {
        super.destroy();
        this.musicCursor = this.onSelect = this.music = this.renderer = null;
    }

    getHeight(): number {
        return this.drawHeight;
    }
    
    /**
     * Redraw all the bars with the current setting for yes/no draw bits
     * 
     * 
     * @memberOf Manager
     */
    redrawAll(): void {
        if (this.renderer == null) {
            // First time create renderers
            this.renderer = [];
            for (var n = 0;n < this.music.count;n++) {
                this.renderer[n] = new TabRenderer(this.game,this.music.bar[n],this.tabWidth,this.tabHeight);
                this.add(this.renderer[n]);
            }
        } else {
            // Otherwise just re-render
            for (var n = 0;n < this.music.count;n++) {
                this.renderer[n].renderBar();
            }
        }
    }

    /**
     * Move cursor to a specific bar/note.
     * 
     * @param {number} bar 
     * @param {number} note 
     * 
     * @memberOf Manager
     */
    moveCursorToNote(bar:number,note:number) : void {
        this.musicCursor.x = this.renderer[bar].x + this.renderer[bar].getX(note);
        this.musicCursor.y = this.renderer[bar].y;

    }
    
    moveCursor(bar:number,millibeat:number) : void {
        var targetNote:number = 0;
        for (var i:number = 0;i < this.music.bar[bar].count;i++) {
            if (millibeat >= this.music.bar[bar].note[i].mbTime) {
                targetNote = i;
            }
        }
        this.moveCursorToNote(bar,targetNote);
    }

    /**
     * Input catcher (not visible) and cursor.
     * 
     * @memberOf Manager
     */
    controlGraphics(): void {
        // Input catcher
        var img:Phaser.Image = this.game.add.image(0,0,"sprites","rectangle",this);
        img.width = this.drawWidth;img.height = this.drawHeight;//img.tint = 0xFF8000;
        img.inputEnabled = true;
        img.events.onInputDown.add(this.clickHandler,this);
        img.sendToBack();
        // Music cursor 
        this.musicCursor = this.game.add.image(0,0,"sprites","rectangle",this);
        this.musicCursor.tint = 0x0040C0;this.musicCursor.alpha = 0.35;
        this.musicCursor.anchor.setTo(0.5,0);
        this.musicCursor.width = this.tabWidth;
        this.musicCursor.height = this.tabHeight;
        this.moveCursorToNote(0,0);
    }

    /**
     * Click handler ; dispatches signal and moves cursor.
     * 
     * @param {*} obj 
     * @param {Phaser.Pointer} ptr 
     * 
     * @memberOf Manager
     */
    clickHandler(obj:any,ptr:Phaser.Pointer) {
        // Position in manager group
        var x:number = ptr.x - this.x;
        var y:number = ptr.y - this.y;
        // Search for the matching bar
        for (var bar:number = 0;bar < this.music.count;bar++) {
            var b:IRenderer = this.renderer[bar];
            if (x >= b.x && y >= b.y && x < b.x+b.getWidth() && y < b.y+b.getHeight()) {
                // Figure out the note, dispatch signal, move cursor
                var note:number = b.getNote(x-b.x);
                //console.log(bar,note);
                this.onSelect.dispatch(this,bar,this.music.bar[bar].note[note].mbTime,note);
                this.moveCursor(bar,this.music.bar[bar].note[note].mbTime);
            }
        }
    }

    /**
     * Work out sizes to fit into the drawing space
     * 
     * 
     * @memberOf Manager
     */
    fitToArea(): void {
        var fitted:boolean = false;
        // Starting width.
        this.tabWidth = 128;
        // Keep going until it fits in the space
        while (!fitted) {
            // Work out proportional height
            this.tabHeight = Math.round(this.tabWidth * 2.8);
            // If it fits, set flag to exit, else reduce size.
            if (this.calculateHeight(this.tabWidth,this.tabHeight) < this.drawHeight) {
                fitted = true;
            } else {
                this.tabWidth = Math.round(this.tabWidth / 1.04);
            }
        }
    }

    /**
     * Lay out the bars 
     * 
     * 
     * @memberOf Manager
     */
    layout(): void {
        var x:number = 0;
        var y:number = 0;
        // Work through all the bars
        for (var b:number = 0;b < this.music.count;b++) {
            // How much space do we need
            var width:number = this.renderer[b].getWidth();
            // Not enough, new line.
            if (x + width > this.drawWidth) {
                x = 0;
                y = y + this.renderer[b].getHeight();
            }
            // Move it there, update next position
            this.renderer[b].x = x;this.renderer[b].y = y;
            x = x + width;
        }
        this.totalHeight = y + this.renderer[0].getHeight();
    }

    /**
     * Calculate the height if rendered with the given sizes. If we change so that 
     * bars have left/right margin this won't work. We calculate bar size directly.
     * 
     * @param {number} noteSize 
     * @param {number} height 
     * @returns {number} 
     * 
     * @memberOf Manager
     */
    calculateHeight(noteSize:number,height:number) : number {
        var x:number = 0;
        var y:number = 0;
        // Basically the same as layout.
        for (var b:number = 0;b < this.music.count;b++) {
            var width:number = noteSize * (this.music.bar[b].count+0.5);
            // If it won't fit on one line anyway, return very large height => smaller.
            if (width > this.drawWidth) { 
                return 999999;
            }
            if (x + width > this.drawWidth) {
                x = 0;
                y = y + height;
            }
            x = x + width;
        }
        // Return the full height e.g. current position + height.
        return y+height-1;

    }
}   