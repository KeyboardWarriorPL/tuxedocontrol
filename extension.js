const St = imports.gi.St;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;

const Gettext = imports.gettext.domain('gnome-shell-extension-tuxedocontrol');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Config = imports.misc.config;
const Convenience = Me.imports.convenience;

const TUX_SYS = '/sys/devices/platform/tuxedo_keyboard/';

const TUX_SETTINGS_SCHEMA = 'org.gnome.shell.extensions.tuxedocontrol';
const TUX_BRIGHTNESS = 'brightness';
const TUX_LEFT = 'clr-left';
const TUX_MIDDLE = 'clr-middle';
const TUX_RIGHT = 'clr-right';
const TUX_STATE = 'state';

const TuxedoCtl = new Lang.Class({
    Name: 'TuxedoCtl',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Tuxedo Control", false);
        this._loadConfig();
        this._online_status = this._onlineStatusConf;
        this.buttonText = new St.Icon({
            icon_name: "input-keyboard",
            style_class: "kbicon"
        });
        this.actor.add_actor(this.buttonText);
        this._buildMenu();
        this._refresh();
    },

    _buildMenu: function() {
        this.menu.removeAll();
        this.brightness = this._createMenuItem(_("Brightness"));
        this.left = this._createMenuItem(_("Left"));
        this.middle = this._createMenuItem(_("Middle"));
        this.right = this._createMenuItem(_("Right"));
        this.state = this._createMenuItem(_("State"));

        let separator = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(separator);

        let item = new PopupMenu.PopupMenuItem(_("Apply"));
        item.connect('activate', Lang.bind(this, this._apply));
        this.menu.addMenuItem(item);
    },

    _createMenuItem: function(text) {
        let label_right = new St.Label({
            text: text
        });
        let label_left = new St.Label({
            text: _("...")
        });
        let item = new PopupMenu.PopupBaseMenuItem({
            reactive: false
        });
        item.actor.add(label_left, {
            expand: true
        });
        item.actor.add(label_right);
        this.menu.addMenuItem(item)
        return label_left;
    },

    _apply: function() {
        // write TUX_SYS
        this._refresh();
    },

    _loadData: function() {
        // read TUX_SYS
        this._refreshUI();
    },

    _refresh: function() {
        this._loadData(this._refreshUI);
        return true;
    },

    _refreshUI: function(data) {
        // refresh displayed settings
        let txt;
        if (this._kbState)
            txt = 'On';
        else
            txt = 'Off';

        this.buttonText.set_text(txt);
    },

    _onPreferencesActivate: function() {
        Util.spawn(["gnome-shell-extension-prefs", "tuxedocontrol@gbs"]);
        return 0;
    },

    _loadConfig: function() {
        this._settings = Convenience.getSettings(FOREX_SETTINGS_SCHEMA);
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

    get _kbState() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_boolean(TUX_STATE);
    },

    set _kbState(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_boolean(TUX_STATE, v);
    },

    stop: function() {
        if (this._settingsC) {
            this._settings.disconnect(this._settingsC);
            this._settingsC = undefined;
        }
        this.menu.removeAll();
    },

    trySpawn: function(argv)
    {
        var success, pid;
        try {
            [success, pid] = GLib.spawn_async(null, argv, null, GLib.SpawnFlags.SEARCH_PATH | GLib.SpawnFlags.DO_NOT_REAP_CHILD, null);
        } catch (err) {
            // Rewrite the error in case of ENOENT
            if (err.matches(GLib.SpawnError, GLib.SpawnError.NOENT)) {
                throw new GLib.SpawnError({ code: GLib.SpawnError.NOENT, message: _("Command not found") });
            } else if (err instanceof GLib.Error) {
                // The exception from gjs contains an error string like:
                //   Error invoking GLib.spawn_command_line_async: Failed to
                //   execute child process "foo" (No such file or directory)
                // We are only interested in the part in the parentheses. (And
                // we can't pattern match the text, since it gets localized.)
                let message = err.message.replace("/.*\((.+)\)/", '$1');
                throw new (err.constructor)({ code: err.code, message: message });
            } else {
                throw err;
            }
        }
        // Dummy child watch; we don't want to double-fork internally
        // because then we lose the parent-child relationship, which
        // can break polkit.  See https://bugzilla.redhat.com//show_bug.cgi?id=819275
        GLib.child_watch_add(GLib.PRIORITY_DEFAULT, pid, () => {});
    },

    //spawning cmd line
    trySpawnCommandLine: function(command_line) {
        let success, argv
        try {
            [success, argv] = GLib.shell_parse_argv(command_line);
        } catch (err) {
            // Replace "Error invoking GLib.shell_parse_argv: " with something nicer
            err.message = err.message.replace("/[^:]*: /", _("Could not parse command:") + "\n");
            throw err;
        }
        trySpawn(argv);
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
