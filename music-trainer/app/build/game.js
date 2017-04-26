var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var GameState = (function (_super) {
    __extends(GameState, _super);
    function GameState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GameState.prototype.create = function () {
        var bgr = this.game.add.image(0, 0, "sprites", "background");
        bgr.width = this.game.width;
        bgr.height = this.game.height;
        this.music = new Music();
        this.music.load(this.game.cache.getJSON("music"));
        this.bgr = new FretboardBackground(this.game, this.music.instrument);
        console.log(this.music);
        for (var b = 0; b < 2; b++) {
            var brd = new FretboardBarRenderer(this.game, this.music.instrument, this.bgr);
            brd.draw(this.music.bar[b + 0]);
            brd.move(this.music.bar[b + 0], 100 + b * 550);
        }
    };
    GameState.prototype.destroy = function () {
    };
    GameState.prototype.update = function () {
    };
    return GameState;
}(Phaser.State));
window.onload = function () {
    var game = new OcarinaTrainer();
};
var OcarinaTrainer = (function (_super) {
    __extends(OcarinaTrainer, _super);
    function OcarinaTrainer() {
        var _this = _super.call(this, 1440, 900, Phaser.AUTO, "", null, false, false) || this;
        _this.state.add("Boot", new BootState());
        _this.state.add("Preload", new PreloadState());
        _this.state.add("Main", new GameState());
        _this.state.start("Boot");
        return _this;
    }
    return OcarinaTrainer;
}(Phaser.Game));
var BootState = (function (_super) {
    __extends(BootState, _super);
    function BootState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BootState.prototype.preload = function () {
        this.game.load.image("loader", "assets/sprites/loader.png");
        this.game.load.json("music", "water.json");
    };
    BootState.prototype.create = function () {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.state.start("Preload");
    };
    return BootState;
}(Phaser.State));
var PreloadState = (function (_super) {
    __extends(PreloadState, _super);
    function PreloadState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PreloadState.prototype.preload = function () {
        var _this = this;
        var name = this.cache.getJSON("music")["type"];
        var instr = InstrumentFactory.get(name);
        this.game.stage.backgroundColor = "#000000";
        var loader = this.add.sprite(this.game.width / 2, this.game.height / 2, "loader");
        loader.width = this.game.width * 9 / 10;
        loader.height = this.game.height / 8;
        loader.anchor.setTo(0.5);
        this.game.load.setPreloadSprite(loader);
        this.game.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
        this.game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");
        var sndDir = (instr.getSoundSet() == SOUND_SET.STRUM ?
            "dulcimer" : "ocarina");
        PreloadState.NOTE_COUNT = instr.getSoundSetSize();
        for (var i = 1; i <= PreloadState.NOTE_COUNT; i++) {
            var sound = i.toString();
            this.game.load.audio(sound, ["assets/sounds/" + sndDir + "/" + sound + ".mp3", "assets/sounds/" + sound + ".ogg"]);
        }
        if (name.indexOf("OCARINA") >= 0) {
            this.game.load.spritesheet("notes", "assets/sprites/notes.png", 200, 201, 21);
            this.game.load.atlas("4-hole-atlas", "assets/sprites/ocarina/4-hole-atlas.png", "assets/sprites/ocarina/4-hole-atlas.json");
            this.game.load.atlas("6-hole-atlas", "assets/sprites/ocarina/6-hole-atlas.png", "assets/sprites/ocarina/6-hole-atlas.json");
        }
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
var Bar = (function () {
    function Bar(barNumber, music) {
        this.barNumber = barNumber;
        this.music = music;
        this.note = [];
        this.count = 0;
    }
    Bar.prototype.decode = function (barDef) {
        var p = 0;
        var barPosition = 0;
        while (p < barDef.length) {
            var cc = barDef.charCodeAt(p);
            if (cc >= 48 && cc < 58) {
                barPosition = barPosition + 1000 / this.music.beats * (cc - 48) / 4;
                p++;
            }
            else {
                var note = new Note();
                note.chromaticOffsets = [];
                note.time = barPosition;
                note.len = 0;
                for (var n = 0; n < this.music.voices; n++) {
                    cc = barDef.charCodeAt(p);
                    p = p + 1;
                    if (cc >= 65 && cc <= 90) {
                        note.chromaticOffsets.push(cc - 65);
                    }
                    else {
                        if (cc != 45) {
                            console.log("WARN: Syntax " + barDef);
                        }
                        note.chromaticOffsets.push(Note.NO_STRUM);
                    }
                }
                this.note.push(note);
                this.count++;
            }
        }
        for (var n = 0; n < this.count; n++) {
            this.note[n].len = (n != this.count - 1 ?
                this.note[n + 1].time : 1000)
                - this.note[n].time;
        }
    };
    return Bar;
}());
var Music = (function () {
    function Music() {
        this.bar = [];
        this.count = 0;
        this.beats = -1;
        this.type = null;
    }
    Music.prototype.load = function (json) {
        this.beats = parseInt(json["beats"]);
        this.type = json["type"];
        this.musicName = json["name"] || "";
        this.authorName = json["author"] || "";
        this.instrumentName = json["instrument"] || "";
        this.beatsPerMinute = parseInt(json["speed"]);
        this.instrument = InstrumentFactory.get(this.type);
        this.voices = this.instrument.getVoices();
        for (var _i = 0, _a = json["bars"]; _i < _a.length; _i++) {
            var bDef = _a[_i];
            var bar = new Bar(this.count, this);
            bar.decode(bDef);
            this.bar.push(bar);
            this.count++;
        }
    };
    return Music;
}());
var Note = (function () {
    function Note() {
    }
    Note.prototype.toString = function () {
        return this.chromaticOffsets.join("-") + " @ " +
            this.time.toString() + " [" + this.len.toString() + "]";
    };
    return Note;
}());
Note.NO_STRUM = -1;
var InstrumentFactory = (function () {
    function InstrumentFactory() {
    }
    InstrumentFactory.get = function (name) {
        if (name === "DULCIMERDAA") {
            return new DulcimerDAA();
        }
        if (name === "OCARINACSOP") {
            return new OcarinaCSoprano();
        }
        console.log("Unknown instrument type ", name);
        return null;
    };
    return InstrumentFactory;
}());
var SOUND_SET;
(function (SOUND_SET) {
    SOUND_SET[SOUND_SET["STRUM"] = 10048] = "STRUM";
    SOUND_SET[SOUND_SET["WOODWIND"] = 11042] = "WOODWIND";
})(SOUND_SET || (SOUND_SET = {}));
;
var BaseInstrument = (function () {
    function BaseInstrument() {
    }
    BaseInstrument.prototype.isDoubleString = function (str) { return false; };
    BaseInstrument.prototype.getDisplayedFretForChromatic = function (fret) { return fret.toString(); };
    BaseInstrument.prototype.isDiatonic = function () { return false; };
    BaseInstrument.prototype.getSoundSetSize = function () { return this.getSoundSet() % 1000; };
    return BaseInstrument;
}());
var DiatonicInstrument = (function (_super) {
    __extends(DiatonicInstrument, _super);
    function DiatonicInstrument() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DiatonicInstrument.prototype.isDiatonic = function () { return true; };
    DiatonicInstrument.prototype.getDisplayedFretForChromatic = function (fret) {
        var diatonic = Math.floor(fret / 12) * 7;
        diatonic += DiatonicInstrument.DIATONIC_MAPPING[fret % 12];
        var s = Math.floor(diatonic).toString();
        if (Math.floor(diatonic) != diatonic) {
            s = s + "+";
        }
        return s;
    };
    return DiatonicInstrument;
}(BaseInstrument));
DiatonicInstrument.DIATONIC_MAPPING = [
    0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 6, 6.5
];
var DulcimerDAA = (function (_super) {
    __extends(DulcimerDAA, _super);
    function DulcimerDAA() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DulcimerDAA.prototype.getVoices = function () { return 3; };
    DulcimerDAA.prototype.getTuning = function () { return [3, 10, 10]; };
    DulcimerDAA.prototype.getVolume = function () { return [50, 50, 100]; };
    DulcimerDAA.prototype.getSoundSet = function () { return SOUND_SET.STRUM; };
    DulcimerDAA.prototype.isDoubleString = function (str) { return (str == 2); };
    return DulcimerDAA;
}(DiatonicInstrument));
var OcarinaCSoprano = (function (_super) {
    __extends(OcarinaCSoprano, _super);
    function OcarinaCSoprano() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OcarinaCSoprano.prototype.getVoices = function () { return 1; };
    OcarinaCSoprano.prototype.getTuning = function () { return [13]; };
    OcarinaCSoprano.prototype.getVolume = function () { return [100]; };
    OcarinaCSoprano.prototype.getSoundSet = function () { return SOUND_SET.WOODWIND; };
    return OcarinaCSoprano;
}(BaseInstrument));
var BaseRenderingEntity = (function (_super) {
    __extends(BaseRenderingEntity, _super);
    function BaseRenderingEntity(game, instrument) {
        var _this = _super.call(this, game) || this;
        _this.instrument = instrument;
        _this.xWidth = 550;
        _this.yHeight = _this.game.height * 0.4;
        _this.yCentre = _this.game.height * 0.9 - _this.yHeight / 2;
        return _this;
    }
    BaseRenderingEntity.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.instrument = null;
    };
    return BaseRenderingEntity;
}(Phaser.Group));
var Background = (function (_super) {
    __extends(Background, _super);
    function Background(game, instrument) {
        var _this = _super.call(this, game, instrument) || this;
        _this.isDrawn = false;
        _this.create();
        return _this;
    }
    Background.prototype.destroy = function () {
        this.delete();
        _super.prototype.destroy.call(this);
    };
    Background.prototype.create = function () {
        if (this.isDrawn) {
            return;
        }
        this.isDrawn = true;
        this.createBackground();
    };
    Background.prototype.createBackground = function () {
        var img = this.game.add.image(0, this.yCentre, "sprites", "rectangle", this);
        img.anchor.setTo(0, 0.5);
        img.tint = 0x800000;
        img.height = this.yHeight;
        img.width = this.game.width;
        img = this.game.add.image(0, this.yCentre, "sprites", "rectangle", this);
        img.width = this.game.width;
        img.height = 4;
        img.anchor.setTo(0, 0.5);
        img.tint = 0xFFFF00;
    };
    Background.prototype.delete = function () {
        if (!this.isDrawn) {
            return;
        }
        this.isDrawn = false;
        this.deleteBackground();
        this.forEachAlive(function (obj) { obj.pendingDestroy = true; }, this);
    };
    Background.prototype.deleteBackground = function () {
    };
    return Background;
}(BaseRenderingEntity));
var FretboardBackground = (function (_super) {
    __extends(FretboardBackground, _super);
    function FretboardBackground() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FretboardBackground.prototype.createBackground = function () {
        var img = this.game.add.image(0, this.yCentre, "sprites", "fretboard", this);
        img.anchor.setTo(0, 0.5);
        img.tint = 0x800000;
        img.height = this.yHeight;
        img.width = this.game.width;
        for (var str = 0; str < this.instrument.getVoices(); str++) {
            var isDouble = this.instrument.isDoubleString(str);
            var s = this.game.add.image(0, this.getYString(str), "sprites", isDouble ? "mstring" : "string", this);
            s.anchor.setTo(0, 0.5);
            s.width = this.game.width;
            s.height = this.game.height / (isDouble ? 64 : 192) * 130 / 100;
            s.height = s.height * (1.5 - this.instrument.getTuning()[str] / PreloadState.NOTE_COUNT);
        }
    };
    FretboardBackground.prototype.getYString = function (str) {
        var y = this.yHeight * 0.8 * 0.75;
        return y * str / (this.instrument.getVoices() - 1) + this.yCentre - y / 2;
    };
    return FretboardBackground;
}(Background));
var OcarinaBackground = (function (_super) {
    __extends(OcarinaBackground, _super);
    function OcarinaBackground() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OcarinaBackground.prototype.createBackground = function () {
        var img = this.game.add.image(0, this.yCentre, "sprites", "rectangle", this);
        img.anchor.setTo(0, 0.5);
        img.tint = 0xFFFFFF;
        img.height = this.yHeight;
        img.width = this.game.width;
        for (var stv = 0; stv < 5; stv++) {
            var s = this.game.add.image(0, this.getYStave(stv), "sprites", "rectangle", this);
            s.anchor.setTo(0, 0.5);
            s.width = this.game.width;
            s.height = this.game.height / 128;
            s.tint = 0x000000;
        }
        img = this.game.add.image(0, this.getYStave(2), "sprites", "treble", this);
        img.anchor.setTo(0.2, 0.5);
        var sc = 1.6 * (this.getYStave(4) - this.getYStave(0)) / img.height;
        img.scale.setTo(sc, sc);
    };
    OcarinaBackground.prototype.getYStave = function (str) {
        var y = this.yHeight * 0.6;
        return y * (str + 1) / 6 + this.yCentre - this.yHeight / 2;
    };
    return OcarinaBackground;
}(Background));
var BaseRenderer = (function (_super) {
    __extends(BaseRenderer, _super);
    function BaseRenderer(game, instrument, background) {
        var _this = _super.call(this, game, instrument) || this;
        _this.instrument = instrument;
        _this.background = background;
        _this.isDrawn = false;
        _this.initialiseRenderer();
        return _this;
    }
    BaseRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.terminateRenderer();
        this.isDrawn = false;
    };
    BaseRenderer.prototype.draw = function (bar) {
        if (!this.isDrawn) {
            this.renderDrawBarFrame(bar);
            for (var n = 0; n < bar.count; n++) {
                this.renderDrawBarNote(bar, bar.note[n]);
            }
            if (BaseRenderer.DEBUG) {
                this.debugRect = this.game.add.image(0, 0, "sprites", "frame", this);
                this.debugRect.tint = 0xFF0000;
                this.debugRect.width = this.xWidth;
                this.debugRect.height = this.yHeight;
                this.debugRect.anchor.setTo(0, 0.5);
                this.debugRect.alpha = 0.5;
            }
            this.isDrawn = true;
        }
    };
    BaseRenderer.prototype.move = function (bar, xPos) {
        if (!this.isDrawn) {
            this.draw(bar);
        }
        this.renderMoveBarFrame(bar, xPos);
        for (var n = 0; n < bar.count; n++) {
            this.renderMoveBarNote(bar, bar.note[n], xPos);
        }
        if (BaseRenderer.DEBUG) {
            this.debugRect.position.setTo(xPos, this.yCentre);
        }
    };
    BaseRenderer.prototype.erase = function (bar) {
        if (this.isDrawn) {
            this.renderEraseBarFrame(bar);
            for (var n = 0; n < bar.count; n++) {
                this.renderEraseBarNote(bar, bar.note[n]);
            }
            if (BaseRenderer.DEBUG) {
                this.debugRect.destroy();
                this.debugRect = null;
            }
            this.isDrawn = false;
        }
    };
    BaseRenderer.prototype.initialiseRenderer = function () { };
    BaseRenderer.prototype.terminateRenderer = function () { };
    BaseRenderer.prototype.renderDrawBarFrame = function (bar) { };
    BaseRenderer.prototype.renderEraseBarFrame = function (bar) { };
    BaseRenderer.prototype.renderMoveBarFrame = function (bar, xPos) { };
    BaseRenderer.prototype.renderDrawBarNote = function (bar, note) { };
    BaseRenderer.prototype.renderEraseBarNote = function (bar, note) { };
    BaseRenderer.prototype.renderMoveBarNote = function (bar, note, xPos) { };
    return BaseRenderer;
}(BaseRenderingEntity));
BaseRenderer.DEBUG = true;
var FretboardBarRenderer = (function (_super) {
    __extends(FretboardBarRenderer, _super);
    function FretboardBarRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FretboardBarRenderer.prototype.initialiseRenderer = function () {
        this.noteBoxes = [];
        this.noteText = [];
    };
    FretboardBarRenderer.prototype.terminateRenderer = function () {
        this.noteBoxes = this.noteText = null;
    };
    FretboardBarRenderer.prototype.renderDrawBarFrame = function (bar) {
        this.barMarker = this.game.add.image(0, 0, "sprites", "bar", this);
        this.barMarker.anchor.setTo(0.5, 0.5);
        this.barMarker.width = this.xWidth / 40;
        this.barMarker.height = this.yHeight * 0.8;
    };
    FretboardBarRenderer.prototype.renderEraseBarFrame = function (bar) {
        this.barMarker.destroy();
        this.barMarker = null;
    };
    FretboardBarRenderer.prototype.renderMoveBarFrame = function (bar, xPos) {
        this.barMarker.position.setTo(xPos, this.yCentre);
    };
    FretboardBarRenderer.prototype.renderDrawBarNote = function (bar, note) {
        var fbr = this.background;
        for (var n = 0; n < this.instrument.getVoices(); n++) {
            if (note.chromaticOffsets[n] != Note.NO_STRUM) {
                var ix = this.getItemIndex(note.time, n);
                var box = this.game.add.image(0, 0, "sprites", "notebutton", this);
                this.noteBoxes[ix] = box;
                box.anchor.setTo(0.5, 0.5);
                var xsc = (this.xWidth / 8) / box.width;
                var ysc = (fbr.getYString(1) - fbr.getYString(0)) / box.height;
                box.scale.setTo(Math.min(xsc, ysc));
                var colNo = note.chromaticOffsets[n] % FretboardBarRenderer._colours.length;
                box.tint = FretboardBarRenderer._colours[colNo];
                var noteText = this.instrument.getDisplayedFretForChromatic(note.chromaticOffsets[n]);
                var txt = this.game.add.bitmapText(0, 0, "font", noteText, this.xWidth / 13, this);
                this.noteText[ix] = txt;
                txt.anchor.setTo(0.5, 0.5);
                txt.tint = 0xFFFFFF;
            }
        }
    };
    FretboardBarRenderer.prototype.renderEraseBarNote = function (bar, note) {
        for (var n = 0; n < this.instrument.getVoices(); n++) {
            var ix = this.getItemIndex(note.time, n);
            if (note.chromaticOffsets[n] != Note.NO_STRUM) {
                this.noteBoxes[ix].destroy();
                this.noteBoxes[ix] = null;
                this.noteText[ix].destroy();
                this.noteText[ix] = null;
            }
        }
    };
    FretboardBarRenderer.prototype.renderMoveBarNote = function (bar, note, xPos) {
        var fbr = this.background;
        for (var n = 0; n < this.instrument.getVoices(); n++) {
            var ix = this.getItemIndex(note.time, n);
            if (note.chromaticOffsets[n] != Note.NO_STRUM) {
                this.noteBoxes[ix].position.setTo(Math.floor(xPos + note.time * this.xWidth / 1000), fbr.getYString(n));
                this.noteText[ix].x = this.noteBoxes[ix].x;
                this.noteText[ix].y = this.noteBoxes[ix].y;
            }
        }
    };
    FretboardBarRenderer.prototype.getItemIndex = function (time, str) {
        return time * 100 + str;
    };
    return FretboardBarRenderer;
}(BaseRenderer));
FretboardBarRenderer._colours = [0xFF0000, 0x00FF00, 0x0040FF, 0xFFFF00, 0x00FFFF, 0xFF00FF, 0xFF8000,
    0x808080, 0xFFFFFF, 0x8B4513];
var OcarinaDisplayStorage = (function () {
    function OcarinaDisplayStorage() {
    }
    return OcarinaDisplayStorage;
}());
var OcarinaBarRenderer = (function (_super) {
    __extends(OcarinaBarRenderer, _super);
    function OcarinaBarRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OcarinaBarRenderer.prototype.initialiseRenderer = function () {
        this.info = [];
    };
    OcarinaBarRenderer.prototype.terminateRenderer = function () {
        this.info = null;
    };
    OcarinaBarRenderer.prototype.renderDrawBarFrame = function (bar) {
        var obr = this.background;
        this.barMarker = this.game.add.image(0, 0, "sprites", "bar", this);
        this.barMarker.anchor.setTo(0.5, 0);
        this.barMarker.width = this.xWidth / 40;
        this.barMarker.height = obr.getYStave(4) - obr.getYStave(0);
    };
    OcarinaBarRenderer.prototype.renderEraseBarFrame = function (bar) {
        this.barMarker.destroy();
        this.barMarker = null;
    };
    OcarinaBarRenderer.prototype.renderMoveBarFrame = function (bar, xPos) {
        var obr = this.background;
        this.barMarker.position.setTo(xPos, obr.getYStave(0));
    };
    OcarinaBarRenderer.prototype.renderDrawBarNote = function (bar, note) {
        var obr = this.background;
        this.info[note.time] = new OcarinaDisplayStorage();
        var info = this.info[note.time];
        var pos = this.convertToStavePosition(note.chromaticOffsets[0]);
        var hasSharp = Math.floor(pos) !== pos;
        pos = 4 - (Math.floor(pos) / 2 - 2);
        var dnote = this.game.add.image(0, obr.getYStave(pos), "notes", 0, this);
        info.displayNote = dnote;
        dnote.anchor.setTo(0.5, 0.5);
        dnote.scale.setTo(this.xWidth / 400 * (obr.getYStave(4) - obr.getYStave(0)) / dnote.height);
        if (hasSharp) {
            var shp = this.game.add.image(0, dnote.y, "sprites", "sharp", this);
            shp.anchor.setTo(0.5, 0.5);
            shp.scale.setTo(dnote.height / shp.height * 0.23);
            info.sharpNote = shp;
        }
        if (pos >= 5) {
            info.barLines = [];
            for (var l = 0; l < ((pos == 6) ? 2 : 1); l++) {
                info.barLines[l] = this.game.add.image(0, obr.getYStave(l + 5), "sprites", "rectangle", this);
                info.barLines[l].width = this.xWidth * 0.1;
                info.barLines[l].height = this.yHeight / 60;
                info.barLines[l].anchor.setTo(0.5);
                info.barLines[l].tint = 0x000000;
            }
        }
        if (note.chromaticOffsets[0] == Note.NO_STRUM) {
            dnote.frame = (note.len >= Math.floor(1000 / bar.music.beats)) ? 5 : 2;
        }
        else {
            var frame = this.getNoteGraphic(note.len / 1000 * bar.music.beats) * 3;
            if (pos <= 2) {
                frame++;
            }
            dnote.frame = frame;
        }
    };
    OcarinaBarRenderer.prototype.renderEraseBarNote = function (bar, note) {
        var info = this.info[note.time];
        info.displayNote.destroy();
        if (info.sharpNote != null) {
            info.sharpNote.destroy();
        }
        if (info.barLines != null) {
            for (var _i = 0, _a = info.barLines; _i < _a.length; _i++) {
                var bl = _a[_i];
                bl.destroy();
            }
        }
        this.info[note.time] = null;
    };
    OcarinaBarRenderer.prototype.renderMoveBarNote = function (bar, note, xPos) {
        var obr = this.background;
        var info = this.info[note.time];
        info.displayNote.x = xPos + note.time * this.xWidth / 1000;
        if (info.sharpNote != null) {
            info.sharpNote.x = info.displayNote.x - info.displayNote.width * 0.18;
        }
        if (info.barLines != null) {
            for (var _i = 0, _a = info.barLines; _i < _a.length; _i++) {
                var bl = _a[_i];
                bl.x = info.displayNote.x;
            }
        }
    };
    OcarinaBarRenderer.prototype.convertToStavePosition = function (chrom) {
        if (chrom == Note.NO_STRUM) {
            return 8;
        }
        var n = OcarinaBarRenderer.A_BASED_TO_POSITION[chrom % 12];
        return n + Math.floor(chrom / 12) * 7;
    };
    OcarinaBarRenderer.prototype.getNoteGraphic = function (beats) {
        return OcarinaBarRenderer.QUARTER_TO_FRAME[Math.min(16, Math.round(beats * 4))];
    };
    return OcarinaBarRenderer;
}(BaseRenderer));
OcarinaBarRenderer.A_BASED_TO_POSITION = [
    0,
    0.5,
    1,
    2,
    2.5,
    3,
    3.5,
    4,
    5,
    5.5,
    6,
    6.5
];
OcarinaBarRenderer.QUARTER_TO_FRAME = [
    0, 0, 1, 2,
    3, 3, 4, 4,
    5, 5, 5, 5,
    6, 6, 6, 6,
    7
];
