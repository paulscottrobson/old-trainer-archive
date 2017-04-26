/// <reference path="../../lib/phaser.comments.d.ts"/>

class ControlBar extends Phaser.Group implements IControlBar {

    public setPosition:Phaser.Signal;

    private barWidth:number;
    private barCount:number;
    private ballSize:number;
    private balls:Phaser.Image[];
    private currentGrabbed:number = -1;

    constructor(game:Phaser.Game,width:number,barCount:number) {
        super(game);
        this.barWidth = width;this.barCount = barCount;
        this.ballSize = width / 16;
        this.setPosition = new Phaser.Signal();
        // Centre bar
        var bar:Phaser.Image = game.add.image(0,0,"sprites","rectangle",this);
        bar.anchor.setTo(0,0.5);bar.tint = 0x00;
        bar.width = width;bar.height = this.ballSize / 8;
        // Balls.
        this.balls = [];
        for (var n = 0;n < 3;n++) {
            var img:Phaser.Image = game.add.image((n == 1) ? width:0,0,
                                                  "sprites",
                                                  (n == 2) ? "sphere_green":"sphere_yellow",
                                                  this);
            this.balls[n] = img;                                                  
            img.inputEnabled = true;
            img.input.enableDrag();
            img.events.onDragStart.add(this.dragStart,this);
            img.events.onDragUpdate.add(this.dragUpdate,this);
            img.events.onDragStop.add(this.dragStop,this);
            img.anchor.setTo(0.5,0.5);img.height = img.width = this.ballSize;
        }
        this.currentGrabbed = -1;
    }

    destroy() : void {
        super.destroy();
        this.balls = null;
        this.setPosition = null;
    }

    /**
     * Find out which is being dragged
     * 
     * @private
     * @param {*} obj 
     * 
     * @memberOf ControlBar
     */
    private dragStart(obj:any) : void {
        for (var n = 0;n < this.balls.length;n++) {
            if (this.balls[n] == obj) {
                this.currentGrabbed = n;
                console.log(n);
            }
        }
    }

    /**
     * Update in grab
     * 
     * @private
     * @param {*} obj 
     * @param {Phaser.Pointer} pointer 
     * @param {number} dragX 
     * @param {number} dragY 
     * 
     * @memberOf ControlBar
     */
    private dragUpdate(obj:any,pointer:Phaser.Pointer,dragX:number,dragY:number) : void {
        if (this.currentGrabbed >= 0) {

            // Get new position
            var xNew:number = dragX;
            // Fit to bar
            xNew = Math.max(0,Math.min(xNew,this.barWidth));
            // If left can't go past right
            if (this.currentGrabbed == 0) {
                xNew = Math.min(xNew,this.balls[1].position.x);
            }
            // If right can't go past left
            if (this.currentGrabbed == 1) {
                xNew = Math.max(xNew,this.balls[0].position.x);
            }
            // If middle update position
            if (this.currentGrabbed == 2) {
                this.moveMusicPosition(this.balls[2].position.x);
            }
            this.balls[this.currentGrabbed].position.x = xNew;
            this.balls[this.currentGrabbed].position.y = 0;
        }
    }

    /**
     * End of drag
     * 
     * @private
     * 
     * @memberOf ControlBar
     */
    private dragStop() : void {
        this.currentGrabbed = -1;
    }

    /**
     * Set bar position
     * 
     * @param {number} bar 
     * @param {number} mbPos 
     * 
     * @memberOf ControlBar
     */
    public moveCursor(bar:number,mbPos:number): void {
        if (this.currentGrabbed < 0) {
            this.balls[2].x = (bar + mbPos / 1000) / this.barCount * this.barWidth;
        }
    }

    /**
     * Update ; check if ball off left or right
     * 
     * 
     * @memberOf ControlBar
     */
    update() : void {
        if (this.currentGrabbed >= 0) {
            // Drag and drop do nothing.
        } else {
            // Force in 0-1 ball range
            if (this.balls[2].x < this.balls[0].x) {
                this.moveMusicPosition(this.balls[0].x);
            }
            if (this.balls[2].x >= this.balls[1].x) {
                this.moveMusicPosition(this.balls[0].x);
            }
        }
    }

    /**
     * Send signal to update display.
     * 
     * @private
     * @param {number} x 
     * 
     * @memberOf ControlBar
     */
    private moveMusicPosition(x:number) : void {
        var prop:number = Math.floor(x / this.barWidth * this.barCount * 1000);
        this.setPosition.dispatch(this,Math.floor(prop/1000),prop % 1000);
    }
}

