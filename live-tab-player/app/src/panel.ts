/// <reference path="../lib/phaser.comments.d.ts"/>

/**
 * Control Panel for Tab Player
 * 
 * @class ControlPanel
 * @extends {Phaser.Group}
 */
class ControlPanel extends Phaser.Group {
    
    private count:number;
    private manager:MusicDisplayManager;
    private player:MusicPlayer;

    constructor(game:Phaser.Game,displayManager:MusicDisplayManager,player:MusicPlayer) {
        super(game);
        this.count = 0;
        this.manager = displayManager;
        this.player = player;
        this.addButton("RST",new Button(game,"i_restart")).onPress.add((btn:Button) => {
            this.manager.moveCursor(0,0);
            this.manager.scrollToView(0);
            this.player.moveTo(0,0);
        },this);
        this.addButton("SLO",new Button(game,"i_slower")).onPress.add((btn:Button) => {
            this.player.bpsAdjust -= 10;
        },this);
        this.addButton("NRM",new Button(game,"i_normal")).onPress.add((btn:Button) => {
            this.player.bpsAdjust = 0;
        },this);
        this.addButton("FST",new Button(game,"i_faster")).onPress.add((btn:Button) => {
            this.player.bpsAdjust += 10;
        },this);
        this.addButton("PAU",new ToggleButton(game,"i_stop","i_play")).onPress.add((btn:ToggleButton) => {
            this.player.isPaused = !btn.isOn;
        },this);
        this.addButton("MUS",new ToggleButton(game,"i_music_off","i_music_on")).onPress.add((btn:ToggleButton) => {
            this.player.isTuneOn = btn.isOn;
        },this);
        this.addButton("MET",new ToggleButton(game,"i_metronome_off","i_metronome_on")).onPress.add((btn:ToggleButton) => {
            this.player.isMetronomeOn = btn.isOn;
        },this);
    }

    destroy() : void {
        super.destroy();
        this.manager = this.player = null;
    }

    private addButton(key:string,button:Button) : Button {
        button.height = button.width = button.game.width / 16;
        button.x = (this.count + 0.5) * (button.width + 10);
        button.y = 0;
        this.add(button);
        this.count++
        return button;
    }
}