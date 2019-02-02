const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;

const Gettext = imports.gettext.domain('gnome-shell-extension-tuxedocontrol');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Lang = imports.lang;

const TUX_SETTINGS_SCHEMA = 'org.gnome.shell.extensions.tuxedocontrol';
const TUX_BRIGHTNESS = 'brightness';
const TUX_LEFT = 'clr-left';
const TUX_MIDDLE = 'clr-middle';
const TUX_RIGHT = 'clr-right';
const TUX_STATE = 'state';

function init() {
    Convenience.initTranslations('gnome-shell-extension-tuxedocontrol');
}

const TuxedoPrefsWidget = new GObject.Class({
    Name: 'TuxedoControlExtension.Prefs.Widget',
    GTypeName: 'TuxedoControlExtensionPrefsWidget',
    Extends: Gtk.Grid,

    _init: function(params) {
        this._loadConfig();
        this.parent(params);
        this.margin = 12;
        this.row_spacing = this.column_spacing = 6;
        this.set_orientation(Gtk.Orientation.VERTICAL);

        // State
        let hbox = new Gtk.HBox();
        let vbox = new Gtk.VBox();
        let label = new Gtk.Label({
            label: _("State"),
            use_markup: true,
            halign: Gtk.Align.START
        });        
        let radio = new Gtk.RadioButton();
        let button = Gtk.RadioButton.new_with_label_from_widget(radio, _("On"), {
            halign: Gtk.Align.CENTER
        });
        button.connect("toggled", Lang.bind(this, function() {
            this._kbState = true;
        }));
        if (this._kbState)
            button.set_active(true);
        vbox.add(button);
        button = Gtk.RadioButton.new_with_label_from_widget(radio, _("Off"), {
            halign: Gtk.Align.CENTER
        });
        button.connect("toggled", Lang.bind(this, function() {
            this._kbState = false;
        }));
        if (!this._kbState)
            button.set_active(true);
        vbox.add(button);
        hbox.pack_start(label, false, false, 100);
        hbox.pack_end(vbox, false, false, 100);
        this.add(hbox);

        // Brightness
        hbox = new Gtk.HBox();
        label = new Gtk.Label({
            label: _("Brightness"),
            hexpand: true,
            halign: Gtk.Align.CENTER
        });
        let ad = new Gtk.Adjustment({
            lower: 0.0,
            step_increment: 1.0,
            upper: 255.0,
            value: 1.0
        });
        let spinButton = new Gtk.SpinButton({
            adjustment: ad,
            digits: 0,
            xalign: 1,
            halign: Gtk.Align.CENTER
        });
        spinButton.set_value(this._brightnessV);
        spinButton.connect("value_changed", Lang.bind(this, function() {
            this._brightnessV = spinButton.value;
        }));
        hbox.pack_start(label, false, false, 100);
        hbox.pack_end(spinButton, false, false, 100);
        this.add(hbox);
        
        // Colors left
        hbox = new Gtk.HBox();
        label = new Gtk.Label({
            label: _("Section: left"),
            use_markup: true,
            halign: Gtk.Align.START
        });
        this._clr_left = new Gtk.ColorButton({
            alpha=65535,
            hexpand=true,
            use_alpha=false,
            rgba={alpha=255,red=0,green=0,blue=255}
        });
        this._clr_left.connect('changed', Lang.bind(this, this._onColorChanged));
        hbox.pack_start(label, false, false, 100);
        hbox.pack_end(this._clr_left, false, false, 100);
        this.add(hbox);
        // Colors middle
        hbox = new Gtk.HBox();
        label = new Gtk.Label({
            label: _("Section: middle"),
            use_markup: true,
            halign: Gtk.Align.START
        });
        this._clr_middle = new Gtk.ColorButton({
            alpha=65535,
            hexpand=true,
            use_alpha=false,
            rgba={alpha=255,red=0,green=0,blue=255}
        });
        this._clr_middle.connect('changed', Lang.bind(this, this._onColorChanged));
        hbox.pack_start(label, false, false, 100);
        hbox.pack_end(this._clr_middle, false, false, 100);
        this.add(hbox);
        // Colors right
        hbox = new Gtk.HBox();
        label = new Gtk.Label({
            label: _("Section: right"),
            use_markup: true,
            halign: Gtk.Align.START
        });
        this._clr_right = new Gtk.ColorButton({
            alpha=65535,
            hexpand=true,
            use_alpha=false,
            rgba={alpha=255,red=0,green=0,blue=255}
        });
        this._clr_right.connect('changed', Lang.bind(this, this._onColorChanged));
        hbox.pack_start(label, false, false, 100);
        hbox.pack_end(this._clr_right, false, false, 100);
        this.add(hbox);
    },

    _onColorChanged: function() {
        let l = this._clr_left.get_color();
        let m = this._clr_middle.get_color();
        let r = this._clr_right.get_color();
        let clr = l.red<<0xf + l.green<<0x8 + l.blue;
        this._sectionLeft = clr;
        clr = m.red<<0xf + m.green<<0x8 + m.blue;
        this._sectionMiddle = clr;
        clr = r.red<<0xf + r.green<<0x8 + r.blue;
        this._sectionRight = clr;
    },

    _loadConfig: function() {
        this._settings = Convenience.getSettings(TUX_SETTINGS_SCHEMA);
    },

    get _sectionLeft() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(TUX_LEFT);
    },

    set _sectionLeft(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_int(TUX_LEFT, v);
    },

    get _sectionMiddle() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(TUX_MIDDLE);
    },

    set _sectionMiddle(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_int(TUX_MIDDLE, v);
    },

    get _sectionRight() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(TUX_RIGHT);
    },

    set _sectionRight(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_int(TUX_RIGHT, v);
    },

    get _brightnessV() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(TUX_BRIGHTNESS);
    },

    set _brightnessV(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_int(TUX_BRIGHTNESS, v);
    },

    get _kbState() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_boolean(TUX_STATE);
    },

    set _kbState(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_boolean(TUX_STATE, v);
    }
});

function buildPrefsWidget() {
    let widget = new TuxedoPrefsWidget();
    widget.show_all();
    return widget;
}
