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
        var _this = this;
        var bgr = this.game.add.image(0, 0, "sprites", "background");
        bgr.width = this.game.width;
        bgr.height = this.game.height;
        var musd = this.game.cache.getJSON("music");
        this.music = new Music(musd);
        var dType = MainApplication.getURLName("type", "horizontal").toLowerCase();
        if (dType == "horizontal") {
            this.manager = new HorizontalManager(this.game, this.music, this.game.width, this.game.height * 0.45);
        }
        else {
            if (dType == "stab") {
                this.manager = new ScrollingTabManager(this.game, this.music, this.game.width - 40, this.game.height * 0.8);
                this.manager.x = 20;
            }
            else {
                this.manager = new StaticTabManager(this.game, this.music, this.game.width - 40, this.game.height * 0.8);
                this.manager.x = 20;
            }
        }
        this.player = MusicClassFactory.createMusicPlayer(this.game, this.music);
        this.panel = new ControlPanel(this.game, this.manager, this.player, false);
        this.panel.scale.x = this.panel.scale.y = this.game.height / 10 / this.panel.height;
        this.panel.x = this.panel.y = 10;
        this.player.height = this.panel.height;
        this.player.width = this.panel.height * 2;
        this.player.x = this.game.width - 15 - this.player.width / 2;
        this.player.y = this.panel.y + this.panel.height / 2;
        if (dType == "horizontal") {
            this.manager.x = 0;
            this.manager.y = this.game.height - this.manager.height - 20;
        }
        else {
            this.manager.y = this.panel.bottom + 20;
        }
        this.player.onPositionUpdate.add(function (obj, bar, millibeats) {
            _this.manager.moveCursor(bar, millibeats);
        }, this);
        this.manager.onSelect.add(function (obj, bar, millibeats, note) {
            _this.player.moveTo(bar, note);
        }, this);
    };
    GameState.prototype.destroy = function () {
        this.music = null;
        this.player = null;
        this.panel = null;
        this.music = null;
    };
    GameState.prototype.update = function () {
    };
    return GameState;
}(Phaser.State));
window.onload = function () {
    var game = MusicClassFactory.createApplication();
};
var MainApplication = (function (_super) {
    __extends(MainApplication, _super);
    function MainApplication() {
        var _this = _super.call(this, SetupPhaserInformation.WIDTH, SetupPhaserInformation.HEIGHT, Phaser.AUTO, "", null, false, false) || this;
        _this.state.add("Boot", MusicClassFactory.createBootState());
        _this.state.add("Preload", MusicClassFactory.createPreloadState());
        _this.addExtraStates();
        _this.state.add("Main", _this.getMainState());
        _this.state.start("Boot");
        return _this;
    }
    MainApplication.getURLName = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = ""; }
        var name = decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key.toLowerCase()).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        return (name == "") ? defaultValue : name;
    };
    return MainApplication;
}(Phaser.Game));
var BootState = (function (_super) {
    __extends(BootState, _super);
    function BootState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BootState.prototype.preload = function () {
        var _this = this;
        this.game.load.image("loader", "assets/sprites/loader.png");
        this.preloadInBootState(MainApplication.getURLName("music", "music.json"));
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Preload", true, false, 1); }, this);
    };
    BootState.prototype.preloadInBootState = function (musicName) { };
    BootState.prototype.create = function () {
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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
        this.game.stage.backgroundColor = "#000000";
        var loader = this.add.sprite(this.game.width / 2, this.game.height / 2, "loader");
        loader.width = this.game.width * 9 / 10;
        loader.height = this.game.height / 8;
        loader.anchor.setTo(0.5);
        this.game.load.setPreloadSprite(loader);
        PreloadState.NOTE_COUNT = this.getNoteCount();
        this.game.load.atlas("sprites", "assets/sprites/sprites.png", "assets/sprites/sprites.json");
        for (var _i = 0, _a = this.getFontList(); _i < _a.length; _i++) {
            var fontName = _a[_i];
            this.game.load.bitmapFont(fontName, "assets/fonts/" + fontName + ".png", "assets/fonts/" + fontName + ".fnt");
        }
        var noteDir = this.getNoteDirectory();
        for (var i = 1; i <= PreloadState.NOTE_COUNT; i++) {
            var sound = i.toString();
            this.game.load.audio(sound, [noteDir + "/" + sound + ".mp3", noteDir + "/" + sound + ".ogg"]);
        }
        this.game.load.audio("metronome", ["assets/sounds/metronome.mp3",
            "assets/sounds/metronome.ogg"]);
        for (var _b = 0, _c = this.getAudioList(); _b < _c.length; _b++) {
            var audioName = _c[_b];
            this.game.load.audio(audioName, ["assets/sounds/" + audioName + ".mp3",
                "assets/sounds/" + audioName + ".ogg"]);
        }
        this.loadOtherResources(MainApplication.getURLName("music", "music.json"));
        this.game.load.onLoadComplete.add(function () { _this.game.state.start("Main", true, false, 1); }, this);
    };
    return PreloadState;
}(Phaser.State));
var StaticTabManager = (function (_super) {
    __extends(StaticTabManager, _super);
    function StaticTabManager(game, music, width, height) {
        if (width === void 0) { width = null; }
        if (height === void 0) { height = null; }
        var _this = _super.call(this, game) || this;
        _this.drawWidth = width || game.width;
        _this.drawHeight = height || game.height;
        _this.music = music;
        _this.onSelect = new Phaser.Signal();
        _this.renderer = null;
        _this.fitToArea();
        _this.redrawAll();
        _this.layout();
        _this.controlGraphics();
        return _this;
    }
    StaticTabManager.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.musicCursor = this.onSelect = this.music = this.renderer = null;
    };
    StaticTabManager.prototype.getHeight = function () {
        return this.drawHeight;
    };
    StaticTabManager.prototype.redrawAll = function () {
        if (this.renderer == null) {
            this.renderer = [];
            for (var n = 0; n < this.music.count; n++) {
                this.renderer[n] = new TabRenderer(this.game, this.music.bar[n], this.tabWidth, this.tabHeight);
                this.add(this.renderer[n]);
            }
        }
        else {
            for (var n = 0; n < this.music.count; n++) {
                this.renderer[n].renderBar();
            }
        }
    };
    StaticTabManager.prototype.moveCursorToNote = function (bar, note) {
        this.musicCursor.x = this.renderer[bar].x + this.renderer[bar].getX(note);
        this.musicCursor.y = this.renderer[bar].y;
    };
    StaticTabManager.prototype.moveCursor = function (bar, millibeat) {
        var targetNote = 0;
        for (var i = 0; i < this.music.bar[bar].count; i++) {
            if (millibeat >= this.music.bar[bar].note[i].mbTime) {
                targetNote = i;
            }
        }
        this.moveCursorToNote(bar, targetNote);
    };
    StaticTabManager.prototype.controlGraphics = function () {
        var img = this.game.add.image(0, 0, "sprites", "rectangle", this);
        img.width = this.drawWidth;
        img.height = this.drawHeight;
        img.inputEnabled = true;
        img.events.onInputDown.add(this.clickHandler, this);
        img.sendToBack();
        this.musicCursor = this.game.add.image(0, 0, "sprites", "rectangle", this);
        this.musicCursor.tint = 0x0040C0;
        this.musicCursor.alpha = 0.35;
        this.musicCursor.anchor.setTo(0.5, 0);
        this.musicCursor.width = this.tabWidth;
        this.musicCursor.height = this.tabHeight;
        this.moveCursorToNote(0, 0);
    };
    StaticTabManager.prototype.clickHandler = function (obj, ptr) {
        var x = ptr.x - this.x;
        var y = ptr.y - this.y;
        for (var bar = 0; bar < this.music.count; bar++) {
            var b = this.renderer[bar];
            if (x >= b.x && y >= b.y && x < b.x + b.getWidth() && y < b.y + b.getHeight()) {
                var note = b.getNote(x - b.x);
                this.onSelect.dispatch(this, bar, this.music.bar[bar].note[note].mbTime, note);
                this.moveCursor(bar, this.music.bar[bar].note[note].mbTime);
            }
        }
    };
    StaticTabManager.prototype.fitToArea = function () {
        var fitted = false;
        this.tabWidth = 128;
        while (!fitted) {
            this.tabHeight = Math.round(this.tabWidth * 2.8);
            if (this.calculateHeight(this.tabWidth, this.tabHeight) < this.drawHeight) {
                fitted = true;
            }
            else {
                this.tabWidth = Math.round(this.tabWidth / 1.04);
            }
        }
    };
    StaticTabManager.prototype.layout = function () {
        var x = 0;
        var y = 0;
        for (var b = 0; b < this.music.count; b++) {
            var width = this.renderer[b].getWidth();
            if (x + width > this.drawWidth) {
                x = 0;
                y = y + this.renderer[b].getHeight();
            }
            this.renderer[b].x = x;
            this.renderer[b].y = y;
            x = x + width;
        }
        this.totalHeight = y + this.renderer[0].getHeight();
    };
    StaticTabManager.prototype.calculateHeight = function (noteSize, height) {
        var x = 0;
        var y = 0;
        for (var b = 0; b < this.music.count; b++) {
            var width = noteSize * (this.music.bar[b].count + 0.5);
            if (width > this.drawWidth) {
                return 999999;
            }
            if (x + width > this.drawWidth) {
                x = 0;
                y = y + height;
            }
            x = x + width;
        }
        return y + height - 1;
    };
    return StaticTabManager;
}(Phaser.Group));
var HorizontalManager = (function (_super) {
    __extends(HorizontalManager, _super);
    function HorizontalManager(game, music, width, height) {
        if (width === void 0) { width = null; }
        if (height === void 0) { height = null; }
        var _this = _super.call(this, game) || this;
        _this.drawWidth = width || game.width;
        _this.drawHeight = height || game.height;
        _this.music = music;
        _this.onSelect = new Phaser.Signal();
        _this.sphere = game.add.image(0, 0, "sprites", "sphere_red", _this);
        _this.sphere.anchor.setTo(0.5, 1);
        _this.sphere.height = _this.sphere.width = _this.drawHeight / 8;
        _this.barWidth = _this.drawWidth / 2.2;
        _this.renderer = [];
        for (var n = 0; n < _this.music.count; n++) {
            var rnd = new HorizontalScrollRenderer(game, music.bar[n], music, _this.barWidth, _this.drawHeight);
            _this.add(rnd);
            rnd.visible = false;
            _this.renderer[n] = rnd;
        }
        _this.renderer[-1] = new HorizontalScrollRenderer(game, null, music, _this.barWidth, _this.drawHeight);
        _this.add(_this.renderer[-1]);
        _this.sphere.bringToTop();
        _this.moveCursor(0, 0);
        return _this;
    }
    HorizontalManager.prototype.getHeight = function () {
        return this.drawHeight;
    };
    HorizontalManager.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.music = null;
        this.onSelect = null;
        this.sphere = null;
    };
    HorizontalManager.prototype.moveCursor = function (bar, millibeat) {
        millibeat = Math.round(millibeat);
        for (var n = -1; n < this.music.count; n++) {
            var x = this.drawWidth * 0.2 + (n - bar - millibeat / 1000) * this.barWidth;
            this.renderer[n].x = x;
            this.renderer[n].y = 0;
            var isVisible = true;
            if (x + this.barWidth < 0) {
                isVisible = false;
            }
            if (x > this.drawWidth) {
                isVisible = false;
            }
            this.renderer[n].visible = isVisible;
        }
        this.renderer[bar].positionSphere(this.sphere, millibeat);
    };
    return HorizontalManager;
}(Phaser.Group));
HorizontalManager.DEBUG = false;
var MusicPlayer = (function (_super) {
    __extends(MusicPlayer, _super);
    function MusicPlayer(game, music) {
        var _this = _super.call(this, game) || this;
        _this.music = music;
        if (_this.music.count == 0) {
            throw new Error("Cannot play empty music object");
        }
        _this.createDisplay();
        _this.onPositionUpdate = new Phaser.Signal();
        _this.resetTempo();
        _this.setPause(false);
        _this.setMetronome(true);
        _this.setInstrument(true);
        _this.moveTo(0, 0);
        _this.metronomeSound = _this.game.add.audio("metronome");
        _this.stringSound = [];
        var tuning = _this.getTuning();
        for (var n = 0; n < _this.music.voices; n++) {
            _this.stringSound[n] = _this.loadInstrument(tuning[n]);
        }
        return _this;
    }
    MusicPlayer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.music = null;
        this.onPositionUpdate = null;
        this.speedDisplay = null;
    };
    MusicPlayer.prototype.createDisplay = function () {
        var img = this.game.add.image(0, 0, "sprites", "rectangle", this);
        img.anchor.setTo(0.5, 0.5);
        img.tint = 0xC0C0C0;
        img.width = 200;
        img.height = 100;
        this.speedDisplay = this.game.add.bitmapText(0, 0, "7seg", "888", img.height, this);
        this.speedDisplay.tint = 0xFF0000;
        this.speedDisplay.anchor.setTo(0.5, 0.4);
    };
    MusicPlayer.prototype.updateTempo = function () {
        var s = "00" + Math.floor(this.tempo).toString();
        this.speedDisplay.setText(s.slice(-3));
    };
    MusicPlayer.prototype.loadInstrument = function (baseNote) {
        var sounds = [];
        for (var offset = 0; offset < 20; offset++) {
            var soundName = (baseNote + offset).toString();
            sounds.push(this.game.add.audio(soundName));
        }
        return sounds;
    };
    MusicPlayer.prototype.update = function () {
        var elapsed = this.game.time.elapsedMS / 1000;
        var beats = this.tempo / 60 * 1000 / this.music.beats;
        elapsed = Math.round(elapsed * beats);
        if (this.isInstrumentOn && !this.isPaused) {
            var bar = this.music.bar[this.barPosition];
            for (var n = 0; n < bar.count; n++) {
                var time = bar.note[n].mbTime;
                if (this.mbPosition >= time && this.mbPosition < time + elapsed) {
                    for (var v = 0; v < this.music.voices; v++) {
                        var note = bar.note[n].chromaticOffset[v];
                        if (note != Note.QUIET) {
                            this.stringSound[v][note].play();
                        }
                    }
                }
            }
        }
        if (this.isMetronomeOn && !this.isPaused) {
            var mbPerBeat = 1000 / this.music.beats;
            var b1 = Math.floor(this.mbPosition / mbPerBeat);
            var b2 = Math.floor((this.mbPosition + elapsed) / mbPerBeat);
            if (b1 != b2 || this.mbPosition == 0) {
                this.metronomeSound.play();
            }
        }
        if (!this.isPaused) {
            this.mbPosition += elapsed;
            if (this.mbPosition >= 1000 - 20) {
                this.mbPosition = 0;
                this.barPosition++;
                if (this.barPosition >= this.music.count) {
                    this.moveTo(0, 0);
                }
            }
        }
        if (!this.isPaused) {
            this.onPositionUpdate.dispatch(this, this.barPosition, this.mbPosition);
        }
    };
    MusicPlayer.prototype.moveTo = function (bar, mbPosition) {
        this.barPosition = bar;
        this.mbPosition = mbPosition;
        if (this.barPosition >= this.music.count) {
            this.barPosition = this.mbPosition = 0;
        }
    };
    MusicPlayer.prototype.resetTempo = function () {
        this.tempo = this.music.beatsPerMinute;
        this.updateTempo();
    };
    MusicPlayer.prototype.adjustTempo = function (adjust) {
        this.tempo += adjust;
        this.tempo = Math.max(40, this.tempo);
        this.tempo = Math.min(240, this.tempo);
        this.updateTempo();
    };
    MusicPlayer.prototype.setPause = function (isOn) {
        this.isPaused = isOn;
    };
    MusicPlayer.prototype.setMetronome = function (isOn) {
        this.isMetronomeOn = isOn;
    };
    MusicPlayer.prototype.setInstrument = function (isOn) {
        this.isInstrumentOn = isOn;
    };
    return MusicPlayer;
}(Phaser.Group));
var ScrollingTabManager = (function (_super) {
    __extends(ScrollingTabManager, _super);
    function ScrollingTabManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScrollingTabManager.prototype.fitToArea = function () {
        this.tabHeight = Math.floor(this.drawHeight / 4);
        this.tabWidth = Math.floor(this.tabHeight / 2.8);
        var altTabWidth = Math.floor(this.drawWidth / 10);
        var altTabHeight = Math.floor(altTabWidth * 2.8);
        if (Math.floor(this.drawHeight / altTabHeight) > 4) {
            this.tabHeight = altTabHeight;
            this.tabWidth = altTabWidth;
        }
    };
    ScrollingTabManager.prototype.redrawAll = function () {
        _super.prototype.redrawAll.call(this);
        for (var _i = 0, _a = this.renderer; _i < _a.length; _i++) {
            var renderer = _a[_i];
            renderer.visible = false;
        }
    };
    ScrollingTabManager.prototype.moveCursorToNote = function (bar, note) {
        this.yScroll = this.yScroll || 0;
        var realYPos = this.renderer[bar].y + this.yScroll;
        var reqScroll = Math.floor(realYPos - this.tabHeight);
        reqScroll = Math.min(reqScroll, this.totalHeight - this.drawHeight);
        reqScroll = Math.max(reqScroll, 0);
        for (var _i = 0, _a = this.renderer; _i < _a.length; _i++) {
            var renderer = _a[_i];
            renderer.y = renderer.y + this.yScroll - reqScroll;
        }
        this.yScroll = reqScroll;
        this.makeVisibleInDisplayArea();
        _super.prototype.moveCursorToNote.call(this, bar, note);
    };
    ScrollingTabManager.prototype.makeVisibleInDisplayArea = function () {
        for (var _i = 0, _a = this.renderer; _i < _a.length; _i++) {
            var renderer = _a[_i];
            renderer.visible = true;
            if (renderer.y < -2) {
                renderer.visible = false;
            }
            if (renderer.y + this.tabHeight > this.drawHeight) {
                renderer.visible = false;
            }
        }
    };
    return ScrollingTabManager;
}(StaticTabManager));
var Bar = (function () {
    function Bar(music, barNumber, beats) {
        this.note = [];
        this.count = 0;
        this.barNumber = barNumber;
        this.beats = beats;
        this.music = music;
    }
    Bar.prototype.updateMillibeatData = function () {
        if (this.count > 0) {
            for (var n = 0; n < this.count; n++) {
                this.note[n].mbTime = Math.floor(1000 / this.beats / 4 * this.note[n].quarterBeatPos);
            }
            for (var n = 0; n < this.count - 1; n++) {
                this.note[n].mbLength = this.note[n + 1].mbTime - this.note[n].mbTime;
            }
            this.note[this.count - 1].mbLength = 1000 - this.note[this.count - 1].mbTime;
        }
    };
    return Bar;
}());
var Music = (function () {
    function Music(data) {
        this.name = data["name"] || "(unknown)";
        this.author = data["author"] || "(unknown)";
        this.beats = parseInt(data["beats"] || "4", 10);
        this.beatsPerMinute = parseInt(data["speed"] || "120", 10);
        this.voices = parseInt(data["voices"] || "3", 10);
        this.tuning = (data["tuning"] || "").toLowerCase();
        this.isDiatonic = (parseInt(data["diatonic"], 10) || 0) != 0;
        this.capo = parseInt(data["capo"] || "0", 10);
        this.bar = [];
        this.count = 0;
        for (var _i = 0, _a = data["bars"]; _i < _a.length; _i++) {
            var barDef = _a[_i];
            var b = MusicClassFactory.createBar(this, this.count, this.beats);
            b.load(barDef);
            this.bar[this.count] = b;
            this.count++;
        }
    }
    return Music;
}());
var Note = (function () {
    function Note() {
        this.chromaticOffset = [];
    }
    Note.prototype.toString = function () {
        var s = "";
        for (var n = 0; n < this.chromaticOffset.length; n++) {
            s = s + this.chromaticOffset[n] + ":";
        }
        s = s + "@ " + this.mbTime.toString();
        return s;
    };
    return Note;
}());
Note.QUIET = -1;
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(game, image) {
        var _this = _super.call(this, game) || this;
        _this.onPress = new Phaser.Signal();
        _this.box = game.add.image(0, 0, "sprites", "icon_frame", _this);
        _this.stdSize = _this.game.width / 10;
        _this.box.anchor.setTo(0.5, 0.5);
        _this.box.inputEnabled = true;
        _this.box.events.onInputDown.add(_this.clickHandler, _this);
        _this.icon = game.add.image(0, 0, "sprites", image, _this);
        _this.icon.anchor.setTo(0.5, 0.5);
        _this.resetSize();
        return _this;
    }
    Button.prototype.resetSize = function () {
        this.box.width = this.box.height = this.stdSize;
        this.icon.width = this.icon.height = this.stdSize * 0.75;
    };
    Button.prototype.clickHandler = function () {
        this.onPress.dispatch(this);
        if (!this.game.tweens.isTweening(this)) {
            this.game.add.tween(this).to({ "width": this.width - 10, "height": this.height - 10 }, 50, Phaser.Easing.Bounce.In, true, 0, 0, true);
        }
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
var ControlPanel = (function (_super) {
    __extends(ControlPanel, _super);
    function ControlPanel(game, displayManager, player, isVertical) {
        if (isVertical === void 0) { isVertical = false; }
        var _this = _super.call(this, game) || this;
        _this.count = 0;
        _this.manager = displayManager;
        _this.player = player;
        _this.isVertical = isVertical;
        _this.addButton("RST", new Button(game, "i_restart")).onPress.add(function (btn) {
            _this.manager.moveCursor(0, 0);
            _this.player.moveTo(0, 0);
        }, _this);
        _this.addButton("SLO", new Button(game, "i_slower")).onPress.add(function (btn) {
            _this.player.adjustTempo(-10);
        }, _this);
        _this.addButton("NRM", new Button(game, "i_normal")).onPress.add(function (btn) {
            _this.player.resetTempo();
        }, _this);
        _this.addButton("FST", new Button(game, "i_faster")).onPress.add(function (btn) {
            _this.player.adjustTempo(10);
        }, _this);
        _this.addButton("PAU", new ToggleButton(game, "i_stop", "i_play")).onPress.add(function (btn) {
            _this.player.setPause(!btn.isOn);
        }, _this);
        _this.addButton("MUS", new ToggleButton(game, "i_music_off", "i_music_on")).onPress.add(function (btn) {
            _this.player.setInstrument(btn.isOn);
        }, _this);
        _this.addButton("MET", new ToggleButton(game, "i_metronome_off", "i_metronome_on")).onPress.add(function (btn) {
            _this.player.setMetronome(btn.isOn);
        }, _this);
        return _this;
    }
    ControlPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.manager = this.player = null;
    };
    ControlPanel.prototype.addButton = function (key, button) {
        button.height = button.width = button.game.width / 16;
        if (this.isVertical) {
            button.x = button.width / 2;
            button.y = (this.count + 0.5) * (button.width + 4);
        }
        else {
            button.x = (this.count + 0.5) * (button.width + 4);
            button.y = button.height / 2;
        }
        this.add(button);
        this.count++;
        return button;
    };
    return ControlPanel;
}(Phaser.Group));
var SetupPhaserInformation = (function () {
    function SetupPhaserInformation() {
    }
    return SetupPhaserInformation;
}());
SetupPhaserInformation.WIDTH = 1440;
SetupPhaserInformation.HEIGHT = 900;
var MyApplication = (function (_super) {
    __extends(MyApplication, _super);
    function MyApplication() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyApplication.prototype.getMainState = function () {
        return new GameState();
    };
    MyApplication.prototype.addExtraStates = function () {
    };
    return MyApplication;
}(MainApplication));
var MyBootState = (function (_super) {
    __extends(MyBootState, _super);
    function MyBootState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyBootState.prototype.preloadInBootState = function (musicName) {
        this.game.load.json("music", musicName);
    };
    return MyBootState;
}(BootState));
var MyPreloadState = (function (_super) {
    __extends(MyPreloadState, _super);
    function MyPreloadState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyPreloadState.prototype.getNoteCount = function () {
        return 37;
    };
    MyPreloadState.prototype.getNoteDirectory = function () {
        return "assets/sounds";
    };
    MyPreloadState.prototype.getFontList = function () {
        return ["font", "7seg"];
    };
    MyPreloadState.prototype.getAudioList = function () {
        return [];
    };
    MyPreloadState.prototype.loadOtherResources = function (musicName) {
    };
    return MyPreloadState;
}(PreloadState));
var MyBar = (function (_super) {
    __extends(MyBar, _super);
    function MyBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyBar.prototype.load = function (defn) {
        var p = 0;
        var qbPos = 0;
        while (p < defn.length) {
            var cc = defn.charCodeAt(p);
            if (cc >= 48 && cc <= 57) {
                qbPos += (cc - 48);
                p = p + 1;
            }
            else {
                var note = new Note();
                for (var s = 0; s < this.music.voices; s++) {
                    note.chromaticOffset[s] = defn.charCodeAt(p) - 65;
                    if (defn.charAt(p) == '-') {
                        note.chromaticOffset[s] = Note.QUIET;
                    }
                    p = p + 1;
                }
                note.quarterBeatPos = qbPos;
                this.note[this.count] = note;
                this.count++;
            }
        }
        this.updateMillibeatData();
    };
    return MyBar;
}(Bar));
var MyPlayer = (function (_super) {
    __extends(MyPlayer, _super);
    function MyPlayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MyPlayer.prototype.getTuning = function () {
        var tuning = this.music.tuning.toLowerCase();
        if (tuning == "dad") {
            tuning = "d0,a0,d1";
        }
        if (tuning == "daa") {
            tuning = "d0,a0,a0";
        }
        var tuningList = [];
        for (var _i = 0, _a = tuning.toLowerCase().split(","); _i < _a.length; _i++) {
            var baseNote = _a[_i];
            var n = MyPlayer.NOTETOINDEX[baseNote.slice(0, -1)];
            n = n + 1 + 12 * parseInt(baseNote.slice(-1), 10);
            tuningList.push(n);
        }
        return tuningList;
    };
    MyPlayer.prototype.getStringVolume = function (str) {
        return (str == 2 ? 100 : 50);
    };
    return MyPlayer;
}(MusicPlayer));
MyPlayer.NOTETOINDEX = {
    "c": 0, "c#": 1, "d": 2, "d#": 3, "e": 4, "f": 5, "f#": 6, "g": 7, "g#": 8, "a": 9, "a#": 10, "b": 11
};
var MusicClassFactory = (function () {
    function MusicClassFactory() {
    }
    MusicClassFactory.createBar = function (music, barNumber, beats) {
        return new MyBar(music, barNumber, beats);
    };
    MusicClassFactory.createApplication = function () {
        return new MyApplication();
    };
    MusicClassFactory.createBootState = function () {
        return new MyBootState();
    };
    MusicClassFactory.createPreloadState = function () {
        return new MyPreloadState();
    };
    MusicClassFactory.createMusicPlayer = function (game, music, firstNote, lastNote) {
        if (firstNote === void 0) { firstNote = 1; }
        if (lastNote === void 0) { lastNote = PreloadState.NOTE_COUNT; }
        return new MyPlayer(game, music);
    };
    return MusicClassFactory;
}());
var HorizontalScrollRenderer = (function (_super) {
    __extends(HorizontalScrollRenderer, _super);
    function HorizontalScrollRenderer(game, bar, music, width, height) {
        var _this = _super.call(this, game) || this;
        _this.rWidth = width;
        _this.rHeight = height;
        _this.bar = bar;
        _this.music = music;
        _this.curveHeight = 0.3 * _this.rHeight;
        _this.renderBar();
        return _this;
    }
    HorizontalScrollRenderer.prototype.renderBar = function () {
        var bgr = this.game.add.image(0, 0, "sprites", "rectangle", this);
        bgr.width = this.rWidth;
        bgr.height = this.rHeight * 0.9;
        bgr.tint = 0x303030;
        var bgr2 = this.game.add.image(0, bgr.bottom, "sprites", "rectangle", this);
        bgr2.height = this.rHeight - bgr.height;
        bgr2.width = this.width;
        bgr2.tint = 0x000000;
        for (var n = 0; n <= this.music.beats; n++) {
            var vbr = this.game.add.image(this.rWidth * n / this.music.beats, 0, "sprites", "rectangle", this);
            vbr.width = Math.max(2, this.rWidth / 128);
            vbr.height = bgr.height;
            vbr.tint = 0x00000;
            vbr.anchor.setTo(0.5, 0);
            if (n == 0 || n == this.music.beats) {
                vbr.tint = 0xFFD700;
                vbr.width *= 2;
                vbr.anchor.setTo(n == 0 ? 0 : 1, 0);
            }
        }
        var c = (this.music.voices == 3) ? 4 : this.music.voices;
        for (var s = 0; s < c; s++) {
            var str = this.game.add.image(0, this.yString(s), "sprites", "rectangle", this);
            str.width = this.rWidth;
            str.anchor.setTo(0, 0.5);
            str.tint = 0xE0DFDB;
            if (this.music.voices != 3) {
                str.height = this.rHeight / 64 + s;
            }
            else {
                str.height = this.rHeight / 64 + (this.music.voices - s);
                if (s == 3) {
                    str.y = this.yString(2) - str.height * 2;
                    str.height += 2;
                }
            }
            var ss = this.game.add.image(0, str.bottom, "sprites", "rectangle", this);
            ss.width = this.rWidth;
            ss.height = this.rHeight / 128;
            ss.tint = 0x000000;
        }
        if (this.bar != null) {
            this.drawNotes();
        }
        var dbg = this.game.add.image(0, 0, "sprites", "frame", this);
        dbg.width = this.rWidth;
        dbg.height = this.rHeight;
        dbg.tint = 0xFF8000;
        dbg.alpha = 0.3;
    };
    HorizontalScrollRenderer.prototype.drawNotes = function () {
        var hPix = 0.7 * Math.abs(this.yString(0) - this.yString(1));
        var rrSizes = [102 / 50, 124 / 50, 152 / 50, 183 / 50, 199 / 50, 75 / 50, 50 / 50, 250 / 50];
        this.currentSinePos = 0;
        for (var _i = 0, _a = this.bar.note; _i < _a.length; _i++) {
            var note = _a[_i];
            this.drawSineCurveTo(note.mbTime);
            for (var strn = 0; strn < this.music.voices; strn++) {
                if (note.chromaticOffset[strn] != Note.QUIET) {
                    var wPix = note.mbLength * this.rWidth / 1000;
                    var best = 2;
                    var nearest = 42;
                    for (var i = 0; i < rrSizes.length; i++) {
                        if (Math.abs(rrSizes[i] - wPix / hPix) < nearest) {
                            best = i;
                            nearest = Math.abs(rrSizes[i] - wPix / hPix);
                        }
                    }
                    var nbar = this.game.add.image(note.mbTime * this.rWidth / 1000, this.yString(strn), "sprites", "rr" + (best + 1), this);
                    nbar.height = hPix;
                    nbar.width = wPix;
                    nbar.anchor.setTo(0, 0.66);
                    nbar.tint = HorizontalScrollRenderer.COLOURS[note.chromaticOffset[strn] % HorizontalScrollRenderer.COLOURS.length];
                    var n = note.chromaticOffset[strn];
                    if (this.music.isDiatonic) {
                        n = this.convertToDiatonicFretting(n);
                    }
                    var s1 = Math.floor(n).toString() + ((n == Math.floor(n)) ? "" : "+");
                    var txt = this.game.add.bitmapText(nbar.x + wPix * 0.5, nbar.y, "font", s1, hPix * 0.56, this);
                    txt.anchor.setTo(0.5, 0.65);
                    txt.tint = 0xFFFFFF;
                }
            }
        }
        this.drawSineCurveTo(1000);
    };
    HorizontalScrollRenderer.prototype.convertToDiatonicFretting = function (n) {
        return Math.floor(n / 12) * 7 + HorizontalScrollRenderer.FRETTING[n % 12];
    };
    HorizontalScrollRenderer.prototype.drawSineCurveTo = function (mbPos) {
        if (Math.abs(mbPos - this.currentSinePos) > 20) {
            var crv = this.game.add.image(this.currentSinePos * this.rWidth / 1000, this.getBounceY(), "sprites", mbPos - this.currentSinePos > 200 ? "sinecurve_wide" : "sinecurve", this);
            crv.width = (mbPos - this.currentSinePos) * this.rWidth / 1000;
            crv.height = this.curveHeight;
            crv.anchor.setTo(0, 1);
        }
        this.currentSinePos = mbPos;
    };
    HorizontalScrollRenderer.prototype.yString = function (s) {
        return (s + 0.5) / (this.music.voices + 0) * this.rHeight * 0.9;
    };
    HorizontalScrollRenderer.prototype.positionSphere = function (sphere, millibeat) {
        sphere.x = this.x + millibeat * this.rWidth / 1000;
        sphere.y = this.getBounceY();
        var from = 0;
        var to = 1000;
        if (this.bar.count > 0) {
            if (millibeat < this.bar.note[0].mbTime) {
                to = this.bar.note[0].mbTime;
            }
            else {
                from = this.bar.note[this.bar.count - 1].mbTime;
                for (var _i = 0, _a = this.bar.note; _i < _a.length; _i++) {
                    var note = _a[_i];
                    if (millibeat >= note.mbTime && millibeat < note.mbTime + note.mbLength) {
                        from = note.mbTime;
                        to = note.mbTime + note.mbLength;
                    }
                }
            }
        }
        var angle = (millibeat - from) / (to - from) * Math.PI;
        sphere.y -= Math.sin(angle) * this.curveHeight;
        sphere.bringToTop();
    };
    HorizontalScrollRenderer.prototype.getBounceY = function () {
        return this.yString(1.5);
    };
    HorizontalScrollRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.music = null;
        this.bar = null;
    };
    return HorizontalScrollRenderer;
}(Phaser.Group));
HorizontalScrollRenderer.COLOURS = [
    0x0000FF, 0x00FF00, 0xFF0000, 0x008080, 0x808000, 0xFF8000, 0x808080,
    0xFF00FF, 0x800000, 0x808000, 0x008040, 0xA03030, 0x80FF00, 0xFFC0D0
];
HorizontalScrollRenderer.FRETTING = [
    0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 6, 6.5
];
var TabRenderer = (function (_super) {
    __extends(TabRenderer, _super);
    function TabRenderer(game, bar, width, height) {
        var _this = _super.call(this, game) || this;
        _this.bar = bar;
        _this.tabHeight = height;
        _this.tabWidth = width;
        _this.renderBar();
        return _this;
    }
    TabRenderer.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.bar = null;
    };
    TabRenderer.prototype.getWidth = function () {
        return (this.bar.count + 0.5) * this.tabWidth;
    };
    TabRenderer.prototype.getHeight = function () {
        return this.tabHeight;
    };
    TabRenderer.prototype.renderBar = function () {
        this.forEachAlive(function (obj) { obj.pendingDestroy = true; }, this);
        this.yStaveHeight = this.tabHeight * 0.7;
        this.yBarBottom = this.tabHeight * 0.95;
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
            if (this.bar.note[n].mbLength < crotchet) {
                var start = n;
                while (n != this.bar.count && this.bar.note[n].mbLength < crotchet) {
                    n++;
                }
                n--;
                this.connectNotes(start, n);
            }
            n = n + 1;
        }
        if (TabRenderer.DEBUG) {
            img = this.game.add.image(0, 0, "sprites", "frame", this);
            img.width = this.getWidth();
            img.height = this.getHeight();
            img.tint = 0xFF0000;
            img.alpha = 0.3;
        }
    };
    TabRenderer.prototype.drawNote = function (n) {
        var isRest = true;
        for (var str = 0; str < this.bar.music.voices; str++) {
            if (this.bar.note[n].chromaticOffset[str] != Note.QUIET) {
                isRest = false;
            }
        }
        if (isRest) {
            return;
        }
        var img = this.game.add.image(this.getX(n), this.getYString(this.bar.music.voices - 0.5), "sprites", "rectangle", this);
        img.width = Math.max(1, this.yStaveHeight / 32);
        img.height = this.yBarBottom - img.y;
        img.anchor.setTo(0.5, 0);
        img.tint = 0x000000;
        for (var str = 0; str < this.bar.music.voices; str++) {
            var note = this.bar.note[n].chromaticOffset[str];
            if (note != Note.QUIET) {
                var n1 = note;
                if (this.bar.music.isDiatonic) {
                    n1 = TabRenderer.TODIATONIC[n1 % 12] + Math.floor(n1 / 12) * 7;
                }
                var s = Math.floor(n1 - this.bar.music.capo).toString();
                if (n1 != Math.floor(n1)) {
                    s = s + "plus";
                }
                img = this.game.add.image(this.getX(n), this.getYString(str), "sprites", s, this);
                img.anchor.setTo(0.5, 0.5);
                img.width = this.tabWidth * 0.7;
                img.height = (this.getYString(1) - this.getYString(0)) * 0.8;
            }
        }
        if (this.bar.note[n].mbLength >= Math.floor(1000 * 2 / this.bar.music.beats)) {
            var crc = this.game.add.image(img.x, img.y, "sprites", "circle", this);
            crc.tint = 0x000000;
            crc.anchor.setTo(0.5, 0.5);
            crc.width = crc.height = this.getHeight() * 0.25;
        }
    };
    TabRenderer.prototype.connectNotes = function (first, last) {
        if (first == last) {
            if (first > 0) {
                this.drawConnection(first - 0.5, first, this.bar.note[first].mbLength);
            }
            else {
                this.drawConnection(first, first + 0.5, this.bar.note[first].mbLength);
            }
            return;
        }
        var shortestNote = 1000;
        var allSameLength = true;
        for (var n = first; n <= last; n++) {
            shortestNote = Math.min(shortestNote, this.bar.note[n].mbLength);
            if (Math.abs(this.bar.note[first].mbLength - this.bar.note[n].mbLength) > 3) {
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
            if (Math.abs(this.bar.note[n].mbLength - 1000 / this.bar.music.beats / 4) < 3) {
                var isNext = false;
                var isPrev = false;
                if (n < last) {
                    if (Math.abs(this.bar.note[n + 1].mbLength - 1000 / this.bar.music.beats / 4) < 3) {
                        isNext = true;
                    }
                }
                if (n > first) {
                    if (Math.abs(this.bar.note[n - 1].mbLength - 1000 / this.bar.music.beats / 4) < 3) {
                        isPrev = true;
                    }
                }
                if (!isPrev) {
                    if (isNext) {
                        this.drawConnection(n, n + 1, this.bar.note[n].mbLength);
                    }
                    else {
                        this.drawConnection(n - 0.5, n, this.bar.note[n].mbLength);
                    }
                }
            }
            n++;
        }
    };
    TabRenderer.prototype.drawConnection = function (start, end, length) {
        var isDouble = (Math.abs(length - 1000 / this.bar.music.beats / 4) < 3);
        this.drawConnectingBar(start, end, this.yBarBottom);
        if (isDouble) {
            this.drawConnectingBar(start, end, this.yBarBottom - this.yStaveHeight / 8);
        }
    };
    TabRenderer.prototype.drawConnectingBar = function (start, end, y) {
        start = this.getX(start);
        end = this.getX(end);
        var img = this.game.add.image(start, y, "sprites", "rectangle", this);
        img.tint = 0x000000;
        img.anchor.setTo(0, 1);
        img.width = end - start;
        img.height = this.yStaveHeight / 16;
    };
    TabRenderer.prototype.positionCursor = function (pos, object) {
        var x = this.x + this.getX(pos);
        var y = this.y + this.yStaveHeight / 2;
        object.bringToTop();
        object.x = x;
        object.y = y;
    };
    TabRenderer.prototype.getX = function (n) {
        return Math.round((n + 0.75) * this.tabWidth);
    };
    TabRenderer.prototype.getNote = function (x) {
        var result = 0;
        for (var n = 0; n < this.bar.count; n++) {
            if (x >= this.getX(n - 0.5) && x < this.getX(n + 0.5)) {
                result = n;
            }
        }
        return result;
    };
    TabRenderer.prototype.getYString = function (str) {
        return (str + 1) * this.yStaveHeight / (this.bar.music.voices + 1);
    };
    return TabRenderer;
}(Phaser.Group));
TabRenderer.DEBUG = false;
TabRenderer.TODIATONIC = [
    0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 6, 6.5
];
