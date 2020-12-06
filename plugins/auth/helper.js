const   ActiveDirectory = require('activedirectory'),
        crypto = require('crypto');

module.exports = class {

    constructor(db) {
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
    }

    /** Получение данных пользователя по email
     * 
     * @param {string} email Электронная почта пользователя
     * @callback Объект с данными или false при отсутствии оных
     */
    getUserDataByEmail(email, callback) {
        this.models.auth_users.findAll({
            raw: true,
            where: {
                email: email
            }
        }).then(res => {
            if (res.length > 0) {
                this.models.auth_users_groups.findAll({
                    raw: true,
                    where: {
                        user_id: res[0].id
                    }
                }).then(res2 => {
                    let groups = [];
                    for (let j in res2) {
                        groups.push(res2[j].group_id);
                    }
                    res[0].group_id = groups;
                    callback(res);
                });
            } else {
                callback(false);
            }
        });
    }

    /** Создание нового пользователя
     * 
     * @param {string} email Электронная почта пользователя
     * @param {string} name Имя пользователя
     * @param {number} group ID группы
     * @param {string} password Пароль пользователя
     * @callback id | false
     */
    newUser(email, name, group, password, static_salt, callback) {
        this.getUserDataByEmail(email, async (user) => {
            if (user !== false) {
                callback(false);
            } else {
                let dynamic_salt = await this.genSalt();
                this.hashPassword(password, dynamic_salt, static_salt, (hashed_password) => {
                    this.models.auth_users.create({
                        email: email,
                        password: hashed_password,
                        first_name: name,
                        last_name: '',
                        active: '0',
                        phone: '',
                        salt: dynamic_salt,
                        type: 2
                    }).then(async res => {
                        let id = res.dataValues.id;
                        if (typeof group == 'number') {
                            this.models.auth_users_groups.create({user_id:id, group_id:group}).then(() => {
                                callback({id:id});
                            });
                        } else {
                            for (let i in group) {
                                await this.models.auth_users_groups.create({user_id:id, group_id:group[i]});
                            }
                            callback({id:id});
                        }
                    });
                });
            }
        });
    }
    
    /** Создание нового AD пользователя */
    newADUser(email, first_name, groups, callback) {
        this.getUserDataByEmail(email, async (user) => {
            if (user !== false) {
                callback(false);
            } else {
                this.models.auth_users.create({
                    email: email,
                    password: '',
                    first_name: first_name,
                    last_name: '',
                    active: '0',
                    phone: '',
                    salt: '',
                    type: 1
                }).then(async res => {
                    let id = res.dataValues.id;
                    if (typeof groups == 'number') {
                        this.models.auth_users_groups.create({user_id:id, group_id:groups}).then(() => {
                            callback({id:id});
                        });
                    } else {
                        for (let i in groups) {
                            await this.models.auth_users_groups.create({user_id:id, group_id:groups[i]});
                        }
                        callback({id:id});
                    }
                });
            }
        });
    }

    /** Изменить данные пользователя */
    editUser(id, email, name, password, groups, static_salt, callback) {
        this.getUserDataByEmail(email, (user_data) => {
            if (user_data === false || user_data[0].id == id) {
                this.models.auth_users_groups.destroy({
                    where: {
                        user_id: parseInt(id)
                    }
                }).then(async (res) => {
                    let udata = {};
                    if (password != false) {
                        let dynamic_salt = await this.genSalt();
                        let hashed_password = await this.hashPasswordAsync(password, dynamic_salt, static_salt);
                        udata = {
                            email: email,
                            first_name: name,
                            salt: dynamic_salt,
                            password: hashed_password
                        }
                    } else {
                        udata = {
                            email: email,
                            first_name: name
                        }
                    }
                    this.models.auth_users.update(udata, {
                        where: {
                            id: parseInt(id)
                        }
                    }).then(async (res) => {
                        if (typeof groups == 'object') {
                            for (let i in groups) {
                                await this.models.auth_users_groups.create({user_id:id, group_id:groups[i]});
                            }
                        } else {
                            await this.models.auth_users_groups.create({user_id:id, group_id:groups});
                        }
                        callback(true);
                    }).catch(error => {
                        callback(false);
                    });
                }).catch(error => {
                    callback(false);
                });
            } else {
                callback(false);
            }
        });
    }

    /** Изменение групп пользователей */
    async editUserGroups(id, groups, callback) {
        this.models.auth_users_groups.destroy({
            where: {
                user_id: parseInt(id)
            }
        }).then(async (res) => {
            if (typeof groups == 'object') {
                for (let i in groups) {
                    await this.models.auth_users_groups.create({user_id:id, group_id:groups[i]});
                }
            } else {
                await this.models.auth_users_groups.create({user_id:id, group_id:groups});
            }
            callback(true);
        })
    }

    /** Генерация динамической соли
     * @callback Строка с солью (Promise)
     */
    genSalt() {
        return new Promise((resolve) => {
            crypto.randomBytes(32, (err, buf) => {
                resolve(buf.toString('hex'));
            });
        })
    }

    /** Генерация пароля пользователя
     * 
     * @param {string} password Пароль не хешированный
     * @param {string} dynamic_salt Динамическая соль пользователя
     * @param {string} static_salt Статичная соль из настроек
     * @callback Строка с солью (Promise)
     */
    hashPassword(password, dynamic_salt, static_salt, callback) {
        crypto.pbkdf2(password, dynamic_salt+''+static_salt, 10000, 256, 'sha256', (err, derivedKey) => {
            callback(derivedKey.toString('hex'));
        })
    }

    /** Генерация пароля ASYNC */
    hashPasswordAsync(password, dynamic_salt, static_salt) {
        return new Promise((resolve) => {
            crypto.pbkdf2(password, dynamic_salt+''+static_salt, 10000, 256, 'sha256', (err, derivedKey) => {
                resolve(derivedKey.toString('hex'));
            })
        });
    }

    /** Добавление попытки авторизации  */
    insertLoginAttempts(email, ip_address) {
        this.models.auth_login_attempts.create({ip_address:ip_address, login:email});
    }

    /** Проверка попыток авторизации по IP */
    checkLoginAttempts(email, ip, login_attempts, time, callback) {
        this.models.auth_login_attempts.findAll({
            attributes: ['id'],
            limit: login_attempts+1,
            raw: true,
            where: {
                [this.Op.and]: [{
                    date: {
                        [this.Op.gt]: time
                    }
                },{
                    [this.Op.or]: [{
                        login: email
                    },{
                        ip_address: ip
                    }]
                }]
            },
            order: [
                ['date', 'DESC']
            ]
        }).then(res => {
            if (login_attempts <= res.length) {
                callback(true);
            } else {
                callback(false);
            }
        });
    }

    /** Проверка пароля пользователя + получение данных о пользователе
     * 
     * @param {String} username Электронная почта пользователя
     * @param {String} password Пароль не хешированный
     * @param {String} static_salt Статичная соль из настроек
     * @callback Объект с данными или false при отсутствии оных
     */
    checkUserLogin(username, password, static_salt, callback) {
        this.getUserDataByEmail(username, (user) => {
            if (user === false) {
                callback(false);
            } else {
                user = user[0];
                this.hashPassword(password, user.salt, static_salt, (hashed_password) => {
                    if (hashed_password === user.password && (user.active === 1 || user.active === true)) {
                        callback({
                            id: user.id,
                            first_name: user.first_name, 
                            last_name: user.last_name,
                            email: user.email,
                            // group_id: user.group_id,
                            type: user.type
                        });
                    } else {
                        callback(false);
                    }
                });
            }
        });
    }

    /** Проверка пароля AD пользователя + получение данных о пользователе */
    checkUserADLogin(username, password, ad_config, callback) {
        this.getUserDataByEmail(username, (user) => {
            if (user === false) {
                callback(false);
            } else {
                user = user[0];
                let ad = new ActiveDirectory({
                    url: ad_config.url,
                    baseDN: ad_config.baseDN
                });
                ad.authenticate(username, password, (err, auth) => {
                    if (err) {
                        callback(false);
                    } else {
                        if (auth && (user.active === 1 || user.active === true)) {
                            callback({
                                id: user.id,
                                first_name: user.first_name, 
                                last_name: user.last_name,
                                email: user.email,
                                group_id: user.group_id,
                                type: user.type
                            });
                        } else {
                            callback(false);
                        }
                    }
                });
            }
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




}