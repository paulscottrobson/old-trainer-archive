/// <reference path="../../lib/phaser.comments.d.ts"/>

/**
 * Class responsible for audio - the music and the metronome tick.
 * 
 * @class MusicPlayer
 * @extends {Phaser.Group}
 * @implements {IPlayer}
 */
class MusicPlayer extends Phaser.Group implements IPlayer {

    public  onPositionUpdate:Phaser.Signal;

    private barPosition:number;
    private mbPosition:number;
    private music:IMusic;
    private tempo:number;
    private isPaused:boolean;
    private isMetronomeOn:boolean;
    private isInstrumentOn:boolean;
    private speedDisplay:Phaser.BitmapText;
    private metronomeSound:Phaser.Sound;
    private stringSound:Phaser.Sound[][];

    /**
     * Create a player.
     * @param {Phaser.Game} game 
     * @param {IMusic} music 
     * 
     * @memberOf MusicPlayer
     */
    constructor(game:Phaser.Game,music:IMusic) {
        super(game);
        this.music = music;
        if (this.music.getBarCount() == 0) {
            throw new Error("Cannot play empty music object")
        }
        this.createDisplay();
        this.onPositionUpdate = new Phaser.Signal();
        this.resetTempo();
        this.setPause(false);
        this.setMetronome(true);
        this.setInstrument(true);
        this.moveTo(0,0);
        this.metronomeSound = this.game.add.audio("metronome");
        this.stringSound = [];
        for (var n:number = 0;n < this.music.getVoices();n++) {
            this.stringSound[n] = this.loadInstrument(this.music.getTuning()[n]);
        }
    }

    /**
     * Destroy musicplayer 
     * 
     * 
     * @memberOf MusicPlayer
     */
    destroy(): void {
        super.destroy();
        this.music = null;
        this.onPositionUpdate = null;
        this.speedDisplay = null;
    }

    /**
     * Create LCD display for tempo
     * 
     * 
     * @memberOf MusicPlayer
     */
    private createDisplay(): void {
        var img:Phaser.Image = this.game.add.image(0,0,"sprites","rectangle",this);
        img.anchor.setTo(0.5,0.5);img.tint = 0xC0C0C0;img.width = 200;img.height = 100;
        this.speedDisplay = this.game.add.bitmapText(0,0,"7seg","888",img.height,this);
        this.speedDisplay.tint = 0xFF0000;this.speedDisplay.anchor.setTo(0.5,0.4);
    }

    /**
     * Update the LCD display
     * 
     * 
     * @memberOf MusicPlayer
     */
    private updateTempo(): void {
        var s:string = "00"+Math.floor(this.tempo).toString();
        this.speedDisplay.setText(s.slice(-3));
    }

    /**
     * Load instrument sounds for one string
     * 
     * @param {number} baseNote 
     * @returns {Phaser.Sound[]} 
     * 
     * @memberOf MusicPlayer
     */
    loadInstrument(base:string): Phaser.Sound[] {
        var baseNote:number = Strum.convertNoteToIndex(base) - Strum.convertNoteToIndex("B3") + 1;
        var sounds:Phaser.Sound[] = [];
        for (var offset:number = 0;offset < 16;offset++) {
            var soundName:string = (baseNote + offset).toString();
            sounds.push(this.game.add.audio(soundName));
        }
        return sounds;
    }

    /**
     * Phaser object update routine
     * 
     * 
     * @memberOf MusicPlayer
     */
    update(): void {
        // Elapsed time in seconds
        var elapsed:number = this.game.time.elapsedMS / 1000;
        // Convert beats/minute to millibars/second
        var beats:number = this.tempo / 60 * 1000 / this.music.getBar(this.barPosition).beats;
        // Elapsed time in millibeats
        elapsed = Math.round(elapsed * beats);

        // Music check
        if (this.isInstrumentOn && !this.isPaused) {
            // get current bar
            var bar:IBar = this.music.getBar(this.barPosition);
            // check if crossed each note.
            for (var n:number = 0;n < bar.count;n++) {
                // +1 is because mbPosition is often zero.
                var time:number = bar.strums[n].time + 1;
                // crossed ?
                if (time < this.mbPosition && time+elapsed >= this.mbPosition) {
                    // console.log("Play",this.barPosition,n,bar.strums[n].toString());
                    // for each voice identify the note
                    for (var v:number = 0;v < this.music.getVoices();v++) {
                        var note:number = bar.strums[n].fretting[v];
                        // Play it if not silent.
                        if (note != Strum.SILENT) {
                            this.stringSound[v][note].play();
                        }
                    }
                }
            }
        }

        // Metronome check
        if (this.isMetronomeOn && !this.isPaused) {
            var mbPerBeat:number = 1000 / this.music.getBar(this.barPosition).beats;
            var b1:number = Math.floor(this.mbPosition/mbPerBeat);
            var b2:number = Math.floor((this.mbPosition+elapsed)/mbPerBeat);
            if (b1 != b2 || this.mbPosition == 0) {
                this.metronomeSound.play();
            }
        }

        // Advance position and loop if gone too far.
        if (!this.isPaused) {
            this.mbPosition += elapsed;
            if (this.mbPosition >= 1000-4) {
                this.mbPosition = 0;
                this.barPosition++;
                if (this.barPosition >= this.music.getBarCount()) {
                    this.moveTo(0,0);
                }            
            }
        }

        // If not paused, update position
        if (!this.isPaused) {
            this.onPositionUpdate.dispatch(this,this.barPosition,this.mbPosition);
        }
    }

    moveTo(bar: number, mbPosition: number): void {
        this.barPosition = bar;
        this.mbPosition = mbPosition;
        if (this.barPosition >= this.music.getBarCount()) {
            this.barPosition = this.mbPosition = 0;
        }
    }

    resetTempo(): void {
        this.tempo = this.music.getTempo();
        this.updateTempo();
    }

    adjustTempo(adjust: number): void {
        this.tempo += adjust;
        this.tempo = Math.max(40,this.tempo);
        this.tempo = Math.min(240,this.tempo);
        this.updateTempo();
    }

    setPause(isOn: boolean): void {
        this.isPaused = isOn;
    }
    
    setMetronome(isOn: boolean): void {
        this.isMetronomeOn = isOn;
    }

    setInstrument(isOn: boolean): void {
        this.isInstrumentOn = isOn;
    }

}