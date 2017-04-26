/// <reference path="../../../lib/phaser.comments.d.ts"/>

interface IRenderer extends Phaser.Group {
    getWidth(): number;
    getHeight(): number;
    getX(n:number) : number;
    getNote(x:number) : number;
    renderBar(): void;
}