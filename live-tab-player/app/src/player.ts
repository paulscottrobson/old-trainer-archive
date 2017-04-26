/// <reference path="../lib/phaser.comments.d.ts"/>

class MusicPlayer extends Phaser.Group {

    private music:Music;
    private firstNote:number;
    private lastNote:number;
    public  isPaused:boolean;

    public bar:number;
    public millibeat:number;
    public bpsAdjust:number;
    private nextNoteBar:number;
    private nextNoteNumber:number;
    private endOfTune:boolean;

    public onPlayNote:Phaser.Signal;
    public isTuneOn:boolean;
    public isMetronomeOn:boolean;

    private metronome:Phaser.Sound;
    private noteInstance:Phaser.Sound[];
    private speed:Phaser.BitmapText;

    constructor(game:Phaser.Game,music:Music,firstNote:number,lastNote:number) {
        super(game);
        this.music = music;
        this.firstNote = firstNote;this.lastNote = lastNote;
        this.metronome = this.game.add.audio("metronome");
        this.isPaused = false;
        this.bpsAdjust = 0.0;
        this.onPlayNote = new Phaser.Signal();
        this.isTuneOn = this.isMetronomeOn = true;
        this.moveTo(0,0);
        this.speed = this.game.add.bitmapText(0,0,"7seg","000",96,this);
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
    }

    update(): void {
        if (!this.isPaused) {
            var oldMillibeat:number= this.millibeat;
            // seconds elapsed
            var elapsed:number = this.game.time.elapsed / 1000;
            // beats per minute, which can be adjusted.
            var bps:number = (this.music.beatsPerMinute + this.bpsAdjust);
            // force into a sane range
            bps = Math.min(Math.max(20,bps),240);
            this.speed.text = ("000"+bps.toString()).slice(-3)
            // millibeats elapsed = seconds * beats/sec * 1000
            var mbElapsed = elapsed * bps / 60 * 1000 / this.music.beats;
            // Adjust time.            
            this.millibeat = this.millibeat + Math.round(mbElapsed);
            // Check play and same bar
            if (!this.endOfTune && this.bar == this.nextNoteBar) {
                // Check number to play.
                if (this.millibeat >= this.music.bar[this.bar].note[this.nextNoteNumber].time) {
                    // Send signal
                    this.onPlayNote.dispatch(this.bar,this.nextNoteNumber,
                                             this.music.bar[this.bar].note[this.nextNoteNumber]);
                    if (this.isTuneOn) {
                        // Call player
                        this.playChord(this.music.bar[this.bar].note[this.nextNoteNumber].chromaticOffsets);
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
            // Check for metronome 
            var beatMB:number = Math.round(1000 / this.music.beats);
            if (Math.floor(this.millibeat/beatMB) != Math.floor(oldMillibeat/beatMB)) {
                if (this.isMetronomeOn) {
                    this.metronome.play();
                }
            }
            //console.log(this.millibeat,this.bar);
        }
    }

    setPause(isPaused:boolean) : void {
        this.isPaused = isPaused;
    }

    moveTo(bar:number,note:number) : void {
        this.bar = bar;
        this.millibeat = this.music.bar[bar].note[note].time;
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
                    if ((!found) && (bn > bar || this.music.bar[bn].note[n].time >= this.millibeat)) {
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
    }

    playChord(offset:number[]) : void {
        // console.log(offset,this.music.instrument.getTuning());
        for (var v:number = 0;v < this.music.instrument.getVoices();v++) {
            if (offset[v] >= 0) {
                var note:number = offset[v] + this.music.instrument.getTuning()[v];
                this.noteInstance[note].stop();
                this.noteInstance[note].play();
            }
        }
    }
}