const   moment = require('moment');

module.exports = class {

    constructor(db) {
        this._cache = {};
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
        this.defineModel();
    }

    async defineModel() {
        this.sequelize.define('smk_category', {
            'id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'name': {
                type: this.Sequelize.STRING,
            },
            'parent_id': {
                type: this.Sequelize.INTEGER,
            },
            'order': {
                type: this.Sequelize.INTEGER,
            }
        }, {
            timestamps: false,
            tableName: 'smk_category'
        });
        this.sequelize.define('smk_file', {
            'id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'name': {
                type: this.Sequelize.STRING,
            },
            'format': {
                type: this.Sequelize.STRING,
            },
            'body': 'varbinary(MAX)',
            'categories': {
                type: this.Sequelize.STRING,
            },
            'mimetype': {
                type: this.Sequelize.STRING,
            },
            'date': {
                type: this.Sequelize.DATE,
                defaultValue: this.Sequelize.literal('CURRENT_TIMESTAMP')
            },
            'comment': {
                type: this.Sequelize.TEXT,
            },
            'tags': {
                type: this.Sequelize.TEXT,
            },
            'pinned': {
                type: this.Sequelize.BOOLEAN,
                defaultValue: 0
            }
        }, {
            timestamps: false,
            tableName: 'smk_file'
        });
        await this.sequelize.models.smk_category.sync();
        await this.sequelize.models.smk_file.sync();
        this._precacheSmkData();
    }

    /** Прекэш  */
    _precacheSmkData() {
        this._updateCache('categories', 'getCategories');
        this._updateCache('files', 'getAllFiles');

    }
    _updateCache(name, func) {
        this[func](data => {
            this._cache[name] = data;
        });
    } 



    getCategory(id, callback) {
        this.models.smk_category.findAll({
            raw: true,
            attributes: ['id', 'name', 'parent_id', 'order'],
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            callback((res.length > 0 ? res[0] : false));
        }).catch(error => {
            callback(false);
        });
    }

    getCategories(callback) {
        this.models.smk_category.findAll({
            raw: true,
            attributes: ['id', 'name', 'parent_id', 'order'],
            order: [
                ['order', 'ASC']
            ]
        }).then(res => {
            let cats = {};
            for (let i in res) {
                let item = res[i];
                if (typeof cats[item.id] === 'undefined') {
                    cats[item.id] = item;
                    cats[item.id].childs = [];
                } else {
                    for (let n in item) {
                        if (n != 'childs') {
                            cats[item.id][n] = item[n];
                        } else {
                            for (let j in item[n]) {
                                cats[item.id][n].push(item[n][j]);
                            }
                        }
                    }
                }
                if (item.parent_id !== 0) {
                    // дочерний элемент
                    if (typeof cats[item.parent_id] === 'undefined') {
                        cats[item.parent_id] = {
                            childs: [item.id]
                        }
                    } else {
                        if (typeof cats[item.parent_id].childs === 'undefined') {
                            cats[item.parent_id].childs = [item.id]; 
                        } else {
                            
                            cats[item.parent_id].childs.push(item.id);
                        }
                    }
                }
            }
            callback(cats);
        });

    }

    deleteSection(id, callback) {
        this.models.smk_category.destroy({
            where: {
                id: id
            }
        }).then(res => {
            this._updateCache('categories', 'getCategories');
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

    addSection(name, callback) {
        this.models.smk_category.create({
            name: name,
            parent_id: 0,
            order: 0
        }).then(res => {
            this._updateCache('categories', 'getCategories');
            callback(res.dataValues.id);
        }).catch(error => {
            callback(false);
        });
    }

    editSection(id, name, callback) {
        this.models.smk_category.update({
            name: name
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            this._updateCache('categories', 'getCategories');
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

    changeParentSection(id, parent, callback) {
        this.models.smk_category.update({
            parent_id: parseInt(parent)
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            this._updateCache('categories', 'getCategories');
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

    changeOrderSectionAsync(id, order) {
        return new Promise((resolve) => {
            this.changeOrderSection(id, order, (response) => {
                resolve(response);
            });
        });
    }

    changeOrderSection(id, order, callback) {
        this.models.smk_category.update({
            order: parseInt(order)
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            this._updateCache('categories', 'getCategories');
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

    formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

    getFileBody(id, callback) {
        this.models.smk_file.findAll({
            raw: true,
            attributes: ['id', 'name', 'format', 'body', 'mimetype'],
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            callback((res.length > 0 ? res[0] : false));
        }).catch(error => {
            callback(false);
        });
    }

    getFile(id, callback) {
        this.models.smk_file.findAll({
            raw: true,
            attributes: ['id', 'name', 'format', 'comment', 'categories', 'mimetype' , 'pinned'],
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            callback((res.length > 0 ? res[0] : false));
        }).catch(error => {
            callback(false);
        });
    }

    storeFile(file, cats) {
        let that = this;
        return new Promise((resolve) => {
            let fns = file.name.split('.');
            let extension = fns[fns.length-1];
            let name = fns.slice(0,-1).join('.');
            that.models.smk_file.create({
                name: name,
                format: extension,
                body: file.data,
                categories: cats,
                mimetype: file.mimetype,
                pinned: '0'
            }).then(res => {
                this._updateCache('files', 'getAllFiles');
                resolve(res.dataValues.id);
            }).catch(error => {
                resolve(false);
            });
        });
    }
    
    async addFiles(files, cats, callback) {
        let mod_cats = [];
        for (let n in cats) {
            mod_cats.push('#'+cats[n]+'#');
        }
        let mstat = true;
        if (typeof files.length == 'undefined') {
            let id = await this.storeFile(files, mod_cats.join(','));
            if (id == false) {
                mstat = false;
            }
        } else {
            for (let i in files) {
                let id = await this.storeFile(files[i], mod_cats.join(','));
                if (id == false) {
                    mstat = false;
                }
            }
        }
        callback(mstat);
    }

    getAllFiles(callback) {
        this.models.smk_file.findAll({
            raw: true,
            attributes: ['id', 'name', 'format', 'comment', 'categories', 'date', ['DATALENGTH([body])', 'len'], 'pinned'],
            order: [
                ['pinned', 'DESC'],
                ['id', 'ASC']
            ]
        }).then(res => {
            let recs = [];
            for (let i in res) {
                let item = res[i];
                let cdate = moment(item.date).utc();
                item.datec = cdate.format('DD.MM.YYYY');
                item.timec = cdate.format('HH:mm:ss');
                item.leng = this.formatBytes(item.len, 1);
                recs.push(item);
            }
            callback(recs);
        });
    }

    getCategoryFiles(cat, callback) {
        if (cat == 0) {
            callback(this._cache.files);
        } else {
            callback(this.filterItems('#'+cat+'#', this._cache.files));
            // where: {
            //     categories: {
            //         [this.Op.like]: '%#'+cat+'#%'
            //     }
            // }
        }
    }

    filterItems(needle, heystack) {
        return heystack.filter((item) => {
            return item.categories.toLowerCase().indexOf(needle.toLowerCase()) >= 0;
        })
    }

    deleteFile(id, callback) {
        this.models.smk_file.destroy({
            where: {
                id: id
            }
        }).then(res => {
            this._updateCache('files', 'getAllFiles');
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

    editFile(id, name, comment, cats, callback) {
        let mod_cats = [];
        for (let n in cats) {
            mod_cats.push('#'+cats[n]+'#');
        }
        this.models.smk_file.update({
            name: name,
            categories: mod_cats.join(','),
            comment: comment
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            this._updateCache('files', 'getAllFiles');
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

    updatePinState(id, state, callback) {
        this.models.smk_file.update({
            pinned: (state == 1? '1':'0')
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            this._updateCache('files', 'getAllFiles');
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

}