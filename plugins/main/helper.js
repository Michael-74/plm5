module.exports = class {

    constructor(db) {
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
    }

    /** Получение массива [плагин:функция] по id пользователя */
    getAccessList(plugins, user_id, callback) {
        let access_list = [
            'main:main',
            'main:showMenu'
        ];
        this.getUserGroups(user_id, (groups) => {
            if (groups.includes(1)) {
                for (let i in plugins) {
                    let plugin_name = i;
                    let plugin_permissions = plugins[plugin_name].permissions;
                    for (let j in plugin_permissions) {
                        access_list.push(plugin_name+':'+j);
                    }
                }
                callback(access_list);
            } else {
                this.getAllowedPlugins(user_id, (user_allowed) => {
                    for (let i in user_allowed) {
                        access_list.push(user_allowed[i].plugin+':'+user_allowed[i].function);
                    }
                    callback(access_list);
                });
            }
        });
    }

    /** Получение списка групп пользователя */
    getUserGroups(user_id, callback) {
        this.models.auth_users_groups.findAll({
            raw: true,
            attributes: ['group_id'],
            where: {
                user_id: user_id
            }
        }).then(res => {
            let groups = [];
            for (let i in res) {
                groups.push(res[i].group_id);
            }
            callback(groups);
        });
    }

    /** Получение списка доступных плагинов */
    getAllowedPlugins(user_id, callback) {
        this.sequelize.models.auth_users_groups.belongsTo(this.sequelize.models.auth_permissions, {foreignKey: 'group_id', targetKey: 'group'});
        this.models.auth_users_groups.findAll({
            raw: true,
            attributes: ['auth_permission.plugin','auth_permission.function'],
            include: [{
                model: this.models.auth_permissions,
                required: false
            }],
            where: {
                user_id: user_id
            }
        }).then(res => {
            let permissions = [];
            for (let i in res) {
                permissions.push({plugin:res[i].plugin,function:res[i].function});
            }
            callback(permissions);
        });
    }

}