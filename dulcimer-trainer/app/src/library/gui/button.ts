/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Single Action Button
 * 
 * @class Button
 * @extends {Phaser.Group}
 */
class Button extends Phaser.Group {

    public onPress:Phaser.Signal;
    protected icon:Phaser.Image;
    private box:Phaser.Image;
    private stdSize:number;

    constructor(game:Phaser.Game,image:string) {
        super(game);
        this.onPress = new Phaser.Signal();
        this.box = game.add.image(0,0,"sprites","icon_frame",this);
        this.stdSize = this.game.width / 10;
        this.box.anchor.setTo(0.5,0.5);
        this.box.inputEnabled = true;
        this.box.events.onInputDown.add(this.clickHandler,this);
        this.icon = game.add.image(0,0,"sprites",image,this);
        this.icon.anchor.setTo(0.5,0.5);
        this.resetSize();
    }

    private resetSize(): void {
        this.box.width = this.box.height = this.stdSize;
        this.icon.width = this.icon.height = this.stdSize * 0.75;
    }

    clickHandler(): void {
        this.onPress.dispatch(this);
        if (!this.game.tweens.isTweening(this)) {
            this.game.add.tween(this).to({ "width":this.width-10,"height":this.height-10 },
                        50,Phaser.Easing.Bounce.In,true,0,0,true);
        }
        //console.log("Click");
    }

    destroy() : void {
        this.onPress = null;
        this.icon = null;
        super.destroy();
    }
}

/**
 * Toggling Button
 * 
 * @class ToggleButton
 * @extends {Button}
 */

class ToggleButton extends Button {
    private onImage:string;
    private offImage:string;
    public isOn:boolean;

    constructor(game:Phaser.Game,onImage:string,offImage:string) {
        super(game,onImage);
        this.onImage = onImage;
        this.offImage = offImage;
        this.isOn = true;
    }

    clickHandler(): void {
        this.isOn = !this.isOn;
        this.icon.loadTexture("sprites",this.isOn ? this.onImage:this.offImage);
        super.clickHandler();
    }
}
