module.exports = class {

    constructor(that, Helper, route, permissions, menu, welcome) {
        that._d('- plugin "main" loaded');
        this.name = 'Главная страница';
        this._d = (msg) => that._d(msg);
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.options = that.options;
        this.menu = menu;
        this.app = that.app;
        this.plugins = that.plugins;
        this.welcome = welcome;
    }

    main(req, res, next) {
        let welcome_data = [];
        for (let i in this.plugins) {
            if (typeof this.plugins[i].welcome != 'undefined') {
                welcome_data.push(this.plugins[i].welcome);
            }
        }
        res.tpl('list', {
            title: 'Информационная система',
            actions: [],
            plugin: 'main',
            items: welcome_data
        });
    }

    async showMenu(req, res, next) {
        let menu_list = [];
        for (let i in this.plugins) {
            let plugin_name = i;
            let menu_data = this.plugins[plugin_name].menu;
            if (menu_data != false) {
                for (let j in menu_data) {
                    let menu_item = menu_data[j];
                    if (menu_item.permissions != false) {
                        let permission_status = await this.plugins['auth'].checkPermissionsRawAsync(req.user.id, plugin_name, menu_item.permissions);
                        if (permission_status === true) {
                            menu_item.plugin = plugin_name;
                            menu_list.push(menu_item);
                        }
                    } else {
                        menu_item.plugin = plugin_name;
                        menu_list.push(menu_item);
                    }
                }
            }
        }
        menu_list.sort((a,b) => {
            return a.order - b.order;
        });
        res.json({ok:true, menu:menu_list});
    }

    defineTemplate(req, res, next) {
        let that = this;
        res.tpl = (layout, data) => {
            this.helper.getAccessList(this.plugins, req.user.id, (al) => {
                this.plugins['users'].helper.getUsersList((users) => {
                    data.users = users;
                    data.layout = that.options.dir.base+that.options.dir.plugins+'/'+data.plugin+'/views/'+layout;
                    data.user = req.user;
                    data.access = al;
                    data.project_name = this.options.project_name;
                    data.back = (typeof data.back != 'undefined' ? '<a title="'+data.back.title+'" onclick="Tabs.sameTab(\''+data.back.url+'\');return false;" href="'+data.back.url+'" class="btn btn-sm btn-white btn-back"><i class="fas fa-arrow-alt-left"></i></a>' : '');
                    if (req.xhr) {
                        res.render('../'+that.options.dir.plugins+'/main/views/ajax', data, (err, content) => {
                            let actions = [];
                            for (let i in data.actions) {
                                if (data.access.includes(data.actions[i].access)) {
                                    actions.push(data.actions[i].action);
                                }
                            }
                            res.json({content:content, title:data.title, actions:actions, plugin:data.plugin, back:data.back});
                        });
                    } else {
                        res.render('../'+that.options.dir.plugins+'/main/views/index', data);
                    }
                })
            });
        };
        res.tplJson = (layout, data) => {
            this.helper.getAccessList(this.plugins, req.user.id, (al) => {
                this.plugins['users'].helper.getUsersList((users) => {
                    data.users = users;
                    data.layout = '../'+that.options.dir.plugins+'/'+data.plugin+'/views/'+layout;
                    data.user = req.user;
                    data.access = al;
                    if (typeof data.data == 'undefined') {
                        data.data = {};
                    }
                    res.render(data.layout, data, (err, html) => {
                        res.json({ html: html, data: data.data });
                    });
                });
            });
        };
        next();
    }
 
}