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
var MusicDisplayManager = (function (_super) {
    __extends(MusicDisplayManager, _super);
    function MusicDisplayManager(game, music, width, viewportHeight) {
        var _this = _super.call(this, game) || this;
        _this.music = music;
        _this.xWidth = width;
        _this.viewportHeight = viewportHeight;
        _this.yScroll = 0;
        _this.vMargin = 0;
        _this.background = _this.game.add.image(0, -_this.vMargin, "sprites", "rectangle", _this);
        _this.background.width = width;
        _this.background.height = viewportHeight + _this.vMargin * 2;
        _this.background.anchor.setTo(0, 0);
        _this.background.events.onInputDown.add(_this.clickHandler, _this);
        _this.background.inputEnabled = true;
        _this.createBarRenders();
        _this.createCursor();
        _this.moveCursor(0, 0);
        _this.reformat();
        _this.scrollToBar = 0;
        _this.onClick = new Phaser.Signal();
        return _this;
    }
    MusicDisplayManager.prototype.update = function () {
        var height = this.renderer[this.scrollToBar].getHeight();
        var reqdScroll = this.renderer[this.scrollToBar].y + this.yScroll;
        if (this.viewportHeight >= height * 3) {
            reqdScroll -= this.viewportHeight / 2 - height / 2;
        }
        reqdScroll = Math.max(0, reqdScroll);
        if (reqdScroll != this.yScroll) {
            var dir = (reqdScroll > this.yScroll) ? 1 : -1;
            var step = 1000 * this.game.time.elapsed / 1000;
            this.yScroll += dir * Math.min(step, Math.abs(this.yScroll - reqdScroll));
            this.reformat();
        }
    };
    MusicDisplayManager.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.renderer = this.music = this.background = this.cursor = null;
        this.onClick = null;
    };
    MusicDisplayManager.prototype.clickHandler = function (object, pointer) {
        var x = pointer.x - this.x;
        var y = pointer.y - this.y;
        for (var n = 0; n < this.music.count; n++) {
            var br = this.renderer[n];
            if (x > br.x && y > br.y) {
                if (x < br.x + br.getWidth() && y < br.y + br.getHeight()) {
                    var nn = br.xPosToNote(x - br.x);
                    if (nn >= 0) {
                        this.onClick.dispatch(n, nn);
                    }
                }
            }
        }
    };
    MusicDisplayManager.prototype.createBarRenders = function () {
        this.renderer = [];
        for (var n = 0; n < this.music.count; n++) {
            this.renderer[n] = new BarRenderer(this.game, this.music.bar[n]);
            this.add(this.renderer[n]);
        }
    };
    MusicDisplayManager.prototype.scrollToView = function (barNumber) {
        this.scrollToBar = barNumber;
    };
    MusicDisplayManager.prototype.toHome = function () { this.scrollToView(0); };
    MusicDisplayManager.prototype.toEnd = function () { this.scrollToView(this.music.count - 1); };
    MusicDisplayManager.prototype.moveCursor = function (barNumber, noteNumber) {
        barNumber = Math.max(0, Math.min(barNumber, this.music.count - 1));
        if (noteNumber < 0 || noteNumber >= this.music.bar[barNumber].count) {
            console.log("Bad note number ?");
        }
        this.barCursor = barNumber;
        this.noteCursor = noteNumber;
        this.updateCursorPosition();
    };
    MusicDisplayManager.prototype.updateCursorPosition = function () {
        this.renderer[this.barCursor].positionCursor(this.noteCursor, this.cursorImg);
        this.cursorImg.visible = this.renderer[this.barCursor].visible;
    };
    MusicDisplayManager.prototype.reformat = function () {
        var hMargin = 16;
        var x = hMargin;
        var y = -Math.round(this.yScroll);
        this.yHeight = this.renderer[0].getHeight();
        for (var n = 0; n < this.music.count; n++) {
            if (x + this.renderer[n].getWidth() > this.xWidth - hMargin) {
                x = hMargin;
                y = y + this.renderer[n].getHeight();
                this.yHeight += this.renderer[n].getHeight();
            }
            this.renderer[n].position.setTo(x, y);
            this.renderer[n].visible = true;
            if (y + this.renderer[n].getHeight() > this.viewportHeight || y < 0) {
                this.renderer[n].visible = false;
            }
            x = x + this.renderer[n].getWidth();
        }
        this.updateCursorPosition();
    };
    MusicDisplayManager.prototype.createCursor = function () {
        this.cursorImg = this.game.add.image(0, 0, "sprites", "rectangle", this);
        this.cursorImg.width = BarRenderer.xStep * 0.6;
        this.cursorImg.height = BarRenderer.barHeight * 0.6;
        this.cursorImg.anchor.setTo(0.5, 0.5);
        this.cursorImg.tint = 0x008080;
        this.cursorImg.alpha = 0.4;
    };
    return MusicDisplayManager;
}(Phaser.Group));
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
        this.music.load(this.game.cache.getJSON("music"), new Instrument(this.game.cache.getJSON("instrument")));
        var tabsheet = new TabSheet(this.game, this.music, this.game.width, this.game.height);
        this.game.add.existing(tabsheet);
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
        _this.state.add("IPreload", new InstrumentPreloadState());
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
        this.game.state.start("IPreload");
    };
    return BootState;
}(Phaser.State));
var ControlPanel = (function (_super) {
    __extends(ControlPanel, _super);
    function ControlPanel(game, displayManager, player) {
        var _this = _super.call(this, game) || this;
        _this.count = 0;
        _this.manager = displayManager;
        _this.player = player;
        _this.addButton("RST", new Button(game, "i_restart")).onPress.add(function (btn) {
            _this.manager.moveCursor(0, 0);
            _this.manager.scrollToView(0);
            _this.player.moveTo(0, 0);
        }, _this);
        _this.addButton("SLO", new Button(game, "i_slower")).onPress.add(function (btn) {
            _this.player.bpsAdjust -= 10;
        }, _this);
        _this.addButton("NRM", new Button(game, "i_normal")).onPress.add(function (btn) {
            _this.player.bpsAdjust = 0;
        }, _this);
        _this.addButton("FST", new Button(game, "i_faster")).onPress.add(function (btn) {
            _this.player.bpsAdjust += 10;
        }, _this);
        _this.addButton("PAU", new ToggleButton(game, "i_stop", "i_play")).onPress.add(function (btn) {
            _this.player.isPaused = !btn.isOn;
        }, _this);
        _this.addButton("MUS", new ToggleButton(game, "i_music_off", "i_music_on")).onPress.add(function (btn) {
            _this.player.isTuneOn = btn.isOn;
        }, _this);
        _this.addButton("MET", new ToggleButton(game, "i_metronome_off", "i_metronome_on")).onPress.add(function (btn) {
            _this.player.isMetronomeOn = btn.isOn;
        }, _this);
        return _this;
    }
    ControlPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.manager = this.player = null;
    };
    ControlPanel.prototype.addButton = function (key, button) {
        button.height = button.width = button.game.width / 16;
        button.x = (this.count + 0.5) * (button.width + 10);
        button.y = 0;
        this.add(button);
        this.count++;
        return button;
    };
    return ControlPanel;
}(Phaser.Group));
var MusicPlayer = (function (_super) {
    __extends(MusicPlayer, _super);
    function MusicPlayer(game, music, firstNote, lastNote) {
        var _this = _super.call(this, game) || this;
        _this.music = music;
        _this.firstNote = firstNote;
        _this.lastNote = lastNote;
        _this.metronome = _this.game.add.audio("metronome");
        _this.isPaused = false;
        _this.bpsAdjust = 0.0;
        _this.onPlayNote = new Phaser.Signal();
        _this.isTuneOn = _this.isMetronomeOn = true;
        _this.moveTo(0, 0);
        _this.speed = _this.game.add.bitmapText(0, 0, "7seg", "000", 96, _this);
        _this.noteInstance = [];
        for (var n = firstNote; n <= lastNote; n++) {
            _this.noteInstance[n] = _this.game.add.audio(n.toString());
        }
        return _this;
    }
    MusicPlayer.prototype.destroy = function () {
        this.music = null;
        this.metronome.destroy();
        this.metronome = null;
        this.speed = null;
        for (var _i = 0, _a = this.noteInstance; _i < _a.length; _i++) {
            var ni = _a[_i];
            if (ni != null) {
                ni.destroy();
            }
        }
        this.noteInstance = null;
        _super.prototype.destroy.call(this);
    };
    MusicPlayer.prototype.update = function () {
        if (!this.isPaused) {
            var oldMillibeat = this.millibeat;
            var elapsed = this.game.time.elapsed / 1000;
            var bps = (this.music.beatsPerMinute + this.bpsAdjust);
            bps = Math.min(Math.max(20, bps), 240);
            this.speed.text = ("000" + bps.toString()).slice(-3);
            var mbElapsed = elapsed * bps / 60 * 1000 / this.music.beats;
            this.millibeat = this.millibeat + Math.round(mbElapsed);
            if (!this.endOfTune && this.bar == this.nextNoteBar) {
                if (this.millibeat >= this.music.bar[this.bar].note[this.nextNoteNumber].time) {
                    this.onPlayNote.dispatch(this.bar, this.nextNoteNumber, this.music.bar[this.bar].note[this.nextNoteNumber]);
                    if (this.isTuneOn) {
                        this.playChord(this.music.bar[this.bar].note[this.nextNoteNumber].chromaticOffsets);
                    }
                    this.nextNoteNumber++;
                    if (this.nextNoteNumber == this.music.bar[this.bar].count) {
                        var foundNext = false;
                        while ((!foundNext) && this.nextNoteBar < this.music.count - 1) {
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
            if (this.millibeat >= 1000) {
                this.millibeat = 0;
                this.bar++;
            }
            var beatMB = Math.round(1000 / this.music.beats);
            if (Math.floor(this.millibeat / beatMB) != Math.floor(oldMillibeat / beatMB)) {
                if (this.isMetronomeOn) {
                    this.metronome.play();
                }
            }
        }
    };
    MusicPlayer.prototype.setPause = function (isPaused) {
        this.isPaused = isPaused;
    };
    MusicPlayer.prototype.moveTo = function (bar, note) {
        this.bar = bar;
        this.millibeat = this.music.bar[bar].note[note].time;
        if (this.bar >= this.music.count) {
            this.endOfTune = true;
            return;
        }
        this.nextNoteBar = bar;
        this.nextNoteNumber = 0;
        var found = false;
        while ((!found) && this.nextNoteBar <= this.music.count) {
            var bn = this.nextNoteBar;
            if (this.music.bar[bn].count > 0) {
                for (var n = 0; n < this.music.bar[bn].count; n++) {
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
    };
    MusicPlayer.prototype.playChord = function (offset) {
        for (var v = 0; v < this.music.instrument.getVoices(); v++) {
            if (offset[v] >= 0) {
                var note = offset[v] + this.music.instrument.getTuning()[v];
                this.noteInstance[note].stop();
                this.noteInstance[note].play();
            }
        }
    };
    return MusicPlayer;
}(Phaser.Group));
var InstrumentPreloadState = (function (_super) {
    __extends(InstrumentPreloadState, _super);
    function InstrumentPreloadState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InstrumentPreloadState.prototype.preload = function () {
        var _this = this;
        var musicInfo = this.game.cache.getJSON("music");
        this.game.load.json("instrument", "assets/instruments/" + musicInfo["type"] + ".json");
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Preload", true, false, 1); }, this);
    };
    return InstrumentPreloadState;
}(Phaser.State));
var PreloadState = (function (_super) {
    __extends(PreloadState, _super);
    function PreloadState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PreloadState.prototype.preload = function () {
        var _this = this;
        this.game.stage.backgroundColor = "#000000";
        var loader = this.add.sprite(this.game.width / 2, this.game.height / 2, "loader");
        loader.width = this.game.width * 9 / 10;
        loader.height = this.game.height / 8;
        loader.anchor.setTo(0.5);
        this.game.load.setPreloadSprite(loader);
        var musicInfo = this.game.cache.getJSON("music");
        var instrumentInfo = this.game.cache.getJSON("instrument");
        var soundSet = instrumentInfo["soundset"];
        console.log(soundSet);
        PreloadState.NOTE_COUNT = 48;
        this.game.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
        this.game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");
        this.game.load.bitmapFont("7seg", "assets/fonts/7seg.png", "assets/fonts/7seg.fnt");
        for (var i = 1; i <= PreloadState.NOTE_COUNT; i++) {
            var sound = soundSet + "/" + (i.toString());
            this.game.load.audio(i.toString(), ["assets/sounds/" + sound + ".mp3", "assets/sounds/" + sound + ".ogg"]);
        }
        this.game.load.audio("metronome", ["assets/sounds/metronome.mp3", "assets/sounds/metronome.ogg"]);
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
PreloadState.NOTE_COUNT = 48;
var BarRenderer = (function (_super) {
    __extends(BarRenderer, _super);
    function BarRenderer(game, bar) {
        var _this = _super.call(this, game) || this;
        _this.bar = bar;
        _this.draw();
        return _this;
    }
    BarRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.bar = null;
    };
    BarRenderer.prototype.getWidth = function () {
        return (this.bar.count + 0.5) * BarRenderer.xStep;
    };
    BarRenderer.prototype.getHeight = function () {
        return BarRenderer.barHeight;
    };
    BarRenderer.prototype.draw = function () {
        this.yStaveHeight = BarRenderer.barHeight * 0.7;
        this.yBarBottom = BarRenderer.barHeight * 0.95;
        var img;
        for (var n = 0; n < this.bar.music.voices; n++) {
            img = this.game.add.image(0, this.getYString(n), "sprites", "rectangle", this);
            img.tint = 0x000000;
            img.anchor.setTo(0, 0.5);
            img.width = this.getWidth();
            img.height = Math.max(1, this.yStaveHeight / 32);
        }
        for (var n = 0; n < 2; n++) {
            img = this.game.add.image(n * this.getWidth(), this.getYString(0), "sprites", "rectangle", this);
            img.tint = 0x000000;
            img.anchor.setTo(0.5, 0);
            img.width = Math.max(1, this.yStaveHeight / 16);
            img.height = this.getYString(this.bar.music.voices - 1) - this.getYString(0);
        }
        for (var n = 0; n < this.bar.count; n++) {
            this.drawNote(n);
        }
        var crotchet = Math.floor(1000 / this.bar.music.beats / 2) + 1;
        var n = 0;
        while (n < this.bar.count) {
            if (this.bar.note[n].len < crotchet) {
                var start = n;
                while (n != this.bar.count && this.bar.note[n].len < crotchet) {
                    n++;
                }
                n--;
                this.connectNotes(start, n);
            }
            n = n + 1;
        }
        if (BarRenderer.DEBUG) {
            img = this.game.add.image(0, 0, "sprites", "frame", this);
            img.width = this.getWidth();
            img.height = this.getHeight();
            img.tint = 0xFF0000;
            img.alpha = 0.3;
        }
    };
    BarRenderer.prototype.drawNote = function (n) {
        var isRest = true;
        for (var str = 0; str < this.bar.music.voices; str++) {
            if (this.bar.note[n].chromaticOffsets[str] != Note.NO_STRUM) {
                isRest = false;
            }
        }
        if (isRest) {
            return;
        }
        var img = this.game.add.image(this.getXNote(n), this.getYString(this.bar.music.voices - 0.5), "sprites", "rectangle", this);
        img.width = Math.max(1, this.yStaveHeight / 32);
        img.height = this.yBarBottom - img.y;
        img.anchor.setTo(0.5, 0);
        img.tint = 0x000000;
        for (var str = 0; str < this.bar.music.voices; str++) {
            var note = this.bar.note[n].chromaticOffsets[str];
            if (note != Note.NO_STRUM) {
                var s = this.bar.music.instrument.getDisplayedFretForChromatic(note);
                if (s.slice(-1) == '+') {
                    s = s.slice(0, -1) + "plus";
                }
                img = this.game.add.image(this.getXNote(n), this.getYString(str), "sprites", s, this);
                img.anchor.setTo(0.5, 0.5);
                img.width = BarRenderer.xStep * 0.7;
                img.height = (this.getYString(1) - this.getYString(0)) * 0.8;
            }
        }
        if (this.bar.note[n].len >= Math.floor(1000 * 2 / this.bar.music.beats)) {
            var crc = this.game.add.image(img.x, img.y, "sprites", "circle", this);
            crc.tint = 0x000000;
            crc.anchor.setTo(0.5, 0.5);
            crc.width = crc.height = this.getHeight() * 0.25;
        }
    };
    BarRenderer.prototype.connectNotes = function (first, last) {
        if (first == last) {
            if (first > 0) {
                this.drawConnection(first - 0.5, first, this.bar.note[first].len);
            }
            else {
                this.drawConnection(first, first + 0.5, this.bar.note[first].len);
            }
            return;
        }
        var shortestNote = 1000;
        var allSameLength = true;
        for (var n = first; n <= last; n++) {
            shortestNote = Math.min(shortestNote, this.bar.note[n].len);
            if (Math.abs(this.bar.note[first].len - this.bar.note[n].len) > 3) {
                allSameLength = false;
            }
        }
        if (allSameLength) {
            this.drawConnection(first, last, shortestNote);
            return;
        }
        this.drawConnection(first, last, 1000 / this.bar.music.beats / 2);
        var n = first;
        while (n <= last) {
            if (Math.abs(this.bar.note[n].len - 1000 / this.bar.music.beats / 4) < 3) {
                var isNext = false;
                var isPrev = false;
                if (n < last) {
                    if (Math.abs(this.bar.note[n + 1].len - 1000 / this.bar.music.beats / 4) < 3) {
                        isNext = true;
                    }
                }
                if (n > first) {
                    if (Math.abs(this.bar.note[n - 1].len - 1000 / this.bar.music.beats / 4) < 3) {
                        isPrev = true;
                    }
                }
                if (!isPrev) {
                    if (isNext) {
                        this.drawConnection(n, n + 1, this.bar.note[n].len);
                    }
                    else {
                        this.drawConnection(n - 0.5, n, this.bar.note[n].len);
                    }
                }
            }
            n++;
        }
    };
    BarRenderer.prototype.drawConnection = function (start, end, length) {
        var isDouble = (Math.abs(length - 1000 / this.bar.music.beats / 4) < 3);
        this.drawConnectingBar(start, end, this.yBarBottom);
        if (isDouble) {
            this.drawConnectingBar(start, end, this.yBarBottom - this.yStaveHeight / 8);
        }
    };
    BarRenderer.prototype.drawConnectingBar = function (start, end, y) {
        start = this.getXNote(start);
        end = this.getXNote(end);
        var img = this.game.add.image(start, y, "sprites", "rectangle", this);
        img.tint = 0x000000;
        img.anchor.setTo(0, 1);
        img.width = end - start;
        img.height = this.yStaveHeight / 16;
    };
    BarRenderer.prototype.positionCursor = function (pos, object) {
        var x = this.x + this.getXNote(pos);
        var y = this.y + this.yStaveHeight / 2;
        object.bringToTop();
        object.x = x;
        object.y = y;
    };
    BarRenderer.prototype.getXNote = function (n) {
        return Math.round((n + 0.75) * BarRenderer.xStep);
    };
    BarRenderer.prototype.xPosToNote = function (x) {
        var result = -1;
        for (var n = 0; n < this.bar.count; n++) {
            if (x >= this.getXNote(n - 0.5) && x < this.getXNote(n + 0.5)) {
                result = n;
            }
        }
        return result;
    };
    BarRenderer.prototype.getYString = function (str) {
        return (str + 1) * this.yStaveHeight / (this.bar.music.voices + 1);
    };
    return BarRenderer;
}(Phaser.Group));
BarRenderer.barHeight = 200;
BarRenderer.xStep = 64;
BarRenderer.DEBUG = false;
var TabSheet = (function (_super) {
    __extends(TabSheet, _super);
    function TabSheet(game, music, width, height) {
        var _this = _super.call(this, game) || this;
        _this.music = music;
        _this.manager = new MusicDisplayManager(_this.game, _this.music, width, height);
        _this.add(_this.manager);
        _this.manager.x = 0;
        _this.manager.y = 0;
        _this.player = new MusicPlayer(_this.game, _this.music, 1, PreloadState.NOTE_COUNT);
        _this.add(_this.player);
        _this.manager.onClick.add(function (bar, note) {
            _this.manager.moveCursor(bar, note);
            _this.manager.scrollToView(bar);
            _this.player.moveTo(bar, note);
        }, _this);
        _this.player.onPlayNote.add(function (bar, noteNumber, note) {
            _this.manager.moveCursor(bar, noteNumber);
            _this.manager.scrollToView(bar);
        });
        var pnl = new ControlPanel(_this.game, _this.manager, _this.player);
        _this.add(pnl);
        pnl.scale.x = pnl.scale.y = width * 0.7 / pnl.width;
        pnl.x = 0;
        pnl.y = pnl.height / 2;
        _this.manager.y = pnl.height;
        _this.player.scale.x = _this.player.scale.y = pnl.height * 0.9 / _this.player.height;
        _this.player.x = width - _this.player.width;
        _this.player.y = pnl.height / 2 - _this.player.height / 2;
        return _this;
    }
    TabSheet.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.manager = this.player = this.music = null;
    };
    return TabSheet;
}(Phaser.Group));
var Instrument = (function () {
    function Instrument(json) {
        this.info = json;
    }
    Instrument.prototype.getVoices = function () {
        return this.info["voices"];
    };
    ;
    Instrument.prototype.getTuning = function () {
        return this.info["tuning"];
    };
    Instrument.prototype.getVolume = function () {
        return this.info["volume"];
    };
    Instrument.prototype.isDoubleString = function (str) {
        return this.info["visualtype"][str] == 2;
    };
    Instrument.prototype.isDiatonic = function () {
        return !this.info["chromatic"];
    };
    Instrument.prototype.getDisplayedFretForChromatic = function (fret) {
        if (!this.isDiatonic()) {
            return fret.toString();
        }
        var diatonic = Math.floor(fret / 12) * 7;
        diatonic += Instrument.DIATONIC_MAPPING[fret % 12];
        var s = Math.floor(diatonic).toString();
        if (Math.floor(diatonic) != diatonic) {
            s = s + "+";
        }
        return s;
    };
    return Instrument;
}());
Instrument.DIATONIC_MAPPING = [
    0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 6, 6.5
];
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
    Music.prototype.load = function (json, instrument) {
        this.beats = parseInt(json["beats"]);
        this.type = json["type"];
        this.musicName = json["name"] || "";
        this.authorName = json["author"] || "";
        this.instrumentName = json["instrument"] || "";
        this.beatsPerMinute = parseInt(json["speed"]);
        this.instrument = instrument;
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
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(game, image) {
        var _this = _super.call(this, game) || this;
        _this.onPress = new Phaser.Signal();
        var box = game.add.image(0, 0, "sprites", "icon_frame", _this);
        box.width = box.height = _this.game.width / 10;
        box.anchor.setTo(0.5, 0.5);
        box.inputEnabled = true;
        box.events.onInputDown.add(_this.clickHandler, _this);
        _this.icon = game.add.image(0, 0, "sprites", image, _this);
        _this.icon.width = _this.icon.height = box.height * 0.75;
        _this.icon.anchor.setTo(0.5, 0.5);
        return _this;
    }
    Button.prototype.clickHandler = function () {
        this.onPress.dispatch(this);
    };
    Button.prototype.destroy = function () {
        this.onPress = null;
        this.icon = null;
        _super.prototype.destroy.call(this);
    };
    return Button;
}(Phaser.Group));
var ToggleButton = (function (_super) {
    __extends(ToggleButton, _super);
    function ToggleButton(game, onImage, offImage) {
        var _this = _super.call(this, game, onImage) || this;
        _this.onImage = onImage;
        _this.offImage = offImage;
        _this.isOn = true;
        return _this;
    }
    ToggleButton.prototype.clickHandler = function () {
        this.isOn = !this.isOn;
        this.icon.loadTexture("sprites", this.isOn ? this.onImage : this.offImage);
        _super.prototype.clickHandler.call(this);
    };
    return ToggleButton;
}(Button));
