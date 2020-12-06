const   moment = require('moment');

module.exports = class {

    constructor(db) {
        this.pub = db.pub
        this.pub_get = db.pub_get
        this.pub_get2 = db.pub_get2
        db.redis_sub.subscribe('callback:standartizer')
    }

    // ----------- ОПЕРАЦИИ
    /** Получение всех операций по ID */
    getAllCategories = () => this.pub_get2('standartizer', 'standartizer_category', 'getAllCategories', [])
    /** Получение всех операций по ID группы */
    getCategories = (id) => this.pub_get2('standartizer', 'standartizer_category', 'getCategories', [id])
    /** Получение всех операций по ID группы без вялоудаленных */
    getCategoriesWONull = (id) => this.pub_get2('standartizer', 'standartizer_category', 'getCategoriesWONull', [id])
    /** Получение группы операций по ID */
    getGroup = (id) => this.pub_get2('standartizer', 'standartizer_category_group', 'getGroup', [id])
    /** Получение групп операций */
    getGroups = (id) => this.pub_get2('standartizer', 'standartizer_category_group', 'getGroups', [])


    // ----------- СТАНЦИИ
    /** Получение данных станции по ID */
    getStation = (id) => this.pub_get2('standartizer', 'standartizer_station', 'getStation', [id])
    /** Получение данных по станциям */
    getAllStations2 = (sort, qstr, showdone, station_id) => this.pub_get2('standartizer', 'standartizer_station', 'getAllStations2', [sort, qstr, showdone, station_id])
    /** Получение планов станциии */
    getStationsPlans = (station_id) => this.pub_get2('standartizer', 'standartizer_plans', 'getStationsPlans', [station_id])
    // получение инфо плана
    getPlanInfo = (plan_id) => this.pub_get2('standartizer', 'standartizer_plans', 'getPlanInfo', [plan_id])
    /** Получение длителности операции для изменения плана */
    getOperationDuration = (plan_id, operation_id, date) => this.pub_get2('standartizer', 'standartizer_plans_operations', 'getOperationDuration', [plan_id, operation_id, date])
    /** Получение всех типов дат в диапазоне */
    getLenInDates = (first_date, last_date, allow_minus) => this.pub_get2('standartizer', 'standartizer_plans_operations', 'getLenInDates', [first_date, last_date, allow_minus])
        
    /** Создание копии расчета станции */
    copyList(id, user_id, callback) {
        this.getStation(id)
            .then((parent_data) => {
                this.pub_get2('standartizer', 'standartizer_station', 'addStationWData', [parent_data, user_id])
                    .then((new_id) => {
                        callback(new_id == false ? false : true)
                    });
            });
    }


    // ----------- OTHER (Вспомогательные функции)
    /** Вспомогательная функция: подготовка категорий */
    prepareCats(res) {
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
        for (let i in cats) {
            cats[i].allchilds = this.getAllChilds(cats, cats[i], []);
        }
        for (let i in cats) {
            cats[i].levels = this.buildLevels(cats[i], cats, []);
            cats[i].levels = cats[i].levels.reverse()
        }
        return cats;
    }
    /** Вспомогательная функция: Получение всех потомков */
    getAllChilds(cats, item, allchilds) {
        if (item.childs.length == 0) {
            return allchilds;
        } else {
            for (let i in item.childs) {
                allchilds.push(item.childs[i]);
                let additional_childs = this.getAllChilds(cats, cats[item.childs[i]], []);
                for (let n in additional_childs) {
                    allchilds.push(additional_childs[n]);
                }
            }
            return allchilds;
        }
    }
    /** Постройка нумерации */
    buildLevels(item, cats, levels) {
        if (typeof item != 'undefined') {
            if (item.parent_id == 0) {
                levels.push(item.num);
                return levels;
            } else {
                levels.push(item.num);
                return this.buildLevels(cats[item.parent_id], cats, levels);
            }
        } else {
            return levels;
        }
        
    }/** Копирование группы операций */
    copyGroup(id, user_id, callback) {
        this.getGroup(id).then((parent_group) => {
            if (parent_group === false) {
                callback(false);
            } else {
                this.pub_get2('standartizer', 'standartizer_category_group', 'addGroupSection', ['Копия '+parent_group.name, user_id]).then(async (group_id) => {
                    if (group_id === false) {
                        callback(false);
                    } else {
                        callback(true);
                        let olds = {};
                        let pp = {};
                        let cats = await this.getCategories(parent_group.id)
                        let all_cats_ids = [0];
                        let all_existed_ids = [];
                        let all_not_existed_ids = [];
                        for (let i in cats) all_cats_ids.push(parseInt(cats[i].id));
                        for (let i in cats) {
                            if (all_cats_ids.includes(parseInt(cats[i].parent_id)) == true) {
                                if (all_existed_ids.includes(parseInt(cats[i].id)) == false) all_existed_ids.push(parseInt(cats[i].id));
                            } else {
                                if (all_not_existed_ids.includes(parseInt(cats[i].id)) == false) all_not_existed_ids.push(parseInt(cats[i].id));
                                for (let jj in cats[i].allchilds) {
                                    if (all_not_existed_ids.includes(parseInt(cats[i].allchilds[jj])) == false) all_not_existed_ids.push(parseInt(cats[i].allchilds[jj]));
                                }
                            }
                        }
                        for (let i in cats) {
                            if (all_not_existed_ids.includes(parseInt(cats[i].id)) === false || cats[i].parent_id == 0) {
                                if (typeof cats[i].id != 'undefined') {
                                    let new_id = await this.pub_get2('standartizer', 'standartizer_category', 'addSection', [parseInt(group_id), parseInt(user_id), cats[i].name, 0, 0, cats[i].num, cats[i].average_payment, cats[i].work_long, parseInt(cats[i].order), parseInt(cats[i].worker_section_id), cats[i].parallel, cats[i].stype])
                                    olds[cats[i].id] = new_id;
                                    if (cats[i].parent_id === 0 && cats[i].prev_id === 0) {

                                    } else {
                                        pp[new_id] = {parent: (cats[i].parent_id === 0?0:parseInt(cats[i].parent_id)), prev: (cats[i].prev_id === 0?0:parseInt(cats[i].prev_id))}
                                    }
                                }
                            }
                        }
                        for (let j in pp) {
                            await this.pub_get2('standartizer', 'standartizer_category', 'changeParentSection2', [j, (pp[j].parent===0?0:olds[pp[j].parent]), (pp[j].prev===0?0:olds[pp[j].prev])])
                        }
                    }
                });
                
            }
        });
    }

}