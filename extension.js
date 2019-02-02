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

/*const FOREX_SETTINGS_SCHEMA = 'org.gnome.shell.extensions.tuxedocontrol';
const FOREX_PAIR_CURRENT = 'pair-current';
const FOREX_REFRESH_INTERVAL = 'refresh-interval';
const FOREX_PRICE_IN_PANEL = 'price-in-panel';
const FOREX_ONLINE_STATUS = 'online-status';

const QUOTES_URL = 'http://quotes.instaforex.com/get_quotes.php';
const UP_POINTING = String.fromCharCode(9650);
const DOWN_POINTING = String.fromCharCode(9660);
const SERVER_TIME_GMT_DIFF = 10800;

let _httpSession;*/

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
        this.red = this._createMenuItem(_("R"));
        this.green = this._createMenuItem(_("G"));
        this.blue = this._createMenuItem(_("B"));

        let separator = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(separator);

        let item = new PopupMenu.PopupMenuItem(_("Apply"));
        item.connect('activate', Lang.bind(this, function() {
            this._refresh();
        }));
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

    _loadData: function() {
        this._refreshUI();
    },

    _refresh: function() {
        this._loadData(this._refreshUI);
        this._removeTimeout();
        this._timeout = Mainloop.timeout_add_seconds(this._refreshInterval, Lang.bind(this, this._refresh));
        return true;
    },

    _refreshUI: function(data) {
        this.symbol.set_text(data.symbol);
        this.ask.set_text(data.ask.toString());
        this.bid.set_text(data.bid.toString());
        this.change.set_text(data.change.toString());
        let date = new Date((data.lasttime - SERVER_TIME_GMT_DIFF) * 1000);
        this.lasttime.set_text(date.toLocaleString());

        let txt;
        if (this._priceInPanel == _("Ask"))
            txt = this.change.text + ' ' + this.ask.text;
        else
            txt = this.change.text + ' ' + this.bid.text;

        this.buttonText.set_text(txt);
    }

    /*_onPreferencesActivate: function() {
        Util.spawn(["gnome-shell-extension-prefs", "tuxedocontrol@gbs"]);
        return 0;
    },

    _loadConfig: function() {
        this._settings = Convenience.getSettings(FOREX_SETTINGS_SCHEMA);
        this._settingsC = this._settings.connect("changed", Lang.bind(this, function() {
            this._refresh();
        }));
    },

    get _currentPair() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_string(FOREX_PAIR_CURRENT);
    },

    get _refreshInterval() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_int(FOREX_REFRESH_INTERVAL);
    },

    get _priceInPanel() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_string(FOREX_PRICE_IN_PANEL);
    },

    get _onlineStatusConf() {
        if (!this._settings)
            this._loadConfig();
        return this._settings.get_boolean(FOREX_ONLINE_STATUS);
    },

    set _onlineStatusConf(v) {
        if (!this._settings)
            this._loadConfig();
        this._settings.set_boolean(FOREX_ONLINE_STATUS, v);
    },

    _removeTimeout: function() {
        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }
    },

    stop: function() {
        if (_httpSession !== undefined)
            _httpSession.abort();
        _httpSession = undefined;

        if (this._timeout)
            Mainloop.source_remove(this._timeout);
        this._timeout = undefined;

        this._onlineStatusConf = this._online_status;

        if (this._settingsC) {
            this._settings.disconnect(this._settingsC);
            this._settingsC = undefined;
        }
        this.menu.removeAll();
    }
    */

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
