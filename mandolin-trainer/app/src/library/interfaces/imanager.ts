/// <reference path="../../../lib/phaser.comments.d.ts"/>

interface IManager extends Phaser.Group {
    onSelect:Phaser.Signal;
    getHeight(): number;
    moveCursor(bar:number,millibeat:number): void;
}