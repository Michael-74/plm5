const   ActiveDirectory = require('activedirectory'),
        qasync = require('async'),
        crypto = require('crypto');

module.exports = class {

    constructor(that, Helper) {
        that._d('- plugin "AD" loaded');
        this.name = 'Active Directory';
        this._d = (msg) => that._d(msg);
        this.helper = new Helper(that.db);
        this.plugins = that.plugins;
        this.events = that.events;
        this.options = that.options;
        // this.refreshData();
        setInterval(() => {
            this.refreshData();
        }, that.options.ad.refresh_interval);  // 12H
    }

    _hash(str) {
        return crypto.createHmac('sha1', 'salt').update(str, 'utf8').digest('hex');
    }

    // Обновление данных по периоду
    refreshData(user_id, callback) {
        let user_list = {
            ins: [],    // 2 INSERT
            upd: []     // 2 UPDATE
        }
        this.getADUlist((ad_data) => {
            this.helper.getDBUlist((ulist) => {
                // FOREACH ALL USERS FROM AD
                for (let i in ad_data.users) {
                    let login = ad_data.users[i].sAMAccountName;
                    if (ulist.includes(login) === false) {
                        user_list.ins.push(login);
                    } else {
                        user_list.upd.push(login);
                    }
                }
                this.helper.updateDBUsers(user_list, ad_data.users, (data) => {
                    this.events.emit('log', {
                        uid: (typeof user_id != 'undefined' ? user_id : 0),
                        plugin: 'ad',
                        action: 'update',
                        data: {
                            inserted: data.ins
                        }
                    });
                    if (callback) {
                        callback(true);
                    }
                });
            });
        })
    }

    _checkHexApp(userAccountControl) {
        let h_arr = userAccountControl.split('');
        return (h_arr[h_arr.length-1] === '2' ? true : false);
    }

    getADUlist(callback) {
        // INIT AD w global ad options
        let ad = new ActiveDirectory(this.options.ad);
        // GET USERS in GROUP queue
        let queue = qasync.queue((group, callback) => {
            ad.getUsersForGroup(group.cn, (err, users) => {
                callback(group, users);
            });
        }, 10);
        let ad_groups = {};
        let ad_users = {};
        let users_hashes = [];
        let depts = [];
        // GET ALL GROUPS
        ad.findGroups('CN=*', (err, groups) => {
            for (let i in groups) {
                queue.push(groups[i], (group, users) => {
                    // CHECK IF GROUP not EMPTY
                    if (users.length > 0) {
                        ad_groups[group.cn] = (typeof group.description === 'undefined' ? '' : group.description);
                        for (let j in users) {
                            // GEN USER UNIQ HASH
                            let uhash = this._hash(JSON.stringify(users[j]));
                            // CHECK DUPLIACTE USER BY HASH
                            if (users_hashes.includes(uhash) === false) {
                                users_hashes.push(uhash);
                                // DISCARD EXTRA DATA
                                let cuser = {
                                    displayName: users[j].displayName,
                                    pwdLastSet: users[j].pwdLastSet,
                                    sAMAccountName: users[j].sAMAccountName,
                                    uacHexMask: parseInt(users[j].userAccountControl).toString(16),
                                    accDisabled: this._checkHexApp(parseInt(users[j].userAccountControl).toString(16)),
                                    userAccountControl: users[j].userAccountControl,
                                    whenCreated: users[j].whenCreated,
                                    userPrincipalName: users[j].userPrincipalName,
                                    ip_phone: (typeof users[j].telephoneNumber ==='undefined' ? '' : users[j].telephoneNumber),
                                    mobile_phone: (typeof users[j].otherTelephone ==='undefined' ? '' : users[j].otherTelephone.join(','))
                                };
                                cuser.depts = [];
                                // GET DEPTS FROM dn PARAM
                                let sdn = users[j]['dn'].split(',');
                                for (let s in sdn) {
                                    let xsdn = sdn[s].split('=');
                                    if (xsdn[0] === 'OU') {
                                        cuser.depts.push(xsdn[1]);
                                        if (depts.includes(xsdn[1]) === false) {
                                            depts.push(xsdn[1]);
                                        }
                                    }
                                }
                                ad_users[cuser.sAMAccountName] = cuser;
                            }
                        }
                    }
                });
            }
        });
        queue.drain(() => {
            // CALLBACK DATA
            callback({
                groups: ad_groups,
                users: ad_users,
                depts: depts
            });
        });
    }

}