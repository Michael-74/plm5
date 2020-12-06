const Sequelize = require('sequelize');
const Redis = require('ioredis')
const crypto = require('crypto')

module.exports = class {

    constructor(db_config, options, events) {
        this.db_config = db_config;
        this.options = options;
        this.events = events
        this.redis = new Redis(this.options.redis);
        this.redis_sub = new Redis(this.options.redis);
        this.redis_cache = new Redis(this.options.redis_cache);
        this.sequelize = new Sequelize(this.db_config.database, this.db_config.username, this.db_config.password, this.db_config.opt);
        this.Sequelize = Sequelize;
        this.Op = Sequelize.Op;
        this.pagination_limit = this.db_config.pagination_limit;
        this.defineModels();
    }

    /** Предопределение моделей для БД */
    defineModels() {
        // KEYVALUE
        this.sequelize.define('keyvalue', {
            'key': {
                type: Sequelize.STRING,
                allowNull: false,
                autoIncrement: false,
                primaryKey: true
            },
            'value': {
                type: Sequelize.STRING,
            }
        }, {
            timestamps: false,
            tableName: 'keyvalue'
        });
        // AUTH_GROUPS
        this.sequelize.define('auth_groups', {
            'id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'name': {
                type: Sequelize.STRING,
            }
        }, {
            timestamps: false,
            tableName: 'auth_groups'
        });
        // AUTH_LOGIN_ATTEMPTS
        this.sequelize.define('auth_login_attempts', {
            'id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'ip_address': {
                type: Sequelize.STRING(15),
            },
            'login': {
                type: Sequelize.STRING,
                allowNull: false
            },
            'date': {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        }, {
            timestamps: false,
            tableName: 'auth_login_attempts'
        });
        // AUTH_LOGIN_PERMISSIONS
        this.sequelize.define('auth_permissions', {
            'id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'group': {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'auth_groups',
                    key: 'id'
                }
            },
            'plugin': {
                type: Sequelize.STRING,
            },
            'function': {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
            timestamps: false,
            tableName: 'auth_permissions'
        });
        // AUTH_USERS
        this.sequelize.define('auth_users', {
            'id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'password': {
                type: Sequelize.STRING(512),
            },
            'email': {
                type: Sequelize.STRING,
            },
            'first_name': {
                type: Sequelize.STRING,
            },
            'last_name': {
                type: Sequelize.STRING,
            },
            'active': {
                type: Sequelize.BOOLEAN,
            },
            'phone': {
                type: Sequelize.STRING,
            },
            'salt': {
                type: Sequelize.STRING,
            },
            'created_date': {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            'type': {
                type: Sequelize.INTEGER,
            }
        }, {
            timestamps: false,
            tableName: 'auth_users'
        });
        // AUTH_USERS_GROUPS
        this.sequelize.define('auth_users_groups', {
            'id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'user_id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'auth_users',
                    key: 'id'
                }
            },
            'group_id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'auth_groups',
                    key: 'id'
                }
            }
        }, {
            timestamps: false,
            tableName: 'auth_users_groups'
        });
        // LOGS
        this.sequelize.define('logs', {
            'id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'user_id': {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            'plugin': {
                type: Sequelize.STRING,
            },
            'action': {
                type: Sequelize.STRING,
            },
            'date': {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            'data': {
                type: Sequelize.TEXT,
            },
        }, {
            timestamps: false,
            tableName: 'logs'
        });
        // PLUGINS
        this.sequelize.define('plugins', {
            'id': {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'name': {
                type: Sequelize.STRING,
                allowNull: false,
            },
            'order': {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            'state': {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            }
        }, {
            timestamps: false,
            tableName: 'plugins'
        });
        // this.sequelize.models.auth_users_groups.associate = (models) => {
        //     this.sequelize.models.auth_users_groups.belongsTo(this.sequelize.models.auth_users, { targetKey: 'id', foreignKey: 'user_id'})
        //     this.sequelize.models.auth_users_groups.belongsTo(this.sequelize.models.auth_users, { targetKey: 'id', foreignKey: 'group_id'})
        // }

        // this.sequelize.models.auth_users_groups.belongsTo(this.sequelize.models.auth_users, {foreignKey: 'fk_userid', targetKey: 'user_id'});
        this.sequelize.models.auth_users.hasMany(this.sequelize.models.auth_users_groups, {foreignKey: 'user_id'});

        // this.sequelize.models.auth_groups.hasMany(this.sequelize.models.auth_permissions, {foreignKey: 'group'});

    }

    /** Проверка подключения к БД */
    check_credential = () => new Promise((resolve, reject) => this.sequelize.authenticate().then(()=> resolve()).catch(err => reject(2)))

    /** Проверка наличия данных в БД */
    check_db_installed = () => this.sequelize.models.keyvalue.findOne({where:{key:'installed'}}).then((res) => res.dataValues.value==='true' ? true : false)


    /** Синхронизация моделей БД */
    async syncdb(cb) {
        await this.sequelize.models.keyvalue.sync();
        await this.sequelize.models.keyvalue.create({key:'installed', value:'true'});
        await this.sequelize.models.keyvalue.create({key:'param_state_1', value:'true'});
        await this.sequelize.models.auth_groups.sync();
        await this.sequelize.models.auth_groups.create({name:'Администратор'});
        await this.sequelize.models.auth_groups.create({name:'Пользователь'});
        await this.sequelize.models.auth_login_attempts.sync();
        await this.sequelize.models.auth_permissions.sync();
        await this.sequelize.models.auth_users.sync();
        await this.sequelize.models.auth_users_groups.sync();
        await this.sequelize.models.logs.sync();
        await this.sequelize.models.plugins.sync();
        await this.sequelize.models.plugins.create({name:'auth', order:1, state:1});
        await this.sequelize.models.plugins.create({name:'main', order:2, state:1});
        await this.sequelize.models.plugins.create({name:'settings', order:3, state:1});
        await this.sequelize.models.plugins.create({name:'journal', order:4, state:1});
        await this.sequelize.models.plugins.create({name:'users', order:5, state:1});
        await this.sequelize.models.plugins.create({name:'apps', order:6, state:1});
        cb(true);
    }

    getPlugins(cb) {
        this.sequelize.models.plugins.findAll({
            raw: true,
            order: [
                ['order', 'ASC']
            ],
            where: {'state': 1}
        }).then(res => {
            cb(res);
        });
    }

    getKeyValue(key) {
        return new Promise((resolve) => {
            this.sequelize.models.keyvalue.findAll({
                raw: true,
                attributes: ['value'],
                where: {'key': key}
            }).then(res => {
                if (res.length > 0) {
                    resolve(res[0].value);
                } else {
                    resolve(false);
                }
            });
        });
    }
    /** Чтение данных из кеша */
    get_cache(name) {
        return new Promise((resolve) => {
            this.redis_cache.get(name, (err, result) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(JSON.parse(result));
                }
            });  
        });
    }


    /** Отправка 'Publish' публикации через Redis */
    pub = (plugin, type, fn, arr) => {
        return new Promise((resolve) => {
            let hash = crypto.createHash('sha1').update((typeof arr == 'object' ? JSON.stringify([plugin, type, fn, ...arr]) : JSON.stringify([plugin, type, fn, arr])), 'utf-8').digest('hex');
            this.redis.publish(plugin, (typeof arr == 'object' ? JSON.stringify([type, hash, fn, ...arr]) : JSON.stringify([type, hash, fn, arr]))).then(() => {
                resolve(hash)
            })
        })
        
    }

    /** urh request */
    urh(db_name, fn_name, fn, attr) {
        return new Promise((resolve) => {
            let cache_name = fn_name+':'+crypto.createHash('sha1').update(JSON.stringify(attr), 'utf-8').digest('hex');
            this.getCache(db_name, cache_name)
                .then((data) => {
                    if (data === false) {
                        fn(...attr).then((res) => {
                            resolve(res)
                        })
                    } else {
                        resolve(data)
                    }
                })
        })
    }

    /** Получение кэша */
    getCache = (db_name, cache_name) => {
        return new Promise((resolve) => {
            this.getTime(db_name).then((db_time) => {
                if (db_time === null) {
                    resolve(false)
                } else {
                    this.redis.get(cache_name+':'+db_time, (err, res) => {
                        if (res === null) {
                            resolve(false)
                        } else {
                            resolve(JSON.parse(res))
                        }
                    })
                }
            })
        })
    }
    /** Полученипе метки времени с последним изменением в БД */
    getTime = (db_name) => {
        return this.redis.hget('cache_time', db_name, (err, res) => {
            return res
        })
    }

    /** Отправка 'Publish' публикации через Redis */
    // pub2 = (plugin, type, fn, arr) => {
    //     return new Promise((resolve) => {
    //         let hash = crypto.createHash('sha1').update((typeof arr == 'object' ? JSON.stringify([plugin, type, fn, ...arr]) : JSON.stringify([plugin, type, fn, arr])), 'utf-8').digest('hex');

    //         this.redis.publish(plugin, (typeof arr == 'object' ? JSON.stringify([type, hash, fn, ...arr]) : JSON.stringify([type, hash, fn, arr]))).then(() => {
    //             resolve(hash)
    //         })
    //     })
        
    // }

    pub_get = (plugin, db_name, fn, arr) => {
        return new Promise((resolve) => {
            this.pub(plugin, 'callback', fn, arr)
            .then(hash => {
                this.events.once('callback:'+hash, (cache_name) => {
                    this.getCache(db_name, cache_name)
                        .then((data) => {
                            resolve(data)
                        })
                })
            })
        })
    }

    pub_get2 = (plugin, db_name, fn, arr) => {
        return new Promise((resolve) => {
            this.pub(plugin, 'callback2', fn, [...arr, db_name])
            .then(hash => {
                this.events.once('callback:'+hash, (data) => {
                    resolve(data)
                })
            })
        })
    }

    /** Пересылка сообщений от Redis в обработчики плагинов */
    onMessage = (that) => {
        this.redis_sub.on('message', (channel, message) => {
            let is_callback = (channel.split('callback:').length > 0 ? true : false)
            if (is_callback) {
                let [hash, cache_name] = JSON.parse(message)
                that.events.emit('callback:'+hash, cache_name)
            }
            // if (typeof that.plugins[channel] !== 'undefined') {
                // that._d(channel)
                // that._d(message)
                // try {
                //     let [type, hash, fn, ...attr] = JSON.parse(message)
                //     if (type === 'fire') {
                //         that.plugins[channel].helper[fn](...attr)
                //     } else if (type === 'callback') {
                //         that.plugins[channel].helper[fn](...attr).then(data => {
                //             console.log(data);
                //         })
                //     }
                // } catch {

                // }
            // }
            
        });
    }

}