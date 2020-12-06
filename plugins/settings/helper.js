module.exports = class {

    constructor(db) {
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
    }

    getStateParams(callback) {
        let params = {};
        this.models.keyvalue.findAll({
            raw: true,
            attributes: ['key','value'],
            where: {
                'key': {
                    [this.Op.startsWith]: 'param_state_'
                }
            }
        }).then(res => {
            for (let i in res) {
                let key = res[i].key.split('_');
                params[key[2]] = res[i].value;
            }
            callback(params);
        });
    }

    getStateNum(callback) {
        let params = {};
        this.models.keyvalue.findAll({
            raw: true,
            attributes: ['key','value'],
            where: {
                'key': {
                    [this.Op.startsWith]: 'param_num_'
                }
            }
        }).then(res => {
            for (let i in res) {
                let key = res[i].key.split('_');
                params[key[2]] = res[i].value;
            }
            callback(params);
        });
    }

    updateStateParam(id, state, callback) {
        this.models.keyvalue.update({
            value: (state == 1 ? 'true' : 'false')
        }, {
            where: {
                key: 'param_state_'+id
            }
        }).then((res) => {
            callback(true);
        }).catch(error => {
            callback(false);
        });
    }

    updateNumFields(id, value, callback) {
        this.models.keyvalue.update({
            value: parseInt(value)
        }, {
            where: {
                key: 'param_num_'+id
            }
        }).then((res) => {
            callback(true);
        }).catch(error => {
            callback(false);
        });

    }

}