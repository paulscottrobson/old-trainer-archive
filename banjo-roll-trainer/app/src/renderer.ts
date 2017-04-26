/// <reference path="../lib/phaser.comments.d.ts"/>

class Renderer extends Phaser.Group implements IRenderer {

    private barWidth:number;
    private barHeight:number;
    private yBottom:number;
    private roll:IRoll;
    private static DEBUG:boolean = true;

    constructor(game:Phaser.Game) {
        super(game);
        this.roll = null;
        this.barWidth = this.barHeight = -1;
    }

    destroy(): void {
        this.roll = null;
        super.destroy();
    }

    render(roll:IRoll,barWidth:number,barHeight:number) : void {
        this.erase();
        this.roll = roll;
        this.barWidth = barWidth;
        this.barHeight = barHeight;
        this.yBottom = barHeight * 0.95;
        // Stave lines 
        for (var l:number = 0;l < 5;l++) {
            var stl:Phaser.Image = this.game.add.image(0,this.getY(l),"sprites","rectangle",this);
            stl.width = this.barWidth;stl.height = Math.max(2,this.barHeight/64);
            stl.tint = 0x000000;stl.anchor.setTo(0,0.5);
        }
        // Bar Ends 
        for (var n:number = 0;n < 2;n++) {
            var bln:Phaser.Image = this.game.add.image(n*this.barWidth,this.getY(0),
                                                                "sprites","rectangle",this);
            bln.width = Math.max(2,this.barWidth / 64);bln.height = this.getY(4)-this.getY(0);
            bln.tint = 0x000000;bln.anchor.setTo(0.5,0);
        }
        // Draw notes
        for (var n:number = 0;n < this.roll.getBeats() * 2;n++) {
            this.drawPluck(n);
        }
        // Connecting bars.
        for (var n:number = 0;n < 2;n++) {
            var con:Phaser.Image = this.game.add.image(this.getX(n*this.roll.getBeats()),this.yBottom,
                                                                "sprites","rectangle",this);
            con.tint = 0x000000;con.anchor.setTo(0,1);
            con.width = this.getX(this.roll.getBeats()-1) - this.getX(0);
            con.height = Math.max(3,this.barHeight / 16);
        }
        // Debug bar 
        if (Renderer.DEBUG) {
            var dbi:Phaser.Image = this.game.add.image(0,0,"sprites","frame",this);
            dbi.width = this.barWidth;dbi.height = this.barHeight;  
            dbi.tint = 0xFF8000;dbi.alpha = 0.5;
        }
    }

    private drawPluck(n:number) : void {
        var plucks:Pluck[] = this.roll.getPlucks(n);
        var highestPoint:number = 5;
        for (var pluck of plucks) {
            highestPoint = Math.min(highestPoint,pluck.stringID);
            var note:Phaser.BitmapText = this.game.add.bitmapText(this.getX(n),
                                                                  this.getY(pluck.stringID),
                                                                  "font","0",
                                                                  this.barHeight / 6,
                                                                  this);
                                                                                                                     
            note.anchor.setTo(0.5,0.4);note.tint = 0x000000;
            note.height = (this.getY(1)-this.getY(0)) * 0.9;
            note.width = note.height * 0.6;                                       
        }
        var bar:Phaser.Image = this.game.add.image(this.getX(n),this.getY(highestPoint+0.5),
                                                    "sprites","rectangle",this);
        bar.anchor.setTo(0.5,0);bar.width = Math.max(2,this.barWidth/128);bar.tint = 0x000000;
        bar.height = this.yBottom-bar.y;
    }

    private getX(halfbeat:number):number {
        return (halfbeat+0.5) / (this.roll.getBeats() * 2) * this.barWidth;
    }
    private getY(stave:number):number {
        return (stave+1) / 6 * this.barHeight * 0.85;
    }

    erase():void {
        // delete every alive object in the group 
        this.forEachAlive((obj:any)=> { obj.pendingDestroy = true; },this);
    }

    highlight(halfBeat:number,marker:Phaser.Image):void {
        marker.x = this.x + this.getX(halfBeat);marker.y = this.y;
        marker.anchor.setTo(0.5,0);
        marker.width = this.barWidth / (this.roll.getBeats() * 2);
        marker.height = this.barHeight;marker.bringToTop();
    }

    getWidth():number {
        return this.barWidth;
    }

    getHeight():number {
        return this.barHeight;
    }    
}