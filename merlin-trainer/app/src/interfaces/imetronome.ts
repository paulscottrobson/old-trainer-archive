/// <reference path="../../lib/phaser.comments.d.ts"/>

interface IMetronome extends Phaser.Group {
    updatePosition(mbPos:number,beats:number): void;
}