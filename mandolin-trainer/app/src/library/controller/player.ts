/// <reference path="../../../lib/phaser.comments.d.ts"/>

abstract class MusicPlayer extends Phaser.Group implements IPlayer {

    protected music:Music;
    protected firstNote:number;
    protected lastNote:number;

    public isPaused:boolean;
    public isTuneOn:boolean;
    public isMetronomeOn:boolean;

    public bar:number;
    public millibeat:number;

    public bpsAdjust:number;

    public onPlayNote:Phaser.Signal;
    public onPlayUpdate:Phaser.Signal;

    private nextNoteBar:number;
    private nextNoteNumber:number;
    private endOfTune:boolean;
    private metronome:Phaser.Sound;
    private noteInstance:Phaser.Sound[];
    private speed:Phaser.BitmapText;
    private doFirstClick:boolean;

    constructor(game:Phaser.Game,music:Music,firstNote:number = 1,
                                lastNote:number = PreloadState.NOTE_COUNT) {
        super(game);
        this.music = music;
        this.firstNote = firstNote;this.lastNote = lastNote;
        this.metronome = this.game.add.audio("metronome");
        this.isPaused = false;
        this.bpsAdjust = 0.0;
        this.onPlayNote = new Phaser.Signal();
        this.onPlayUpdate = new Phaser.Signal();
        this.isTuneOn = this.isMetronomeOn = true;
        this.moveTo(0,-1);
        this.speed = this.game.add.bitmapText(0,0,"7seg","000",96,this);
        this.speed.anchor.setTo(0,0);
        this.noteInstance = [];
        for (var n:number = firstNote;n <= lastNote;n++) {
            this.noteInstance[n] = this.game.add.audio(n.toString());
        }
    }

    destroy(): void {
        this.music = null;
        this.metronome.destroy();
        this.metronome = null;
        this.speed = null;
        for (var ni of this.noteInstance) {
            if (ni != null) { 
                ni.destroy(); 
            }
        }
        this.noteInstance = null;
        super.destroy();
        this.onPlayNote = this.onPlayUpdate = null;
    }

    update(): void {
        if (!this.isPaused) {
            var oldMillibeat:number= this.millibeat;
            // seconds elapsed
            var elapsed:number = this.game.time.elapsed / 1000;
            // beats per minute, which can be adjusted.
            var bps:number = (this.music.beatsPerMinute + this.bpsAdjust);
            // force into a sane range
            if (bps < 20 || bps > 240) {
                bps = (bps < 20) ? 20:240;
                this.bpsAdjust = bps - this.music.beatsPerMinute;
            }
            this.speed.text = ("000"+bps.toString()).slice(-3)
            // millibeats elapsed = seconds * beats/sec * 1000
            var mbElapsed = elapsed * bps / 60 * 1000 / this.music.beats;
            // Adjust time.            
            this.millibeat = this.millibeat + Math.round(mbElapsed);
            // Check play and same bar
            if (!this.endOfTune && this.bar == this.nextNoteBar) {
                // Check number to play.
                if (this.millibeat >= this.music.bar[this.bar].note[this.nextNoteNumber].mbTime) {
                    // Send signal
                    this.onPlayNote.dispatch(this,
                                             this.bar,
                                             this.music.bar[this.bar].note[this.nextNoteNumber].mbTime,
                                             this.nextNoteNumber);
                    if (this.isTuneOn) {
                        // Call player
                        this.playChord(this.music.bar[this.bar].note[this.nextNoteNumber].chromaticOffset);
                    }                        
                    // Next note is this.
                    this.nextNoteNumber++;
                    // End of bar
                    if (this.nextNoteNumber == this.music.bar[this.bar].count) {
                        var foundNext:boolean = false;
                        // Look for next non empty bar or end of tune.
                        while ((!foundNext) && this.nextNoteBar < this.music.count-1) {
                            this.nextNoteBar++;
                            this.nextNoteNumber = 0;
                            if (this.music.bar[this.nextNoteBar].count > 0) {
                                foundNext = true;
                            }
                        }
                        if (!foundNext) {
                            this.endOfTune = true;
                        }
                    }
                }
            }
            // Check past next ?
            if (this.millibeat >= 1000) {
                this.millibeat = 0;
                this.bar++;
            }
            // General update
            if (this.bar < this.music.count) {
                this.onPlayUpdate.dispatch(this,this.bar,this.millibeat);                
            }            
            // Check for metronome 
            var beatMB:number = Math.round(1000 / this.music.beats);
            if (Math.floor(this.millibeat/beatMB) != Math.floor(oldMillibeat/beatMB) || this.doFirstClick) {
                if (this.isMetronomeOn) {
                    this.metronome.play();
                }
                this.doFirstClick = false;
            }
            if (this.bar >= this.music.count) {
                this.moveTo(0,-1);
            }
        }
    }

    moveTo(bar:number,note:number = -1) : void {
        this.bar = bar;
        var startBar:boolean = (note < 0);
        note = Math.max(note,0);
        this.millibeat = this.music.bar[bar].note[note].mbTime;
        // Simple end of tune if past end.
        if (this.bar >= this.music.count) {
            this.endOfTune = true;
            return;
        }
        // The next note we shall play.
        this.nextNoteBar = bar;this.nextNoteNumber = 0;
        var found:boolean = false;
        // Look forward from this position for a note.
        while ((!found) && this.nextNoteBar <= this.music.count) {
            var bn:number = this.nextNoteBar;
            if (this.music.bar[bn].count > 0) {
                for (var n:number = 0;n < this.music.bar[bn].count;n++) {
                    if ((!found) && (bn > bar || this.music.bar[bn].note[n].mbTime >= this.millibeat)) {
                        found = true;
                        this.nextNoteNumber = n;
                    }
                }
            }
            if (!found) {
                this.nextNoteBar++;
            }
        }
        this.endOfTune = (!found);
        this.doFirstClick = found;
        if (startBar) { this.millibeat = 0; }
    }

    playChord(offset:number[]) : void {
        // console.log(offset,this.music.instrument.getTuning());
        for (var v:number = 0;v < offset.length;v++) {
            if (offset[v] >= 0) {
                var note:number = this.fretToNote(v,offset[v]);
                this.noteInstance[note].stop();
                this.noteInstance[note].play();
                this.noteInstance[note].volume = this.getStringVolume(v) / 100;
            }
        }
    }

    abstract fretToNote(str:number,fret:number);
    abstract getStringVolume(str:number);

}