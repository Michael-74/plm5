module.exports = class {

    constructor(that, Helper, route, permissions, menu, welcome) {
        that._d('- plugin "journal" loaded');
        this.name = 'Журнал событий';
        this._d = (msg) => that._d(msg);
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.menu = menu;
        this.plugins = that.plugins;
        that.events.on('log', (data) => {
            that._d(data);
            this.helper.saveLog(data);
        });
        this.welcome = welcome;
    }

    async parseLogs(logs) {
        let pre_data = {
            plugins: []
        };
        let post_data = {
            users: {
                '0': {
                    id: 0,
                    first_name: 'Система',
                    last_name: ''
                }
            },
            plugins: {},
            events: {}
        }
        for (let i in logs) {
            if (pre_data.plugins.includes(logs[i].plugin) == false) {
                pre_data.plugins.push(logs[i].plugin);
            }
            if (typeof this.plugins[logs[i].plugin] != 'undefined') {
                post_data.events[logs[i].id] = (typeof this.plugins[logs[i].plugin].jornal_helper != 'undefined' ? await this.plugins[logs[i].plugin].jornal_helper.parseActions(logs[i].action, logs[i].data) : logs[i].data);
            } else {
                post_data.events[logs[i].id] = logs[i].plugin+' - '+logs[i].data;
            }
        }
        for (let i in pre_data.plugins) {
            if (typeof this.plugins[pre_data.plugins[i]] != 'undefined') {
                post_data.plugins[pre_data.plugins[i]] = {
                    name: this.plugins[pre_data.plugins[i]].name
                }
            }
        }
        return post_data;
    }

    view(req, res, next) {
        this.helper.getLogs(req.query, async (logs, sort) => {
            let post_data = await this.parseLogs(logs);
            res.tpl('list', {
                actions:[
                    {
                        action: '<a href="/journal/clear" onclick="Journal.clearAll();return false;" class="btn btn-sm btn-danger"><i class="fal fa-trash-alt"></i>&nbsp;Очистить журнал</a>',
                        access: 'journal:edit'
                    }
                ],
                title: 'Журнал событий',
                plugin: 'journal',
                items: logs,
                post_data: post_data,
                sort: sort
            })
        });
    }
    json(req, res, next) {
        this.helper.getLogs(req.query, async (logs, sort) => {
            let post_data = await this.parseLogs(logs);
            res.tplJson('listJson', {
                plugin: 'journal',
                items: logs,
                post_data: post_data,
                data: {
                    page: (typeof sort.page != 'undefined' ? sort.page : 1)
                }
            })
        });
        
    }
    delete(req, res, next) {
        this.helper.deleteLog(parseInt(req.params.id), (status) => {
            res.json({ok: status});
        });
    }
    clear(req, res, next) {
        this.helper.clearAllLogs((status) => {
            res.json({ok: status});
        });
    }

}