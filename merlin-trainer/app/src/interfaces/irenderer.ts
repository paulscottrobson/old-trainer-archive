/// <reference path="../../lib/phaser.comments.d.ts"/>

interface IRenderer {
    x:number;
    y:number;
    visible:boolean;
    positionSphere(sphere:Phaser.Image,millibeat:number) : void;
}