const   moment = require('moment');

module.exports = class {

    constructor(that, Helper, route, permissions, menu) {
        that._d('- plugin "manufacture" loaded');
        this.db = that.db
        this.name = 'Производство';
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.menu = menu;
        this.events = that.events;
        this.plugins = that.plugins;
    }

    /** Просмотр всех станций */ 
    viewManufacture(req, res, next) {
        let cookie_sort = 'num'
        let cookie_dir = 'desc'
        let cookie_qstr = ''

        if (typeof req.cookies.manufacture != 'undefined') {
            let cookie_data = JSON.parse(req.cookies.manufacture)
            if (typeof cookie_data.sort != 'undefined') {
                cookie_sort = (cookie_data.sort ? cookie_data.sort : cookie_sort)
            }
            if (typeof cookie_data.dir != 'undefined') {
                cookie_dir = (cookie_data.dir ? cookie_data.dir : cookie_dir)
            }
            if (typeof cookie_data.qstr != 'undefined') {
                cookie_qstr = (cookie_data.qstr ? cookie_data.qstr : cookie_qstr)
            }
        }

        let sort = [(req.query.sort ? req.query.sort : cookie_sort), (req.query.dir ? req.query.dir : cookie_dir)]
        let qstr = (req.query.qstr ? req.query.qstr : cookie_qstr)
        this.helper.getManStations(sort, qstr).then((items) => {
                res.tpl('list', {
                    actions:[
                        {
                            action: '<a href="/manufacture/sync_graph" class="btn btn-sm btn-primary" onclick="Tabs.sameTab(\'/manufacture/sync_graph\');return false;"><i class="far fa-chart-bar"></i></a>',
                            access: 'manufacture:view'
                        },
                    ],
                    title: 'Производство',
                    plugin: 'manufacture',
                    items: items,
                    sort: sort,
                    qstr: qstr
                });
            });
    }
    /** Редактирование факта станции */
    editManufactureStation(req, res, next) {
        let station_id = parseInt(req.params.id)
        this.plugins.standartizer.helper.getStation(station_id)
            .then((station_data) => {
                this.plugins.standartizer.helper.getCategoriesWONull(station_data.group_id).then(async (cats) => {
                    let plan_data = await this.helper.getPlanDataByStationId(station_id)
                    let data = {};
                    if (station_data.data != null) {
                        data = JSON.parse(station_data.data);
                    }
                    // Получение факта по станции
                    let sd = await this.helper.getManufactureStationDone(station_id)
                    let done = sd[0]
                    let done_hours = sd[1]
                    // Получение суммы времени по операциям
                    let operation_sum = {}
                    for (let operation_id in data) {
                        let cnt = parseInt(data[operation_id].val1)
                        let val3_5 = parseFloat(data[operation_id].val3)+parseFloat(data[operation_id].val5)
                        operation_sum[operation_id] = parseFloat(val3_5 * cnt)
                    }


                    let calcops = {}
                    for (let i in plan_data[1]) {
                        if (typeof calcops[plan_data[1][i].operation_id] === 'undefined') {
                            calcops[plan_data[1][i].operation_id] = { dates: {} }
                        }
                        calcops[plan_data[1][i].operation_id]['dates'][plan_data[1][i].date] = plan_data[1][i].len
                    }
                    // Получение результатов на текущую дату
                    // Получание крайнего срока
                    for (let i in calcops) {
                        let dates = calcops[i].dates
                        let today_must_done = 0
                        for (let date in dates) {
                            let len = dates[date]
                            if (moment(date, 'YYYY-MM-DD') < moment()) {
                                today_must_done += dates[date]
                            }
                        }
                        
                        let station_done_hours_sum = parseFloat(operation_sum[i] * parseFloat(done[i]) / 100)
                        calcops[i].today_must_done = today_must_done
                        calcops[i].donediff = parseInt(today_must_done) - parseInt(station_done_hours_sum)
                        let minmax = this.getMinMaxFromAray(Object.keys(dates))
                        calcops[i].minmax = [moment(minmax[0], 'YYYY-MM-DD').format('DD.MM.YYYY'),moment(minmax[1], 'YYYY-MM-DD').format('DD.MM.YYYY')]
                        calcops[i].is_started = (moment() < moment(minmax[0], 'YYYY-MM-DD') ? false : true)
                    }

                    // rdata[j].donediff = parseInt(rdata[j].today_must_done) - parseInt(rdata[j].station_done_hours_sum)
                    

                    // Add childsum to cats
                    cats = this.plugins.standartizer._allChildsSum(cats, data);
                    res.tpl('edit', {
                        actions:[
                            {
                                action: '<a href="#" class="btn btn-sm btn-primary" onclick="ManufactureEditList.saveChanges(); return false;"><i class="fal fa-save"></i>&nbsp;сохранить изменения</a>',
                                access: 'manufacture:edit'
                            }
                        ],
                        back: {
                            url: '/manufacture',
                            title: '← назад к списку станций'
                        },
                        id: station_id,
                        title: 'Факт для станции №'+station_data.num,
                        plugin: 'manufacture',
                        cats: cats,
                        data: data,
                        operation_sum: operation_sum,
                        done: done,
                        done_hours: done_hours,
                        plan_data: plan_data,
                        calcops: calcops
                    });
                });
            });

    }
    /** Получение min,max из массива */
    getMinMaxFromAray(dates) {
        dates.sort((a,b) => moment(b, 'YYYY-MM-DD').unix() - moment(a, 'YYYY-MM-DD').unix())
        return [dates[(dates.length-1)],dates[0]]
    }
    /** Сохранение факта станции */
    editManufactureStationPost(req, res, next) {
        let station_id = parseInt(req.params.id)
        let body = req.body
        this.db.pub_get2('manufacture', 'manufacture_done', 'saveManufactureDone', [station_id, body])
            .then((status) => {
                res.json({ok: status});
                if (status !== true) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'manufacture',
                        action: 'saveManufactureDone',
                        data: {
                            id: station_id,
                            data: body
                        }
                    });
                }
            });

    }

    /** Просмотр длительности операции */
    viewManufactureOpDuration(req, res, next) {
        let station_id = parseInt(req.params.station_id)
        let operation_id = parseInt(req.params.operation_id)
        
        this.helper.getPlanDataByStationId(station_id).then((plan_data) => {
            let dates = plan_data[1]
                .filter(item => item.operation_id == operation_id)
                .map(item => item.date)
            let minmax = this.getMinMaxFromAray(dates)
            res.render('../plugins/manufacture/views/operation_duration', {title: 'Продолжительность операции', station_id:station_id, operation_id:operation_id, minmax:minmax })
        })


        
    }
    /** Данные по длительности операции */
    viewManufactureOpDurationJson(req, res, next) {
        let station_id = parseInt(req.params.station_id)
        let operation_id = parseInt(req.params.operation_id)
        this.helper.getPlanDataByStationId(station_id).then((plan_data) => {
            let pd = plan_data[1]
                .filter(item => item.operation_id == operation_id)
                .map(item => {
                    return {
                        allDay: true,
                        backgroundColor: "#abe1a3",
                        // rendering: "background",
                        start: item.date,
                        title: parseInt(item.len)
                    }
                })
            res.json(pd);
        })
        
    }


    /** График синхронизации */
    viewManufactureSyncGraph(req, res, next) {
        res.tpl('sync', {
            back: {
                url: '/manufacture',
                title: '← назад к спсику станций'
            },
            title: 'График производства',
            plugin: 'manufacture'
        });
    }
    /** График синхронизации ресурсы */
    viewManufactureSyncGraphRes(req, res, next) {
        this.plugins.standartizer.helper.getCategories(1).then((operations) => {
            let resources = []
            for (let i in operations) {
                if (operations[i].parent_id == 0) {
                    resources.push(this.recursGraphResources(operations[i], operations));
                }
            }
            res.json(resources)
        });
        
    }
    /** Рекурисвная расстановка операций в графике синхронизации*/
    recursGraphResources = (op, resources_dop) => {
        let cur_res = {
            id: op.id,
            title: op.name,
            children: []
            // eventColor: (op.childs.length > 0? '#678ab3' : '#8db4e2'),
            // eventTextColor: '#000000'
        };

        if (op.childs.length > 0) {
            for (let i in op.childs) {
                if (typeof resources_dop[op.childs[i]] != 'undefined') {
                    cur_res.children.push(this.recursGraphResources(resources_dop[op.childs[i]], resources_dop));
                }
            }
            return cur_res;
        } else {
            return cur_res;
        }
    }

    /** График синхронизации эвенты */
    viewManufactureSyncGraphEvents(req, res, next) {
        let first_date = moment(req.query.start).format('YYYY-MM-DD')
        let last_date = moment(req.query.end).format('YYYY-MM-DD')
        this.db.pub_get2('standartizer', 'standartizer_plans', 'getSyncGraphLength', [first_date, last_date]).then(async (data) => {
            let events = []
            let nums = await this.db.pub_get2('standartizer', 'standartizer_station', 'getAllIdsNums', []);
            for (let i in data) {
                events.push({
                    resourceId: data[i].operation_id,
                    title: nums[data[i].station_id],
                    start: data[i].date,
                    color: '#678ab3',
                    textColor: '#ffffff'
                });
            }
            res.json(events)
        });



        
    }
}