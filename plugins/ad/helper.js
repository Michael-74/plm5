module.exports = class {

    constructor(db) {
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
        this.defineModels();
    }

    async defineModels() {
        this.sequelize.define('ad_users', {
            'id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'fio': {
                type: this.Sequelize.STRING,
                allowNull: true
            },
            'login': {
                type: this.Sequelize.STRING,
                allowNull: true
            },
            'depts': {
                type: this.Sequelize.STRING,
                allowNull: true
            },
            'state': {
                type: this.Sequelize.BOOLEAN,
                allowNull: true
            },
            'data': {
                type: this.Sequelize.TEXT,
                allowNull: true
            }
        }, {
            timestamps: false,
            tableName: 'ad_users'
        });
        await this.sequelize.models.ad_users.sync();
    }

    getUserList(callback) {
        this.models.ad_users.findAll({
            raw: true,
            attributes: ['id', 'fio', 'login', 'depts'],
            where: {
                state: 1,
                fio: {
                    [this.Op.ne]: '\'\''
                }
            }
        }).then(res => {
            callback(res);
        });
    }

    // GET USERLIST FROM DB
    getDBUlist(callback) {
        this.models.ad_users.findAll({
            raw: true,
            attributes: ['login'],
        }).then(res => {
            let ulist = [];     // LIST OF EXISTING USERS
            for (let i in res) {
                ulist.push(res[i].login)
            }
            callback(ulist);
        });
    }

    isUserDisabled(udata) {
        return (udata.accDisabled === true ? '\'0\'' : '\'1\'');
    }

    // UPDATE USERS
    updateDBUsers(user_list, ad_users, callback) {
        let ins_users = [];
        for (let n in user_list.ins) {
            let depts = ad_users[user_list.ins[n]]['depts'];
            // let state = (this.isExcludedDepts(depts) === false ? '\'1\'' : '\'0\'');
            let state = this.isUserDisabled(ad_users[user_list.ins[n]]);
            let ins_user_item = [
                '\''+(typeof ad_users[user_list.ins[n]]['displayName'] === 'undefined' ? '':ad_users[user_list.ins[n]]['displayName'])+'\'',
                '\''+ad_users[user_list.ins[n]]['sAMAccountName']+'\'',
                '\''+depts.join(',')+'\'',
                state
            ];
            ins_users.push('('+ins_user_item.join(',')+')');
        }

        let upd_users = [];
        for (let n in user_list.upd) {
            let depts = ad_users[user_list.upd[n]]['depts'];
            // let state = (this.isExcludedDepts(depts) === false ? '\'1\'' : '\'0\'');
            let state = this.isUserDisabled(ad_users[user_list.upd[n]]);
            let upd_user_item = [
                '\''+ad_users[user_list.upd[n]]['sAMAccountName']+'\'',
                '\''+depts.join(',')+'\'',
                state
            ];
            upd_users.push('('+upd_user_item.join(',')+')');
        }

        if (upd_users.length > 0) {
            this.sequelize.query('UPDATE [ad_users] SET depts = tempTBL.depts, state = tempTBL.state FROM [ad_users] INNER JOIN (VALUES '+upd_users.join(',')+') AS tempTBL (login, depts, state) ON [ad_users].[login] = tempTBL.login', { 
                raw: true
            }).then(([result, metadata]) => {
                if (ins_users.length > 0) {
                    this.sequelize.query('INSERT INTO [ad_users] ([fio], [login], [depts], [state]) OUTPUT INSERTED.id VALUES '+ins_users.join(','), { 
                        raw: true
                    }).then(([result2, metadata2]) => {
                        callback({ins:metadata2});
                    });
                } else {
                    callback({ins:0});
                }
            });
        } else {
            this.sequelize.query('INSERT INTO [ad_users] ([fio], [login], [depts], [state]) OUTPUT INSERTED.id VALUES '+ins_users.join(','), { 
                raw: true
            }).then(([result2, metadata]) => {
                callback({ins:metadata});
            });
        }
    }

    getUserInfo(user_id, callback) {
        this.models.ad_users.findAll({
            raw: true,
            attributes: ['id', 'fio', 'login', 'depts', 'state', 'data'],
            where: {
                id: user_id
            }
        }).then(res => {
            if (res.length > 0) {
                callback(res[0]);
            } else {
                callback(false);
            }
        }).catch(error => {
            callback(false);
        });
    }

}