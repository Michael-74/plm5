const   moment = require('moment');

module.exports = class {

    constructor(db) {
        
        this.pub = db.pub
        this.pub_get = db.pub_get
        this.pub_get2 = db.pub_get2
        db.redis_sub.subscribe('callback:manufacture')
    }

    /** Получение факта по станции */
    getManufactureStationDone = (station_id) => this.pub_get2('manufacture', 'manufacture_done', 'getManufactureStationDone', [station_id])
    /** Получение данных по станциям */
    getManStations = (sort, qstr) => this.pub_get2('manufacture', 'standartizer_station', 'getManStations', [sort, qstr])
    /** Получение плана станциии */
    getPlanDataByStationId = (station_id) => this.pub_get2('standartizer', 'standartizer_plans', 'getPlanDataByStationId', [station_id])
    


}