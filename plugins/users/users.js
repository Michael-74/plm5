module.exports = class {

    constructor(that, Helper, route, permissions, menu, welcome, JornalHelper) {
        that._d('- plugin "users" loaded');
        this.name = 'Управление пользователями';
        this._d = (msg) => that._d(msg);
        this.route = route;
        this.options = that.options;
        this.helper = new Helper(that.db, this.options);
        this.jornal_helper = new JornalHelper(this.helper);
        this.permissions = permissions;
        this.menu = menu;
        this.app = that.app;
        this.plugins = that.plugins;
        this.events = that.events;
        this.welcome = welcome;
    }

    // Пользователи
    settings(req, res, next) {
        this.helper.getUsers((users_list) => {
            this.helper.get_logins_ad_status(users_list, (ad_statuses) => {
                this.helper.getGroups((groups) => {
                    res.tpl('users/list', {
                        actions:[
                            {
                                action: '<a href="/users/users/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить пользователя</a>',
                                access: 'users:editSettings'
                            }
                        ],
                        title: 'Управление пользователями',
                        plugin: 'users',
                        users_list: users_list,
                        groups: groups,
                        cur_user_id: parseInt(req.user.id),
                        ad_state: ad_statuses
                    });
                });
            });
        })
    }
    changeUserState(req, res, next) {
        if (parseInt(req.params.id) == 1 && req.user.id != 1) {
            res.json({ok:false});
        } else {
            this.helper.updateState(parseInt(req.params.id), parseInt(req.params.state), (status) => {
                res.json({ok: status});
                if (status === true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'users',
                        action: 'userState',
                        data: {
                            id: parseInt(req.params.id),
                            state: parseInt(req.params.state)
                        }
                    });
                }
            });
        }
    }
    usersDelete(req, res, next) {
        if (parseInt(req.params.id) == 1 && req.user.id != 1) {
            res.json({ok:false});
        } else {
            this.helper.deleteUser(parseInt(req.user.id), parseInt(req.params.id), (user_data) => {
                res.json({ok: (user_data != false ? true : false)});
                if (user_data != false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'users',
                        action: 'deleteUser',
                        data: {
                            id: user_data.id,
                            login: user_data.email.split('@')[0],
                            fio: user_data.first_name
                        }
                    });
                }
            });
        }
    }
    usersAddForm(req, res, next) {
        this.helper.getGroups((groups) => {
            this.helper.getExistLogins((exist_logins) => {
                let exist_ad_users_list = [];
                for (let i in exist_logins) {
                    exist_ad_users_list.push(exist_logins[i].email);
                }
                this.plugins['ad'].helper.getUserList((ad_data) => {
                    let ad_list = [];
                    for (let i in ad_data) {
                        if (exist_ad_users_list.includes(ad_data[i].login+'@chzmek.loc') === false) {
                            ad_list.push(ad_data[i]);
                        }
                    }
                    res.render('../plugins/users/views/users/add', {
                        groups: groups,
                        ad_data: ad_list
                    });
                });
            });
        });
    }
    usersAddPost(req, res, next) {
        let groups = [];
        if (typeof req.body['group[]'] == 'undefined' || req.body['group[]'].length == 0) {
            groups.push(this.options.auth.default_group_id);
        } else {
            if (typeof req.body['group[]'] == 'object') {
                groups = req.body['group[]'];
            } else {
                groups = [req.body['group[]']];
            }
        }
        this.plugins['auth'].helper.newUser(req.body.email, req.body.name, groups, req.body.password, this.options.auth.user_salt, (user_info) => {
            if (user_info != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'users',
                    action: 'addUser',
                    data: {
                        id: parseInt(user_info.id),
                        email: req.body.email,
                        name: req.body.name,
                        groups: groups
                    }
                });
                res.json({ok:true});
            } else {
                res.json({ok:false});
            }
        });
    }
    usersAddADPost(req, res, next) {
        let groups = [];
        if (typeof req.body['group[]'] == 'undefined' || req.body['group[]'].length == 0) {
            groups.push(this.options.auth.default_group_id);
        } else {
            if (typeof req.body['group[]'] == 'object') {
                groups = req.body['group[]'];
            } else {
                groups = [req.body['group[]']];
            }
        }
        this.plugins['ad'].helper.getUserInfo(parseInt(req.body.user_id), (user_info) => {
            if (user_info != false) {
                let email = user_info.login+'@'+this.options.ad.ad_domain;
                this.plugins['auth'].helper.newADUser(email, user_info.fio, groups, (status) => {
                    if (status!=false) {
                        this.events.emit('log', {
                            uid: req.user.id,
                            plugin: 'settings',
                            action: 'addADUser',
                            data: {
                                id: parseInt(status.id),
                                login: email.split('@')[0],
                                fio: user_info.fio,
                                groups: groups
                            }
                        });
                        res.json({ok:true});
                    } else {
                        res.json({ok: false});
                    }
                });
            } else {
                res.json({ok:false});
            }
        });
    }
    usersEdit(req, res, next) {
        let user_id = parseInt(req.params.id);
        this.helper.getUser(user_id, (user_data) => {
            this.helper.getGroups((groups) => {
                this.helper.getUserGroups(user_id, (user_groups) => {
                    res.render('../plugins/users/views/users/edit', {
                        id: user_id,
                        groups: groups,
                        user_groups: user_groups,
                        user_data: user_data
                    });
                });
            });
        });
    }
    usersEditPost(req, res, next) {
        let user_id = parseInt(req.params.id);
        let groups = [];
        if (typeof req.body['group[]'] === 'undefined' || req.body['group[]'].length === 0) {
            groups.push(this.options.auth.default_group_id);
        } else {
            groups = req.body['group[]'];
        }
        if (user_id == 1 && req.user.id != 1) {
            res.json({ok:false});
        } else {
            this.plugins['auth'].helper.editUser(user_id, req.body.email, req.body.name, (req.body.password || false), groups, this.options.auth.user_salt, (status) => {
                res.json({ok:status});
                if (status != false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'users',
                        action: 'editUser',
                        data: {
                            id: user_id,
                            email: req.body.email,
                            name: req.body.name,
                            groups: groups
                        }
                    });
                }
            });
        }
    }
    usersEditAd(req, res, next) {
        let user_id = parseInt(req.params.id);
        this.helper.getGroups((groups) => {
            this.helper.getUserGroups(user_id, (user_groups) => {
                res.render('../plugins/users/views/users/edit_ad', {
                    id: user_id,
                    groups: groups,
                    user_groups: user_groups
                });
            });
        });
    }
    usersEditAdPost(req, res, next) {
        let user_id = parseInt(req.params.id);
        let groups = [];
        if (typeof req.body['group[]'] === 'undefined' || req.body['group[]'].length === 0) {
            groups.push(this.options.auth.default_group_id);
        } else {
            groups = req.body['group[]'];
        }
        if (user_id == 1 && req.user.id != 1) {
            res.json({ok:false});
        } else {
            this.plugins['auth'].helper.editUserGroups(user_id, groups, (status) => {
                res.json({ok:status});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'users',
                    action: 'editUserGroup',
                    data: {
                        id: user_id,
                        groups: groups
                    }
                });
            });
        }
        // let groups = [];
        // if (typeof req.body['group[]'] === 'undefined' || req.body['group[]'].length === 0) {
        //     groups.push(this.options.auth.default_group_id);
        // } else {
        //     groups = req.body['group[]'];
        // }
        
    }



    // Роли (группы)
    groups(req, res, next) {
        this.helper.getPermissions((cur_perm_list) => {
            let perm_list = {};
            for (let i in this.plugins) {
                let plugin_name = i;
                for (let j in this.plugins[plugin_name].permissions) {
                    let perms = this.plugins[plugin_name].permissions[j];
                    let list = {
                        perm_name: j,
                        name: perms.name,
                        description: perms.description
                    }
                    if (typeof perm_list[plugin_name] == 'undefined') perm_list[plugin_name] = {name:this.plugins[plugin_name].name, list:[]};
                    perm_list[plugin_name].list.push(list);
                }
            }
            this.helper.getGroups((groups) => {
                res.tpl('groups/list', {
                    title: 'Настройка ролей пользователей',
                    actions:[
                        {
                            action: '<a href="/users/groups/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить роль</a>',
                            access: 'users:editSettings'
                        }
                    ],
                    plugin: 'users',
                    groups: groups,
                    def_groups: [1, this.options.auth.default_group_id],
                    perm_list: perm_list,
                    cur_perm_list: cur_perm_list
                });
            });
        });
    }
    groupAddForm(req, res, next) {
        res.render('../plugins/users/views/groups/add');
    }
    groupAddFormPost(req, res, next) {
        let params = req.body;
        this.helper.newGroup(params.name, (data) => {
            res.json({ok:(data!=false?true:false)});
            if (data!=false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'users',
                    action: 'addGroup',
                    data: {
                        id: data.id,
                        name: params.name
                    }
                });
            }
        });
    }
    groupDelete(req, res, next) {
        this.helper.deleteGroup(parseInt(req.params.id), (status) => {
            res.json({ok: status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'users',
                    action: 'deleteGroup',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            }
        });
    }
    groupEditForm(req, res, next) {
        this.helper.getGroupData(parseInt(req.params.id), (item) => {
            res.render('../plugins/users/views/groups/edit', {
                item: item
            });
        });
    }
    groupEditFormPost(req, res, next) {
        let params = req.body;
        this.helper.editGroup(parseInt(req.params.id), params.name, (data) => {
            res.json({ok:(data!=false?true:false)});
            if (data!=false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'users',
                    action: 'editGroup',
                    data: {
                        id: parseInt(req.params.id),
                        name: params.name
                    }
                });
            }
        });
    }
    groupEditPermissions(req, res, next) {
        let cstate = parseInt(req.params.cstate);
        if (cstate == 1) {
            this.helper.insertPermission(parseInt(req.params.group_id), req.params.plugin, req.params.func, (status) => {
                res.json({ok:status});
                if (status === true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'users',
                        action: 'editPermissions',
                        data: {
                            group_id: parseInt(req.params.group_id),
                            plugin: req.params.plugin,
                            function: req.params.func,
                            state: 1
                        }
                    });
                }
            });
        } else {
            this.helper.deletePermission(parseInt(req.params.group_id), req.params.plugin, req.params.func, (status) => {
                res.json({ok:status});
                if (status === true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'users',
                        action: 'editPermissions',
                        data: {
                            group_id: parseInt(req.params.group_id),
                            plugin: req.params.plugin,
                            function: req.params.func,
                            state: 0
                        }
                    });
                }
            });
        }
    }

}