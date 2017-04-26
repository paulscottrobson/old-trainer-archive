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

    constructor(game:Phaser.Game,image:string) {
        super(game);
        this.onPress = new Phaser.Signal();
        var box:Phaser.Image = game.add.image(0,0,"sprites","icon_frame",this);
        box.width = box.height = this.game.width / 10;box.anchor.setTo(0.5,0.5);
        box.inputEnabled = true;
        box.events.onInputDown.add(this.clickHandler,this);
        this.icon = game.add.image(0,0,"sprites",image,this);
        this.icon.width = this.icon.height = box.height*0.75;this.icon.anchor.setTo(0.5,0.5);
    }

    clickHandler(): void {
        this.onPress.dispatch(this);
        //this.game.add.tween(this).to({ "width":this.width-10,"height":this.height-10 },100,Phaser.Easing.Bounce.In,true,0,0,true);
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
