/// <reference path="../../lib/phaser.comments.d.ts"/>

interface IControlBar extends Phaser.Group {
    setPosition:Phaser.Signal;
    moveCursor(bar:number,mbPos:number): void;
}