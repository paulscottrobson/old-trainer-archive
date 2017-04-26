/// <reference path="../../../lib/phaser.comments.d.ts"/>

interface IPlayer extends Phaser.Group {
    isPaused:boolean;
    isTuneOn:boolean;
    isMetronomeOn:boolean;
    bar:number;
    millibeat:number;
    bpsAdjust:number;
    onPlayNote:Phaser.Signal;
    onPlayUpdate:Phaser.Signal;
    moveTo(bar:number,note:number) : void;
}
