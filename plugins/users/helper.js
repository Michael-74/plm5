module.exports = class {

    constructor(db, options) {
        this.options = options;
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
    }

    /** Получение данных пользователя по ID  */
    getUser(id, callback) {
        this.models.auth_users.findAll({
            raw: true,
            attributes: ['id', 'first_name', 'last_name', 'email', 'type'],
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            callback((res.length > 0 ? res[0] : false));
        }).catch(error => {
            callback(false);
        });
    }
    /** Получение списка групп всех пользователей через запятую */
    getUsersGroups(callback) {
        this.models.auth_users_groups.findAll({
            raw: true,
            // [sequelize.literal("STRING_AGG(firstname,'-')"), 'name']
            attributes: ['user_id', [this.sequelize.literal("STRING_AGG(group_id,',')"), 'groups']],
            // attributes: ['user_id', [this.sequelize.fn('GROUP_CONCAT', this.sequelize.col('group_id')), 'groups']],
            group: ['user_id']
        }).then(res => {
            callback(res);
        });
    }
    /** Получение всех пользователей с группами */
    getUsers(callback) {
        this.sequelize.models.auth_users.belongsTo(this.sequelize.models.auth_users_groups, {foreignKey: 'id', targetKey: 'user_id'});
        this.models.auth_users.findAll({
            raw: true,
            attributes: ['id','email','first_name','last_name','active','phone','created_date','type'],
            include: [{
                model: this.models.auth_users_groups,
                attributes: [[this.sequelize.literal("STRING_AGG(group_id,',')"), 'groups']],
                // attributes: ['user_id', [this.sequelize.fn('GROUP_CONCAT', this.sequelize.col('group_id')), 'groups']],
                group: ['auth_users_groups.user_id'],
                required: false
            }],
            group: ['auth_users.id','auth_users.email','auth_users.first_name','auth_users.last_name','auth_users.active','auth_users.phone','auth_users.created_date','auth_users.type'],
        }).then(res => {
            for (let i in res) {
                res[i]['groups'] = res[i]['auth_users_groups.groups'];
            }
            callback(res);
        });
    }

    /** Получение логинов из емаилов AD */
    get_ad_logins_from_emails(users_list) {
        let list = [];
        for (let i in users_list) {
            if (users_list[i].type === 1) {
                list.push(users_list[i].email.split('@')[0]);
            }
        }
        return list;
    }
    /** Получение списка логинов AD */
    get_logins_ad_status(users_list, cb) {
        let login_list = this.get_ad_logins_from_emails(users_list);
        this.models.ad_users.findAll({
            raw: true,
            attributes: ['login', 'state'],
            where: {
                login: login_list
            }
        }).then(res => {
            let ad_state = {};
            for (let i in res) {
                ad_state[res[i].login+'@'+this.options.ad.ad_domain] = res[i].state;
            }
            cb(ad_state);
        });
    }
    
    /** Получение имен пользователей по ID */
    getUsersInList(list) {
        return new Promise((resolve) => {
            this.models.auth_users.findAll({
                attributes: ['id','first_name', 'last_name'],
                raw: true,
                where: {
                    id: {
                        [this.Op.in]: list
                    }
                },
                order: [
                    ['id', 'ASC']
                ]
            }).then(res => {
                let users_data = {}; 
                for (let i in res) {
                    users_data[res[i].id] = res[i];
                }
                resolve(users_data);
            });
        });
    }
    /** Получение упрощенного спсиска пользователей */
    getUsersList(callback) {
        this.models.auth_users.findAll({
            attributes: ['id','first_name', 'last_name'],
            raw: true
        }).then(res => {
            let users_data = {
                "0": {id:'0',first_name:'Система',last_name:''}
            }; 
            for (let i in res) {
                users_data[res[i].id] = res[i];
            }
            callback(users_data);
        });
    }
    /** Получение списка групп */
    getGroups(callback) {
        this.models.auth_groups.findAll({
            raw: true,
            attributes: ['id','name'],
        }).then(res => {
            let grps = {};
            for (let i in res) {
                grps[res[i].id] = res[i].name;
            }
            callback(grps);
        });
    }
    /** Обновление состояния */
    updateState(id, state, callback) {
        this.models.auth_users.update({
            active: (state == 0 ? '0' : '1')
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }
    /** Удалить пользователя */
    deleteUser(current_id, id, callback) {
        if (current_id === id) {
            callback(false);
        } else {
            this.getUser(parseInt(id), (user_data) => {
                if (user_data != false) {
                    this.models.auth_users.destroy({
                        where: {
                            id: user_data.id
                        }
                    }).then(res => {
                        callback(user_data);
                    }).catch(error => {
                        callback(false);
                    });
                } else {
                    callback(false);
                }
                
            });
        }
    }
    /** Получение массива с группами пользователя */
    getUserGroups(id, callback) {
        this.models.auth_users_groups.findAll({
            raw: true,
            attributes: ['user_id','group_id'],
            where: {
                user_id: parseInt(id)
            }
        }).then(res => {
            let grps = [];
            for (let i in res) {
                grps.push(parseInt(res[i].group_id));
            }
            callback(grps);
        });
    }
    /** Получение массива с AD пользователями */
    getExistLogins(callback) {
        this.models.auth_users.findAll({
            raw: true,
            attributes: ['email'],
            where: {
                type: 1
            }
        }).then(res => {
            callback(res);
        });
    }

    
    /** Получение прав пользователей */
    getPermissions(callback) {
        this.models.auth_permissions.findAll({
            raw: true,
            attributes: ['group','plugin', 'function']
        }).then(res => {
            let perms = {};
            for (let i in res) {
                let item = res[i];
                if (typeof perms[item.group] == 'undefined') perms[item.group] = {};
                if (typeof perms[item.group][item.plugin] == 'undefined') perms[item.group][item.plugin] = [];
                perms[item.group][item.plugin].push(item.function);
            }
            callback(perms);
        });
    }
    /** Добавление группы */
    newGroup(name, callback) {
        this.models.auth_groups.create({
            name: name
        }).then(res => {
            callback({id:res.dataValues.id});
        }).catch(error => {
            callback(false);
        });
    }
    /** Удаление группы по ID */
    deleteGroup(id, callback) {
        this.models.auth_groups.destroy({
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }
    /** Получение данных группы по ID */
    getGroupData(id, callback) {
        this.models.auth_groups.findAll({
            raw: true,
            attributes: ['id','name'],
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            callback((res.length > 0 ? res[0] : false));
        });
    }
    /** Редактирование группы */
    editGroup(id, name, callback) {
        this.models.auth_groups.update({
            name: name
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }
    /** Добавление прав доступа */
    insertPermission(group_id, plugin, func, callback) {
        this.models.auth_permissions.create({
            group: parseInt(group_id),
            plugin: plugin,
            'function': func
        }).then(res => {
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }
    /** Удаление прав доступа */
    deletePermission(group_id, plugin, func, callback) {
        this.models.auth_permissions.destroy({
            where: {
                group: parseInt(group_id),
                plugin: plugin,
                'function': func
            }
        }).then(res => {
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }


}