const   moment = require('moment');

module.exports = class {

    constructor(db) {
        // this.eventColors = [
        //     '#8db4e2',
        //     '#000000',
        //     '#3788d8',
        //     '#ffa500',
        //     '#008000',
        //     '#ff0000',
        //     '#e50089',
        //     '#e9692b',
        //     '#7800e5',
        //     '#376088',
        //     '#00a6e5'
        // ];
        this.eventColors = [
            '#8db4e2',
            '#000000',
            '#678ab3',
            '#3788d8',
            '#ffa500',
            '#008000',
            '#ff0000',
            '#e50089',
            '#e9692b',
            '#7800e5',
            '#376088',
            '#00a6e5'
        ];
        this.pub = db.pub
        this.pub_get = db.pub_get
        this.pub_get2 = db.pub_get2
        db.redis_sub.subscribe('callback:workers')
    }

    // ----------- РАБОТНИКИ
  

    /** Получение абочих дней всех рабочих  */
    _allWorkerDays = (first_date, last_date) => this.pub_get2('workers', 'registry_worker_days', '_allWorkerDays', [first_date, last_date])
        .then(worker_days => {
            return this.pub_get2('workers', 'workers_summary', 'getMaxAvailableLength', [first_date, last_date])
                .then(maxdays => {
                    // console.log(maxdays.dates);
                    let events = [];

                        for (let day in maxdays.dates) { 
                            if (maxdays.dates[day] != 0) {
                                events.push({
                                    resourceId: 'all',
                                    title: maxdays.dates[day].toString(),
                                    start: day
                                });
                            }
                        }

                    for (let secid in maxdays.sections) {
                        for (let day in maxdays.sections[secid]) { 
                            if (maxdays.sections[secid][day] != 0) {
                                events.push({
                                    resourceId: 's_'+secid,
                                    title: maxdays.sections[secid][day].toString(),
                                    start: day
                                });
                            }
                        }
                    }

                    for (let wid in worker_days) {
                        for (let day in worker_days[wid]) { 
                            if (worker_days[wid][day] != 0) {
                                events.push({
                                    resourceId: wid,
                                    title: worker_days[wid][day].toString(),
                                    start: day
                                });
                            }
                        }
                    }
                    return events
            })
        })
    
    // ----------- ! РАБОТНИКИ
    /** Получение списка всех рабочих  */
    getAllWorkers = () => this.pub_get2('workers', 'workers', 'getAllWorkers', [])
    /** Получение данных рабочего  */
    getWorker = (id) => this.pub_get2('workers', 'workers', 'getWorker', [id])
    /** Получение ID,FIO всех рабочих  */
    getAllWorkersIdFio = () => this.pub_get2('workers', 'workers', 'getAllWorkersIdFio', [])
    /** Получение ID,FIO рабочих по идентификатору бригады  */
    getBrigadeWorkersIdFio = (brigade_id) => this.pub_get2('workers', 'workers', 'getBrigadeWorkersIdFio', [brigade_id])
    /** Получение ID,FIO рабочих по идентификатору участка */
    getSectionsWorkersIdFio = (section_id) => this.pub_get2('workers', 'workers', 'getSectionsWorkersIdFio', [section_id])
    /** Получение списка выходных и праздников в диапазоне дат */
    getWorkersHolidays = (first_date, last_date) => this.pub_get2('workers', 'workers_holidays', 'getWorkersHolidays', [first_date, last_date])
    /** Получение списка дней рабочего  */
    _workerDays = (id, first_date, last_date) => {
        return this.getWorker(id)
            .then((worker) => {
                return this.pub_get2('workers', 'workers', '_workerDays', [id, first_date, last_date])
                    .then((data) => {
                        return [data, worker]
                    })
            })
    }
    /** Получение производственного календаря участка с разбивкой по рабочим  */
    getWorkersSectionDays = (section_id, first_date, last_date) => {
        return this.pub_get2('workers', 'registry_worker_days', 'getWorkersSectionDays', [section_id, first_date, last_date])
            .then((data) => {
                let events = [];
                for (let id in data) {
                    for (let i in data[id]) {
                        if (data[id][i] != 0) {
                            events.push({
                                resourceId: id,
                                title: data[id][i]+'',
                                work_length: data[id][i],
                                start: i
                            });
                        }
                    }
                }
                return events
            })
    }


    // ----------- ! УЧАСТКИ
    /** Получение данных участка по ID */
    getSection = (id) => this.pub_get2('workers', 'workers_sections', 'getSection', [id])
    /** Получение спсиска всех участков */
    getAllSections = () => this.pub_get2('workers', 'workers_sections', 'getAllSections', [])
    /** Получение спсиска из ID,NAME всех участков */
    getAllSectionsIdsNames = () => this.pub_get2('workers', 'workers_sections', 'getAllSectionsIdsNames', [])


    // ----------- ! БРИГАДЫ
    /** Получение данных бригады  */
    getBrigade = (id) => this.pub_get2('workers', 'workers_brigade', 'getBrigade', [id])
    /** Получение списка всех бригад  */
    getAllBrigades = () => this.pub_get2('workers', 'workers_brigade', 'getAllBrigades', [])
    /** Получение списка всех бригад  */
    getAllBrigadesSectionsMap = () => this.pub_get2('workers', 'workers_brigade', 'getAllBrigadesSectionsMap', [])
    /** Вспомогательная функция: Получение участков с бригадами  */
    _getSectionsBrigades = () => this.pub_get2('workers', 'workers_brigade', '_getSectionsBrigades', [])
    _getSectionsBrigades2 = () => this.pub_get2('workers', 'workers_brigade', '_getSectionsBrigades2', [])
    /** Получение списка всех бригад в виде объекта с номером и данными по участку */
    _getAllBrigadesWSectionsObj = () => this.pub_get2('workers', 'workers_brigade', '_getAllBrigadesWSectionsObj', [])
    /** Получение всех рабочих дней бригады  */
    getbrigadeDays = (brigade_id, first_date, last_date) => this.pub_get2('workers', 'registry_brigade_days', '_brigadeDays', [brigade_id, first_date, last_date])
    /** Получение производственного календаря бригады с разбивкой по рабочим  */
    getWorkersBrigadeDays = (brigade_id, first_date, last_date) => {
        return this.pub_get2('workers', 'registry_worker_days', 'getWorkersBrigadeDays', [brigade_id, first_date, last_date])
            .then((data) => {
                let events = [];
                for (let id in data) {
                    for (let i in data[id]) {
                        if (data[id][i] != 0) {
                            events.push({
                                resourceId: id,
                                title: data[id][i]+'',
                                work_length: data[id][i],
                                start: i
                            });
                        }
                    }
                }
                return events
            })
    }

    // ----------- ! ТАРИФНЫЕ СТАВКИ
    /** Получение списка всех ЧТС */
    getAllChts = () => this.pub_get2('workers', 'workers_chts', 'getAllChts', [])
    /** Вспомогательная функция: Группировка ЧТС в должности */
    getGroupChts = () => {
        return this.getAllChts()
            .then(chts => {
                let grchts = {};
                for (let i in chts) {
                    if (typeof grchts[chts[i].position] == 'undefined') {
                        grchts[chts[i].position] = [];
                    }
                    grchts[chts[i].position].push({
                        id: chts[i].id,
                        cls: chts[i]['class'],
                        rate: parseFloat(chts[i].rate)
                    });
                }
                return grchts;
            });
    }
    /** Вспомогательная функция: Группировка ЧТС по id */
    getGroupByIdChts() {
        return this.getAllChts()
            .then(chts => {
                let grchts = {};
                for (let i in chts) {
                    grchts[chts[i].id] = {
                        id: chts[i].id,
                        position: chts[i].position,
                        cls: chts[i]['class'],
                        rate: parseFloat(chts[i].rate)
                    };
                }
                return grchts;
            });
    }
    /** Получение данных ЧТС по ID */
    getChts = (id) => this.pub_get2('workers', 'workers_chts', 'getChts', [id])


    // ----------- ! ХЕЛПЕРЫ
    /** Вспомогательная функция: Удаление элемента из массива  */
    _removeFromArray(array, element) {
        return array.filter(el => el !== element);
    }


}