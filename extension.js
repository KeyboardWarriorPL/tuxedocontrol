const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;
//const Soup = imports.gi.Soup;
//const Mainloop = imports.mainloop;
//const Clutter = imports.gi.Clutter;

const Gettext = imports.gettext.domain('gnome-shell-extension-tuxedocontrol');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Config = imports.misc.config;
const Convenience = Me.imports.convenience;

const TUX_SYS = '/sys/devices/platform/tuxedo_keyboard/';
const TUX_CTL = '/bin/tuxedo_controller.out';

const TUX_SETTINGS_SCHEMA = 'org.gnome.shell.extensions.tuxedocontrol';
const TUX_BRIGHTNESS = 'brightness';
const TUX_LEFT = 'clr-left';
const TUX_MIDDLE = 'clr-middle';
const TUX_RIGHT = 'clr-right';

const TuxedoCtl = new Lang.Class({
    Name: 'TuxedoCtl',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Tuxedo Control", false);
        this._loadConfig();
        this._online_status = this._onlineStatusConf;
        this.mainIcon = new St.Icon({
            icon_name: "input-keyboard",
            style_class: "kbicon"
        });
        this.actor.add_actor(this.mainIcon);
        this._buildMenu();
        this._refresh();
    },

    _buildMenu: function() {
        this.menu.removeAll();
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
        spinButton.connect("value_changed", Lang.bind(this, function() {
            this._brightnessV = this.brightness.value;
        }));
        this.brightness = this._createMenuItem(_("Brightness", spinButton));
        let clrb = new Gtk.ColorButton({});
        clrb.connect('color_activated', Lang.bind(this, this._onColorChanged));
        this.left = this._createMenuItem(_("Left"), clrb);
        clrb = new Gtk.ColorButton({});
        clrb.connect('color_activated', Lang.bind(this, this._onColorChanged));
        this.middle = this._createMenuItem(_("Middle"), clrb);
        clrb = new Gtk.ColorButton({});
        clrb.connect('color_activated', Lang.bind(this, this._onColorChanged));
        this.right = this._createMenuItem(_("Right"), clrb);

        let separator = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(separator);

        let item = new PopupMenu.PopupMenuItem(_("Apply"));
        item.connect('activate', Lang.bind(this, this._apply));
        this.menu.addMenuItem(item);
    },

    _createMenuItem: function(text, label_right) {
        let label_left = new St.Label({
            text: text
        });
        let item = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });
        item.actor.add(label_left, {
            expand: true
        });
        item.actor.add(label_right);
        this.menu.addMenuItem(item);
        return label_right;
    },

    _apply: function() {
        // write TUX_SYS
        Util.spawn([TUX_CTL, 'brightness', this._brightnessV, 'color_left', this._sectionLeft, 'color_right', this._sectionRight, 'color_center', this._sectionMiddle]);
        this._refresh();
    },

    _refresh: function() {
        this._refreshUI();
        return true;
    },

    _refreshUI: function() {
        // refresh displayed settings
        this.brightness.set_value(this._brightnessV);
    },

    _onColorChanged: function() {
        let l = this.left.get_color();
        let m = this.middle.get_color();
        let r = this.right.get_color();
        let clr = l.red<<0xf + l.green<<0x8 + l.blue;
        this._sectionLeft = clr;
        clr = m.red<<0xf + m.green<<0x8 + m.blue;
        this._sectionMiddle = clr;
        clr = r.red<<0xf + r.green<<0x8 + r.blue;
        this._sectionRight = clr;
    },

    /*_onPreferencesActivate: function() {
        Util.spawn(["gnome-shell-extension-prefs", "tuxedocontrol@gbs"]);
        return 0;
    },*/

    _loadConfig: function() {
        this._settings = Convenience.getSettings(TUX_SETTINGS_SCHEMA);
        this._settingsC = this._settings.connect("changed", Lang.bind(this, function() {
            this._refresh();
        }));
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

    stop: function() {
        if (this._settingsC) {
            this._settings.disconnect(this._settingsC);
            this._settingsC = undefined;
        }
        this.menu.removeAll();
    }

});

let tuxedoMenu;

function init() {
    Convenience.initTranslations('gnome-shell-extension-tuxedocontrol');
}

function enable() {
    tuxedoMenu = new TuxedoCtl;
    Main.panel.addToStatusArea('tuxedo-control', tuxedoMenu);
}

function disable() {
    tuxedoMenu.stop();
    tuxedoMenu.destroy();
}
