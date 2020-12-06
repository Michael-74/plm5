const   moment = require('moment');

module.exports = class {

    constructor(that, Helper, route, permissions, menu) {
        that._d('- plugin "standartizer" loaded');
        this.name = 'Кабинет нормировщика';
        this._d = (msg) => that._d(msg);
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.menu = menu;
        this.plugins = that.plugins;
        this.events = that.events;
        
        this.db = that.db

    }

    

    // ----------- СТАНЦИИ
    /** Форма добавления станции */ 
    addlist(req, res, next) {
        this.helper.getGroups().then((groups) => {
            res.render('../plugins/standartizer/views/list/add', {groups:groups});
        });
        
    }
    /** Вспомогательная функция: сумма всех дочерних элементов и их общая сумма */
    _allChildsSum(cats, data) {
        let all_summ = [0,0,0,0,0,0,0,0];
        let allchildsum = {};
        let childsum = {};
        for (let i in cats) {
            cats[i].ffchs = 0; // Фонд чел/час по операциям
            if (typeof data[cats[i].id] != 'undefined') {
                if (typeof data[cats[i].id].val6 != 'undefined') {
                    cats[i].ffchs = parseFloat(parseFloat(data[cats[i].id].val6) * parseFloat(cats[i].work_long));
                }
                if (typeof data[cats[i].id].val7 != 'undefined' && parseFloat(data[cats[i].id].val7) > 0) {
                    all_summ[7] = parseFloat(all_summ[7])  + parseFloat(cats[i].ffchs);
                }
            }
        }
        for (let i in cats) {
            if (typeof childsum[cats[i].id] == 'undefined') childsum[cats[i].id] = [0,0,0,0,0,0,0];
            if (typeof allchildsum[cats[i].id] == 'undefined') allchildsum[cats[i].id] = [0,0,0,0,0,0,0];
            if (cats[i].childs.length > 0) {
                for (let j in cats[i].childs) {
                    if (typeof data[cats[i].childs[j]] != 'undefined') {
                        if (typeof data[cats[i].childs[j]].val1 != 'undefined') { 
                            childsum[cats[i].id][0] = parseInt(childsum[cats[i].id][0]) + parseInt(data[cats[i].childs[j]].val1);
                            if (typeof data[cats[i].childs[j]].val7 != 'undefined' && parseFloat(data[cats[i].childs[j]].val7) > 0) all_summ[0] = parseInt(all_summ[0])  + parseInt(data[cats[i].childs[j]].val1);
                        }
                        if (typeof data[cats[i].childs[j]].val2 != 'undefined') { 
                            childsum[cats[i].id][1] = parseFloat(childsum[cats[i].id][1]) + parseFloat(data[cats[i].childs[j]].val2);
                            if (typeof data[cats[i].childs[j]].val7 != 'undefined' && parseFloat(data[cats[i].childs[j]].val7) > 0) all_summ[1] = parseFloat(all_summ[1])  + parseFloat(data[cats[i].childs[j]].val2);
                        }
                        if (typeof data[cats[i].childs[j]].val3 != 'undefined') { 
                            childsum[cats[i].id][2] = parseFloat(childsum[cats[i].id][2]) + parseFloat(data[cats[i].childs[j]].val3);
                            if (typeof data[cats[i].childs[j]].val7 != 'undefined' && parseFloat(data[cats[i].childs[j]].val7) > 0) all_summ[2] = parseFloat(all_summ[2])  + parseFloat(data[cats[i].childs[j]].val3);
                        }
                        if (typeof data[cats[i].childs[j]].val4 != 'undefined') { 
                            childsum[cats[i].id][3] = parseFloat(childsum[cats[i].id][3]) + parseFloat(data[cats[i].childs[j]].val4);
                            if (typeof data[cats[i].childs[j]].val7 != 'undefined' && parseFloat(data[cats[i].childs[j]].val7) > 0) all_summ[3] = parseFloat(all_summ[3])  + parseFloat(data[cats[i].childs[j]].val4);
                        }
                        if (typeof data[cats[i].childs[j]].val5 != 'undefined') { 
                            childsum[cats[i].id][4] = parseFloat(childsum[cats[i].id][4]) + parseFloat(data[cats[i].childs[j]].val5);
                            if (typeof data[cats[i].childs[j]].val7 != 'undefined' && parseFloat(data[cats[i].childs[j]].val7) > 0) all_summ[4] = parseFloat(all_summ[4])  + parseFloat(data[cats[i].childs[j]].val5);
                        }
                        if (typeof data[cats[i].childs[j]].val6 != 'undefined') { 
                            childsum[cats[i].id][5] = parseFloat(childsum[cats[i].id][5]) + parseFloat(data[cats[i].childs[j]].val6);
                            if (typeof data[cats[i].childs[j]].val7 != 'undefined' && parseFloat(data[cats[i].childs[j]].val7) > 0) all_summ[5] = parseFloat(all_summ[5])  + parseFloat(data[cats[i].childs[j]].val6);
                        }
                        if (typeof data[cats[i].childs[j]].val7 != 'undefined') { 
                            childsum[cats[i].id][6] = parseFloat(childsum[cats[i].id][6]) + parseFloat(data[cats[i].childs[j]].val7);
                            if (typeof data[cats[i].childs[j]].val7 != 'undefined' && parseFloat(data[cats[i].childs[j]].val7) > 0) all_summ[6] = parseFloat(all_summ[6])  + parseFloat(data[cats[i].childs[j]].val7);
                        }
                    }
                }
            }
            if (cats[i].allchilds.length > 0) {
                for (let j in cats[i].allchilds) {
                    if (typeof data[cats[i].allchilds[j]] != 'undefined') {
                        if (typeof data[cats[i].allchilds[j]].val1 != 'undefined') { 
                            if (parseFloat(data[cats[i].allchilds[j]].val6) != 0) {
                                allchildsum[cats[i].id][0] = parseInt(allchildsum[cats[i].id][0]) + parseInt(data[cats[i].allchilds[j]].val1);
                            }
                        }
                        if (typeof data[cats[i].allchilds[j]].val2 != 'undefined') { 
                            allchildsum[cats[i].id][1] = parseFloat(allchildsum[cats[i].id][1]) + parseFloat(data[cats[i].allchilds[j]].val2);
                        }
                        if (typeof data[cats[i].allchilds[j]].val3 != 'undefined') { 
                            allchildsum[cats[i].id][2] = parseFloat(allchildsum[cats[i].id][2]) + parseFloat(data[cats[i].allchilds[j]].val3);
                        }
                        if (typeof data[cats[i].allchilds[j]].val4 != 'undefined') { 
                            allchildsum[cats[i].id][3] = parseFloat(allchildsum[cats[i].id][3]) + parseFloat(data[cats[i].allchilds[j]].val4);
                        }
                        if (typeof data[cats[i].allchilds[j]].val5 != 'undefined') { 
                            allchildsum[cats[i].id][4] = parseFloat(allchildsum[cats[i].id][4]) + parseFloat(data[cats[i].allchilds[j]].val5);
                        }
                        if (typeof data[cats[i].allchilds[j]].val6 != 'undefined') { 
                            allchildsum[cats[i].id][5] = parseFloat(allchildsum[cats[i].id][5]) + parseFloat(data[cats[i].allchilds[j]].val6);
                        }
                        if (typeof data[cats[i].allchilds[j]].val7 != 'undefined') { 
                            allchildsum[cats[i].id][6] = parseFloat(allchildsum[cats[i].id][6]) + parseFloat(data[cats[i].allchilds[j]].val7);
                        }
                    }
                }
            }
            


            cats[i].childsum = childsum[cats[i].id];
            cats[i].allchildsum = allchildsum[cats[i].id];
        }
        cats.all_summ = all_summ;
        return cats;
    }
    viewCurList(req, res, next) {
        this.helper.getStation(parseInt(req.params.id))
            .then((station_data) => {
                this.helper.getCategoriesWONull(station_data.group_id).then((cats) => {
                    let data = {};
                    if (station_data.data != null) {
                        data = JSON.parse(station_data.data);
                    }
                    // Add childsum to cats
                    cats = this._allChildsSum(cats, data);
                    res.tpl('list/view', {
                        actions:[],
                        back: {
                            url: '/standartizer',
                            title: '← назад к списку станций'
                        },
                        id: parseInt(req.params.id),
                        title: 'Плановые трудозатраты для станции №'+station_data.num,
                        plugin: 'standartizer',
                        cats: cats,
                        data: data
                    });
                });
            });
    }
    editlist(req, res, next) {
        this.helper.getStation(parseInt(req.params.id))
            .then((station_data) => {
                this.helper.getCategoriesWONull(station_data.group_id).then((cats) => {
                    this.plugins.ol.helper.getIDbyOLnum(station_data.num).then(ol_data => {
                        let ol_id = false
                        if (typeof ol_data[0] != 'undefined') {
                            ol_id = ol_data[0].id
                        }
                        let data = {};
                        if (station_data.data != null) {
                            data = JSON.parse(station_data.data);
                        }
                        cats = this._allChildsSum(cats, data);
                        // this._d(station_data);
                        // this._d(data);
                        let autosave = (typeof req.cookies.autosave == 'undefined' ? false : (req.cookies.autosave === 'true' ? true : false));
                        res.tpl('list/edit', {
                            actions:[
                                {
                                    action: '<div class="autosave-button"><input class="switch-button" type="checkbox" onchange="StandartizeEditList.autosaveState(this);return false;" '+(autosave?'checked="checked"' : '')+'>Автосохранение</div>',
                                    access: 'standartizer:editList'
                                },
                                {
                                    action: '<a href="#" class="btn btn-sm btn-primary" onclick="StandartizeEditList.saveChanges(); return false;"><i class="fal fa-save"></i>&nbsp;сохранить изменения</a>',
                                    access: 'standartizer:editList'
                                }
                            ],
                            back: {
                                url: '/standartizer',
                                title: '← назад к списку станций'
                            },
                            id: parseInt(req.params.id),
                            title: 'Плановые трудозатраты для станции №'+station_data.num,
                            plugin: 'standartizer',
                            cats: cats,
                            data: data,
                            station_data: station_data,
                            ol_id: ol_id
                        });
                    });
                });
            });
    }
    /** Создание копии расчета станции */
    copylist(req, res, next) {
        this.helper.copyList(parseInt(req.params.id), req.user.id, (status) => {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'standartizer',
                    action: 'copylist',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            }   
        });
    }
    editlistPost(req, res, next) {
        let id = parseInt(req.params.id);
        let data = {};
        let ndata = {};
        let num = req.body.num;
        let description = req.body.description;
        let shipment_date = req.body.shipment_date;
        let note = req.body.note;
        let comment = req.body.comment;

        for (let i in req.body) {
            let rp = req.body[i];
            let rps = i.split('_');
            if (rps[0] == 'val') {
                if (typeof data[rps[1]] == 'undefined') {
                    data[rps[1]] = {};
                }
                data[rps[1]]['val'+rps[2]] = rp;
            }
        }
        for (let i in data) {
            if (data[i]['val1'] != '' || data[i]['val2'] != '' || data[i]['val3'] != '' || data[i]['val4'] != '' || data[i]['val5'] != '' || data[i]['val6'] != '' || data[i]['val7'] != '') {
                if (data[i]['val1'] == '') data[i]['val1'] = 0;
                if (data[i]['val2'] == '') data[i]['val2'] = 0;
                if (data[i]['val3'] == '') data[i]['val3'] = 0;
                if (data[i]['val4'] == '') data[i]['val4'] = 0;
                if (data[i]['val5'] == '') data[i]['val5'] = 0;
                if (data[i]['val6'] == '') data[i]['val6'] = 0;
                if (data[i]['val7'] == '') data[i]['val7'] = 0;
                ndata[i] = data[i];
            }
        }
        this.db.pub_get2('standartizer', 'standartizer_station', 'saveStationData', [id, ndata, num, description, shipment_date, note, comment])
            .then((status) => {
                res.json({ok: status});
                if (status !== true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'standartizer',
                        action: 'editStation',
                        data: {
                            id: id,
                            data: ndata
                        }
                    });
                }
            });
    }
    /** Проверка ункальных значений  */
    checkUnique(req, res, next) {
        if (req.query.num) {
            this.db.pub_get2('standartizer', 'standartizer_station', 'checkNumUnique', [req.query.num])
                .then((status) => {
                    res.send((status === true ? 'true' : 'false'));
                });
        } else {
            res.send('false');

        }
    }
    /** Ввод модалки с выбором даты */
    stationCalcModal(req, res, next) {
        res.render('../plugins/standartizer/views/list/calc_modal', {station_id:parseInt(req.params.id), today: moment().format('YYYY-MM-DD')});
    }
    /** Вывод формы графика для станции */
    stationCalcModalCalendar = async (req, res, next) => {
        let station_id = parseInt(req.params.id)
        let date = req.params.date
        // подготовка и сохранение черновика
        this.db.pub_get2('standartizer', 'standartizer_station', 'stationPreparePlan', [station_id, date, req.user.id]).then((plan_id) => {
            // вывод черновика 
            res.tpl('list/calc_calendar', {
                actions:[
                    // {
                    //     action: '<a href="#" class="btn btn-sm btn-primary" onclick="Standartizer_calc.saveChanges(); return false;"><i class="fal fa-save"></i>&nbsp;сохранить план</a>',
                    //     access: 'standartizer:calcList'
                    // }
                ],
                back: {
                    url: '/standartizer',
                    title: '← назад к спсику станций'
                },
                title: 'План для станции №'+parseInt(req.params.id),
                plugin: 'standartizer',
                plan_id: plan_id,
                defaultDate: moment().format('YYYY-MM-DD')
            });
        })
    }
    /** Вывод плана станции */
    stationCalcModalCalendarViewPlan = async (req, res, next) => {
        let plan_id = parseInt(req.params.plan_id)
        let plan_info = await this.helper.getPlanInfo(plan_id)
        res.tpl('list/calc_calendar_view', {
            back: {
                url: '/standartizer',
                title: '← назад к спсику станций'
            },
            title: 'План №'+parseInt(plan_id)+' для станции №'+plan_info.num,
            plugin: 'standartizer',
            plan_id: plan_id,
            defaultDate: plan_info.start_plan_date
        });
    }
    /** Ресурсы для графика */
    stationCalcModalResources = (req, res, next)  => {
        this.db.pub_get2('standartizer', 'standartizer_station', 'getStationResources', [parseInt(req.params.plan_id)]).then((station_resources) => {
            res.json(station_resources)
        })
    }
    /** Модальное окно для изменения времени операции */
    stationCalcModalEventChange = async (req, res, next)  => {
        let plan_id = parseInt(req.params.plan_id)
        let operation_id = parseInt(req.params.operation_id)
        let date = moment(req.params.date).format('YYYY-MM-DD')
        let len = await this.helper.getOperationDuration(plan_id, operation_id, date)
        res.render('../plugins/standartizer/views/list/calc_change_modal', {
            plan_id: plan_id,
            station_id:parseInt(req.params.station_id),
            operation_id:operation_id,
            date: date,
            len: len
            // Получение длительности операции по параметрам
        });
    }
    stationCalcModalEventChangePost = async (req, res, next)  => {
        let plan_id = parseInt(req.params.plan_id)
        let operation_id = parseInt(req.params.operation_id)
        let date = moment(req.params.date).format('YYYY-MM-DD')
        let target_date = req.body.target_date
        let old_len = await this.helper.getOperationDuration(plan_id, operation_id, date)
        let new_len = parseFloat(req.body.duration)
        this.db.pub_get2('standartizer', 'standartizer_plans_operations', 'changePlanData', [plan_id, operation_id, date, target_date, old_len, new_len]).then((all_plan_data) => {
            res.json({ok: true})
        });

    }
    /** Изенение плана дропом */
    stationCalcModalEventChangeDropPost = async (req, res, next)  => {
        let plan_id = parseInt(req.params.plan_id)
        let operation_id = parseInt(req.body.operation_id)
        let date = moment(req.body.date).format('YYYY-MM-DD')
        let target_date = req.body.target_date
        let old_len = await this.helper.getOperationDuration(plan_id, operation_id, date)
        this.db.pub_get2('standartizer', 'standartizer_plans_operations', 'changePlanData', [plan_id, operation_id, date, target_date, old_len, old_len]).then((all_plan_data) => {
            res.json({ok: true})
        });
    }
    /** !!! Эвенты для графика */
    stationCalcModalEvents = async (req, res, next) => {
        let first_date = moment(req.query.start).format('YYYY-MM-DD')
        let last_date = moment(req.query.end).format('YYYY-MM-DD')

        this.db.pub_get2('standartizer', 'standartizer_plans_operations', 'getPlanData', [parseInt(req.params.plan_id)]).then(async (all_plan_data) => {
            let plan_info = all_plan_data[0]
            let plan_data = all_plan_data[1]
            // console.log(plan_info);
            // console.log(plan_data);
            let station_id = plan_info.station_id
            let events = []
            let allops_cut = await this.db.pub_get2('standartizer', 'standartizer_station', 'getAllopsCut', [station_id, false, false])
            let st_op = {}
            for (let i in allops_cut) {
                // заполнение вспомогательного массива станциия_операция = участок
                if (allops_cut[i].section_id !== 0) {
                    st_op[station_id+'_'+i] = allops_cut[i].section_id
                }
                let op_childs = allops_cut[i].allchilds
                let dates = plan_data.filter(i => {
                    return op_childs.includes(i.operation_id)
                }).map(i => {
                    return i.date
                })
                if (dates.length > 0) {
                    let curminmax = this.getMinMaxFromAray(dates)
                    events.push({
                        resourceId: station_id+'_'+allops_cut[i].id,
                        title: moment(curminmax[0], 'YYYY-MM-DD').format('DD.MM.YYYY')+' - '+moment(curminmax[1], 'YYYY-MM-DD').format('DD.MM.YYYY'),
                        start: curminmax[0],
                        end: curminmax[1],
                        color: '#678ab3',
                        textColor: '#ffffff',
                        editable: false,
                        resourceEditable: false
                    });
                }
            }
            
            let lendates = await this.helper.getLenInDates(first_date, last_date, true);
            for (let resID in st_op) {
                let secID = st_op[resID]
                
                if (typeof lendates[2][secID] !== 'undefined') {
                    
                    for (let date in lendates[2][secID]) {
                        let daylen = lendates[2][secID][date]
                        events.push({
                            resourceId: resID,
                            title: daylen,
                            start: date,
                            propOrder: 1,
                            color: '#f9f9f9',
                            textColor: '#949494',
                            borderColor: '#dddddd',
                            editable: false,
                            resourceEditable: false,
                            durationEditable: false
                        });
                    }
                }

            }

            let minmax = this.getMinMaxFromAray(plan_data.map(i => i.date))
            events.push({
                resourceId: station_id,
                title: moment(minmax[0], 'YYYY-MM-DD').format('DD.MM.YYYY')+' - '+moment(minmax[1], 'YYYY-MM-DD').format('DD.MM.YYYY'),
                start: minmax[0],
                end: minmax[1],
                color: '#1c9c0d',
                textColor: '#ffffff',
                editable: false,
                resourceEditable: false
            });

            for (let i in plan_data) {
                events.push({
                    resourceId: station_id+'_'+plan_data[i].operation_id,
                    id: station_id+'_'+plan_data[i].operation_id,
                    title: plan_data[i].len.toFixed(1),
                    start: plan_data[i].date,
                    propOrder: 2,
                    resourceEditable: false,
                    durationEditable: false
                });
            }
            res.json(events)
        })
    }
    /** Эвенты для графика для просмотра*/
    stationCalcModalEventsView = async (req, res, next) => {
        this.db.pub_get2('standartizer', 'standartizer_plans_operations', 'getPlanData', [parseInt(req.params.plan_id)]).then(async (all_plan_data) => {
            let plan_info = all_plan_data[0]
            let plan_data = all_plan_data[1]
            // console.log(plan_info);
            // console.log(plan_data);
            let station_id = plan_info.station_id
            let events = []
            let allops_cut = await this.db.pub_get2('standartizer', 'standartizer_station', 'getAllopsCut', [station_id, false, false])
            for (let i in allops_cut) {
                
                let op_childs = allops_cut[i].allchilds
                let dates = plan_data.filter(i => {
                    return op_childs.includes(i.operation_id)
                }).map(i => {
                    return i.date
                })
                if (dates.length > 0) {
                    let curminmax = this.getMinMaxFromAray(dates)
                    events.push({
                        resourceId: station_id+'_'+allops_cut[i].id,
                        title: moment(curminmax[0], 'YYYY-MM-DD').format('DD.MM.YYYY')+' - '+moment(curminmax[1], 'YYYY-MM-DD').format('DD.MM.YYYY'),
                        start: curminmax[0],
                        end: curminmax[1],
                        color: '#678ab3',
                        textColor: '#ffffff',
                        editable: false,
                        resourceEditable: false
                    });
                }
            }

            let minmax = this.getMinMaxFromAray(plan_data.map(i => i.date))
            events.push({
                resourceId: station_id,
                title: moment(minmax[0], 'YYYY-MM-DD').format('DD.MM.YYYY')+' - '+moment(minmax[1], 'YYYY-MM-DD').format('DD.MM.YYYY'),
                start: minmax[0],
                end: minmax[1],
                color: '#1c9c0d',
                textColor: '#ffffff',
                editable: false,
                resourceEditable: false
            });

            for (let i in plan_data) {
                events.push({
                    resourceId: station_id+'_'+plan_data[i].operation_id,
                    id: station_id+'_'+plan_data[i].operation_id,
                    title: plan_data[i].len.toFixed(1),
                    start: plan_data[i].date,
                    propOrder: 2,
                    resourceEditable: false,
                    durationEditable: false
                });
            }
            res.json(events)
        })
    }

    /** Редактирование плана станции */
    stationCalcModalCalendarEditPlan = async (req, res, next) => {
        let plan_id = parseInt(req.params.plan_id)
        let plan_info = await this.helper.getPlanInfo(plan_id)
        res.tpl('list/calc_calendar', {
            back: {
                url: '/standartizer',
                title: '← назад к спсику станций'
            },
            title: 'План №'+parseInt(plan_id)+' для станции №'+plan_info.num,
            plugin: 'standartizer',
            plan_id: plan_id,
            defaultDate: plan_info.start_plan_date
        });
    }



    
    /** Получение минимальной и максимальной даты в плане */
    getPlanMinMax(plan) {
        let dates = []
        for (let i in plan) {
            for (let n in plan[i][2][1]) {
                let date = plan[i][2][1][n][0]
                if (dates.includes(date) === false) dates.push(date)
            }
        }
        return this.getMinMaxFromAray(dates)
    }
    /** Получение min,max из массива */
    getMinMaxFromAray(dates) {
        dates.sort((a,b) => moment(b, 'YYYY-MM-DD').unix() - moment(a, 'YYYY-MM-DD').unix())
        return [dates[(dates.length-1)],dates[0]]
    }

    // ----------- ОПЕРАЦИИ
    /** Просмотр списка */
    viewGroupsStructure(req, res, next) {
        this.helper.getGroups().then((groups) => {
            res.tpl('structure/group_list', {
                actions:[
                    {
                        action: '<a href="/standartizer/structure/add_group" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить группу операций</a>',
                        access: 'standartizer:editStructrue'
                    }
                ],
                back: {
                    url: '/standartizer',
                    title: '← назад к спсику станций'
                },
                title: 'Группы операций',
                plugin: 'standartizer',
                items: groups
            });
        });
    }
    /** Копировние группы операций */
    copyGroup(req, res, next) {
        this.helper.copyGroup(parseInt(req.params.id), req.user.id, (status) => {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'standartizer',
                    action: 'copyGroup',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            }   
        });
    }
    /** Список операций группы */
    viewstructure(req, res, next) {
        let id = parseInt(req.params.id);
        this.helper.getGroup(id).then((group) => {
            this.helper.getCategories(id).then((items) => {
                res.tpl('structure/list2', {
                    actions:[
                        {
                            action: '<a href="#" onclick="StandartizerStructure.closeAllLists();return false;" class="btn btn-sm btn-white"><i class="far fa-minus-square"></i>&nbsp;свернуть все</a>',
                            access: 'standartizer:viewStructrue'
                        },
                        {
                            action: '<a href="/standartizer/structure/add/'+id+'" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить операцию</a>',
                            access: 'standartizer:editStructrue'
                        }
                        // {
                        //     action: '<a href="/standartizer/structure/add_tech/'+id+'" rel="modal:open" class="btn btn-sm btn-primary"><i class="fa fa-plus"></i>&nbsp;добавить тех. операцию</a>',
                        //     access: 'standartizer:editStructrue'
                        // }
                    ],
                    title: 'Список операций "'+group.name+'"',
                    back: {
                        url: '/standartizer/structure',
                        title: '← назад к спсику групп'
                    },
                    plugin: 'standartizer',
                    items: items
                });
            });
        });
    }
    /** Смена родительского элемента */
    changeParent(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category', 'getCategory', [parseInt(req.params.id)])
            .then((data) => {
                if (data !== false) {
                    this.db.pub_get2('standartizer', 'standartizer_category', 'changeParentSection', [parseInt(req.params.id), parseInt(req.params.parent)]).then((status) => {
                        this.helper.getCategories(data.group_id).then((cats) => {
                            res.json({ok:status, levels:cats[parseInt(req.params.id)].levels});
                            if (status === true) {
                                this.events.emit('log', {
                                    uid: req.user.id,
                                    plugin: 'standartizer',
                                    action: 'changeParent',
                                    data: {
                                        id: parseInt(req.params.id),
                                        parent: parseInt(req.params.parent)
                                    }
                                });
                            }
                        });
                    }); 
                } else {
                    res.json({ok: false});
                }
            });
    }
    /** Форма редактирование операций */
    editsection(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category', 'getCategory', [parseInt(req.params.id)])
            .then((data) => {
                this.plugins.workers.helper.getAllSections()
                    .then(secs => {
                        if (data !== false) {
                            this.helper.getCategories(data.group_id).then((items) => {
                                res.render('../plugins/standartizer/views/structure/edit', {
                                    group_id: data.group_id,
                                    id: data.id,
                                    name: data.name,
                                    num: data.num,
                                    prev_id: data.prev_id,
                                    average_payment: data.average_payment,
                                    work_long: data.work_long,
                                    cats: items,
                                    secs: secs,
                                    sec: data.worker_section_id,
                                    parallel: data.parallel,
                                    otk: data.otk
                                });
                            });

                        } else {
                            res.json({ok: false});
                        }
                    });
            });
    }
    /** Редактирование операций */
    editsectionPost(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category', 'editSection', [parseInt(req.params.id), req.body.name, parseInt(req.body.prev_id), req.body.num, parseFloat(req.body.average_payment), parseInt(req.body.work_long), parseInt(req.body.worker_section_id), (req.body.parallel == 'on' ? 1 : 0), (req.body.otk == 'on' ? 1 : 0)])
            .then((status) => {
                res.json({ok: status});
                if (status !== false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'standartizer',
                        action: 'editSection',
                        data: {
                            id: parseInt(req.params.id),
                            name: req.body.name,
                            num: req.body.num,
                            prev_id: parseInt(req.body.prev_id),
                            work_long: parseInt(req.body.work_long),
                            average_payment: parseFloat(req.body.average_payment),
                            worker_section_id: parseInt(req.body.worker_section_id)
                        }
                    });
                }   
            });
    }
    /** Пересортировка операций */
    async changeOrder(req, res, next) {
        let mstat = true;
        let order = req.params.order.split(',');
        for (let i = 0; i < order.length; i++) {
            let status = await this.db.pub_get2('standartizer', 'standartizer_category', 'changeOrderSection', [parseInt(order[i]), i+1])
            if (status == false) {
                mstat = false;
            }
        }
        res.json({ok: mstat});
        if (mstat === true) {
            this.events.emit('log', {
                uid: req.user.id,
                plugin: 'standartizer',
                action: 'changeOrder',
                data: {
                    order: req.params.order
                }
            });
        }
    }
    /** Редактирование цвета фона организационнной операции*/
    editSectionColorPost(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category', 'changeColorSection', [parseInt(req.params.id), req.body.color])
            .then((status) => {
                res.json({ok:status});
                if (status != false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'standartizer',
                        action: 'editSectionColor',
                        data: {
                            id: parseInt(req.params.id),
                            name: req.body.color
                        }
                    });
                }
            });
    }

    // ----------- СТАНЦИИ
    /** Просмотр списка станции для расчета */
    viewlist(req, res, next) {
        let cookie_sort = 'create_date'
        let cookie_dir = 'desc'
        let cookie_qstr = ''
        let cookie_showdone = 0

        if (typeof req.cookies.standartizer != 'undefined') {
            let cookie_data = JSON.parse(req.cookies.standartizer)
            if (typeof cookie_data.sort != 'undefined') {
                cookie_sort = (cookie_data.sort ? cookie_data.sort : cookie_sort)
            }
            if (typeof cookie_data.dir != 'undefined') {
                cookie_dir = (cookie_data.dir ? cookie_data.dir : cookie_dir)
            }
            if (typeof cookie_data.qstr != 'undefined') {
                cookie_qstr = (cookie_data.qstr ? cookie_data.qstr : cookie_qstr)
            }
            if (typeof cookie_data.showdone != 'undefined') {
                cookie_showdone = (cookie_data.showdone ? cookie_data.showdone : cookie_showdone)
            }
        }
        let sort = [(req.query.sort ? req.query.sort : cookie_sort), (req.query.dir ? req.query.dir : cookie_dir)]
        let qstr = (req.query.qstr ? req.query.qstr : cookie_qstr)
        let showdone = (req.query.showdone ? req.query.showdone : cookie_showdone)

        this.helper.getAllStations2(sort, qstr, showdone, false).then((items) => {
            let item_ids = items.map(i => i.id)
            this.helper.getStationsPlans(item_ids).then((plans) => {
                res.tpl('list/list', {
                    actions:[
                        {
                            action: '<a href="/standartizer/structure" onclick="Tabs.sameTab(\'/standartizer/structure\'); return false;" class="btn btn-sm btn-white"><i class="fas fa-tools"></i></a>',
                            access: 'standartizer:editList'
                        },
                        {
                            action: '<a href="/standartizer/list/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить расчет станции</a>',
                            access: 'standartizer:editList'
                        }
                    ],
                    title: 'Расчет плановых трудозатрат',
                    plugin: 'standartizer',
                    items: items,
                    sort: sort,
                    qstr: qstr,
                    plans: plans,
                    showdone: showdone
                });
            });
        });
    }
    /** Смена статуса станции */
    changeStationState(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_station', 'updateStationState', [parseInt(req.params.id), parseInt(req.params.state)]).then((status)=> {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'standartizer',
                    action: 'changeStationState',
                    data: {
                        id: parseInt(req.params.id),
                        state: parseInt(req.params.state)
                    }
                });
            }
        })
    }
    /** Утверждение плана */
    acceptPlanState(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_station', 'acceptPlanState', [parseInt(req.params.id)]).then((status)=> {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'standartizer',
                    action: 'acceptPlanState',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            }
        })


    }
    /** Удаление расчета станции */
    deletelist(req, res, next) {
        this.db.pub('standartizer', 'fire', 'deleteStation', parseInt(req.params.id))
            .then(() => {
                res.json({ok: true});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'standartizer',
                    action: 'deleteStation',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            });
    }
    /** Удаление плана станции */
    deleteplan(req, res, next) {
        this.db.pub('standartizer', 'fire', 'deletePlan', parseInt(req.params.id))
            .then(() => {
                res.json({ok: true});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'standartizer',
                    action: 'deletePlan',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            });
    }
    /** Добавление станции */
    addlistPost(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_station', 'addStation', [req.body.description, req.body.num, parseInt(req.body.group_id), req.body.shipment_date, req.user.id])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'standartizer',
                        action: 'addStation',
                        data: {
                            id: status,
                            num: req.body.num,
                            description: req.body.description,
                            group: req.body.group_id,
                            shipment_date: req.body.shipment_date
                        }
                    });
                }
            });
    }

    // ----------- ОПЕРАЦИИ
    /** Форма редактирования группы */
    editGroup(req, res, next) {
        this.helper.getGroup(parseInt(req.params.id)).then((item) => {
            res.render('../plugins/standartizer/views/structure/group_edit', {item:item});
        });
    }
    /** Редактирование группы */
    editGroupPost(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category_group', 'editGroupSection', [parseInt(req.params.id), req.body.name])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'standartizer',
                        action: 'editGroupSection',
                        data: {
                            id: parseInt(req.params.id),
                            name: req.body.name,
                        }
                    });
                }
            });
    }
    /** Форма редактирования средней ЗП и рабочих часов*/
    editAP(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category', 'getCategory', [parseInt(req.params.id)])
            .then((cat_data) => {
                res.render('../plugins/standartizer/views/structure/edit_ap', {
                    id: cat_data.id,
                    average_payment: cat_data.average_payment,
                    work_long: cat_data.work_long
                });
            });
    }
    /** Редактирование средней ЗП и рабочих часов*/
    editAPPost(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category', 'editSectionAP', [parseInt(req.params.id), parseFloat(req.body.average_payment), parseInt(req.body.work_long)])
            .then((status) => {
                res.json({ok:status, id:parseInt(req.params.id), ap:parseFloat(req.body.average_payment), wl:parseInt(req.body.work_long)});
            });
    }
    /** Отображение формы отображения добавления группы */
    addGroup(req, res, next) {
        res.render('../plugins/standartizer/views/structure/group_add');
    }
    /** Добавление группы */
    addGroupPost(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category_group', 'addGroupSection', [req.body.name, req.user.id])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'standartizer',
                        action: 'addGroupSection',
                        data: {
                            id: status,
                            name: req.body.name,
                            user_id: req.user.id
                        }
                    });
                }   
            });
    }
    /** Удаление операции */
    deletesection(req, res, next) {
        this.db.pub('standartizer', 'fire', 'deleteSection', parseInt(req.params.id))
            .then(() => {
            res.json({ok: true});
            this.events.emit('log', {
                uid: req.user.id,
                plugin: 'standartizer',
                action: 'deleteSection',
                data: {
                    id: parseInt(req.params.id)
                }
            });
        });
    }
    /** Удаление группы операций */
    deleteGroup(req, res, next) {
        this.db.pub('standartizer', 'fire', 'deleteGroupSection', parseInt(req.params.id))
            .then(() => {
                res.json({ok: true});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'standartizer',
                    action: 'deleteGroup',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
        });
    }
    /** Форма добавления операций */
    addsection(req, res, next) {
        this.plugins.workers.helper.getAllSections()
                .then(secs => {
                this.helper.getCategories(parseInt(req.params.id)).then((items) => {
                    res.render('../plugins/standartizer/views/structure/add', {id:parseInt(req.params.id), cats:items, secs:secs});
                });
            });
    }
    /** Добавление операции в группу */
    addsectionPost(req, res, next) {
        this.db.pub_get2('standartizer', 'standartizer_category', 'addSection', [parseInt(req.params.id), req.user.id, req.body.name, parseInt(req.body.parent), parseInt(req.body.prev_id), req.body.num, parseFloat(req.body.average_payment), parseInt(req.body.work_long), 0, parseInt(req.body.worker_section_id), (req.body.parallel == 'on' ? 1 : 0), (req.body.otk == 'on' ? 1 : 0), 1])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'standartizer',
                        action: 'addSection',
                        data: {
                            id: status,
                            name: req.body.name,
                            group_id: group_id,
                            parent_id: parseInt(req.body.parent),
                            prev_id: parseInt(req.body.prev_id),
                            work_long: parseInt(req.body.work_long),
                            average_payment: parseFloat(req.body.average_payment),
                            worker_section_id: parseInt(req.body.worker_section_id)
                        }
                    });
                }   
            });
    }

    // --------------------------- HELPERS
    objectFromEntries = (entries) => {
        var result = {};
        var len = entries.length;
        for (var i = 0; i < len; ++i) {
          var entry = entries[i];
          var key = entry[0];
          var value = entry[1];
          result[key] = value;
        }
        return result;
    };
}