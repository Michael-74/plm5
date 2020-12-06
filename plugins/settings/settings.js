module.exports = class {

    constructor(that, Helper, route, permissions, menu, welcome) {
        that._d('- plugin "settings" loaded');
        this.name = 'Настройки';
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
        this.helper.getStateParams((param_state) => {
            this.helper.getStateNum((param_num) => {
                res.tpl('list', {
                    actions: [],
                    title: 'Настройки',
                    plugin: 'settings',
                    param_state: param_state,
                    param_num: param_num
                });
            });
        });
    }

    changeParamState(req, res, next) {
        this.helper.updateStateParam(parseInt(req.params.id), parseInt(req.params.state), (status) => {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'settings',
                    action: 'paramState',
                    data: {
                        id: parseInt(req.params.id),
                        state: parseInt(req.params.state)
                    }
                });
            }
        });
    }

    updateNumFieldsPost(req, res, next) {
        this.helper.updateNumFields(req.body.id, parseInt(req.body.value), (status) => {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'settings',
                    action: 'updateNumFields',
                    data: {
                        id: req.body.id,
                        value: parseInt(req.body.value)
                    }
                });
            }
        });
    }

}