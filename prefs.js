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
            this._kbState = _("On");
        }));
        if (button.label == this._kbState)
            button.set_active(true);
        vbox.add(button);
        button = Gtk.RadioButton.new_with_label_from_widget(radio, _("Off"), {
            halign: Gtk.Align.CENTER
        });
        button.connect("toggled", Lang.bind(this, function() {
            this._kbState = _("Off");
        }));
        if (button.label == this._kbState)
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
        let clr = new Gtk.ColorButton({
            alpha=65535,
            hexpand=true,
            use_alpha=false,
            rgba={alpha=255,red=0,green=0,blue=255}
        });
        clr.connect('changed', Lang.bind(this, this._onColorChanged));
        hbox.pack_start(label, false, false, 100);
        hbox.pack_end(clr, false, false, 100);
        this.add(hbox);
        // Colors middle
        hbox = new Gtk.HBox();
        label = new Gtk.Label({
            label: _("Section: middle"),
            use_markup: true,
            halign: Gtk.Align.START
        });
        let clr = new Gtk.ColorButton({
            alpha=65535,
            hexpand=true,
            use_alpha=false,
            rgba={alpha=255,red=0,green=0,blue=255}
        });
        clr.connect('changed', Lang.bind(this, this._onColorChanged));
        hbox.pack_start(label, false, false, 100);
        hbox.pack_end(clr, false, false, 100);
        this.add(hbox);
        // Colors right
        hbox = new Gtk.HBox();
        label = new Gtk.Label({
            label: _("Section: right"),
            use_markup: true,
            halign: Gtk.Align.START
        });
        let clr = new Gtk.ColorButton({
            alpha=65535,
            hexpand=true,
            use_alpha=false,
            rgba={alpha=255,red=0,green=0,blue=255}
        });
        clr.connect('changed', Lang.bind(this, this._onColorChanged));
        hbox.pack_start(label, false, false, 100);
        hbox.pack_end(clr, false, false, 100);
        this.add(hbox);
    },

    _onColorChanged: function() {
        let activeItem = this._comboBox.get_active();
        this._currentPair = SYMBOLS[activeItem];
    },

    _loadConfig: function() {
        this._settings = Convenience.getSettings(FOREX_SETTINGS_SCHEMA);
    },

    get _currentPair() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_string(FOREX_PAIR_CURRENT);
    },

    set _currentPair(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_string(FOREX_PAIR_CURRENT, v);
    },

    get _brightnessV() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(FOREX_REFRESH_INTERVAL);
    },

    set _brightnessV(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_int(FOREX_REFRESH_INTERVAL, v);
    },

    get _kbState() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_string(FOREX_PRICE_IN_PANEL);
    },

    set _kbState(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_string(FOREX_PRICE_IN_PANEL, v);
    },
});

function buildPrefsWidget() {
    let widget = new TuxedoPrefsWidget();
    widget.show_all();
    return widget;
}
