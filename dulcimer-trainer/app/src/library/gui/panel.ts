/// <reference path="../../../lib/phaser.comments.d.ts"/>

/**
 * Control Panel for Tab Player
 * 
 * @class ControlPanel
 * @extends {Phaser.Group}
 */
class ControlPanel extends Phaser.Group {
    
    private count:number;
    private manager:IManager;
    private player:IPlayer;
    private isVertical:boolean;

    constructor(game:Phaser.Game,displayManager:IManager,
                                player:IPlayer,isVertical:boolean = false) {
        super(game);
        this.count = 0;
        this.manager = displayManager;
        this.player = player;
        this.isVertical = isVertical;
        this.addButton("RST",new Button(game,"i_restart")).onPress.add((btn:Button) => {
            this.manager.moveCursor(0,0);
            this.player.moveTo(0,0);
        },this);
        this.addButton("SLO",new Button(game,"i_slower")).onPress.add((btn:Button) => {
            this.player.adjustTempo(-10);
        },this);
        this.addButton("NRM",new Button(game,"i_normal")).onPress.add((btn:Button) => {
            this.player.resetTempo();
        },this);
        this.addButton("FST",new Button(game,"i_faster")).onPress.add((btn:Button) => {
            this.player.adjustTempo(10);
        },this);
        this.addButton("PAU",new ToggleButton(game,"i_stop","i_play")).onPress.add((btn:ToggleButton) => {
            this.player.setPause(!btn.isOn);
        },this);
        this.addButton("MUS",new ToggleButton(game,"i_music_off","i_music_on")).onPress.add((btn:ToggleButton) => {
            this.player.setInstrument(btn.isOn);
        },this);
        this.addButton("MET",new ToggleButton(game,"i_metronome_off","i_metronome_on")).onPress.add((btn:ToggleButton) => {
            this.player.setMetronome(btn.isOn);
        },this);
    }

    destroy() : void {
        super.destroy();
        this.manager = this.player = null;
    }

    private addButton(key:string,button:Button) : Button {
        button.height = button.width = button.game.width / 16;
        if (this.isVertical) {
            button.x = button.width / 2;
            button.y = (this.count + 0.5) * (button.width + 4);
        } else {
            button.x = (this.count + 0.5) * (button.width + 4);
            button.y = button.height / 2;
        }
        this.add(button);
        this.count++
        return button;
    }
}