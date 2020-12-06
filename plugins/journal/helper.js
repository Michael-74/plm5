const moment = require('moment');

module.exports = class {

    constructor(db) {
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
        this.pagination_limit = db.pagination_limit;
        this.redis = db.redis
        this.pub = db.pub
        this.pub_get = db.pub_get
        this.pub_get2 = db.pub_get2
        db.redis_sub.subscribe('callback:journal')
    }

    /** Сохранение логов
     * 
     * @param {Object} data Данные лога
     */
    saveLog(data) {
        this.pub('journal', 'fire', 'create', [
            data.uid || 0,
            data.plugin,
            data.action,
            data.data
        ])
    }

    /** Получение списка логов */
    getLogs(query, callback) {
        let page = (typeof query.page != 'undefined' ? query.page : 1)
        let limit = this.pagination_limit
        let orderVal = (typeof query.sortVal != 'undefined'?query.sortVal:'date')
        let orderDir = (typeof query.sortDir != 'undefined'?(query.sortDir=='asc'?'asc':'desc'):'desc')

        this.pub_get2('journal', 'logs', 'getLogs', [page, limit, orderVal, orderDir])
            .then(data => {
                callback(data, {page: page})
            })
    }
    /** Удаление выбранного события */
    deleteLog(id, callback) {
        this.pub('journal', 'fire', 'deleteLog', id)
        callback(true);
    }
    /** Очистка логов */
    clearAllLogs(uid, callback) {
        this.pub('journal', 'fire', 'clearAllLogs', uid)
        callback(true)
    }

}