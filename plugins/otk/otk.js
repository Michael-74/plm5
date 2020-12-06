const   moment = require('moment');

module.exports = class {

    constructor(that, Helper, route, permissions, menu) {
        that._d('- plugin "otk" loaded');
        this.name = 'ОТК';
        this._d = (msg) => that._d(msg);
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.menu = menu;
        this.plugins = that.plugins;
        this.events = that.events;
        this.options = that.options;
    }


}