/// <reference path="../../../lib/phaser.comments.d.ts"/>
/// <reference path="./statictab.ts"/>

class ScrollingTabManager extends StaticTabManager implements IManager {

    private yScroll:number;

    fitToArea(): void {
        this.tabHeight = Math.floor(this.drawHeight / 4);
        this.tabWidth = Math.floor(this.tabHeight / 2.8);
        // Alternative based on draw size ; if we fit more rows in use this.
        var altTabWidth:number = Math.floor(this.drawWidth / 10);
        var altTabHeight:number = Math.floor(altTabWidth * 2.8);
        if (Math.floor(this.drawHeight / altTabHeight) > 4) {
            this.tabHeight = altTabHeight;
            this.tabWidth = altTabWidth;
        }
    }

    redrawAll(): void {
        super.redrawAll();
        for (var renderer of this.renderer) {
            renderer.visible = false;
        }
    }

    moveCursorToNote(bar:number,note:number) : void {
        this.yScroll = this.yScroll||0;
        var realYPos:number = this.renderer[bar].y + this.yScroll;
        var reqScroll:number = Math.floor(realYPos-this.tabHeight);
        reqScroll = Math.min(reqScroll,this.totalHeight-this.drawHeight);
        reqScroll = Math.max(reqScroll,0);
        for (var renderer of this.renderer) {
            renderer.y = renderer.y + this.yScroll - reqScroll;
        }
        this.yScroll = reqScroll;
        this.makeVisibleInDisplayArea();
        super.moveCursorToNote(bar,note);
    } 

    makeVisibleInDisplayArea() : void {
        for(var renderer of this.renderer) {
            renderer.visible = true;
            if (renderer.y  < -2) { renderer.visible = false; }
            if (renderer.y + this.tabHeight > this.drawHeight) { renderer.visible = false; }
        }
    }
}
