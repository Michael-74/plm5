module.exports = class {

    constructor(that, Helper, route, permissions, menu, welcome) {
        that._d('- plugin "apps" loaded');
        this.name = 'Каталог модулей';
        this._d = (msg) => that._d(msg);
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.menu = menu;
        this.plugins = that.plugins;
        this.welcome = welcome;
        this.events = that.events;
    }

    view(req, res, next) {
        res.json({ok: true});
    }

}