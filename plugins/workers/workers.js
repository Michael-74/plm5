const   moment = require('moment');

module.exports = class {

    constructor(that, Helper, route, permissions, menu) {
        that._d('- plugin "workers" loaded');
        this.db = that.db
        this.name = 'Бригады предприятия';
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.menu = menu;
        this.events = that.events;
        this.plugins = that.plugins;
    }


    // ----------- ! РАБОТНИКИ
    /** ! Просмотр списка рабочих */
    viewWorkers(req, res, next) {
        Promise.all([this.helper.getAllWorkers(), this.helper._getAllBrigadesWSectionsObj(),this.helper.getGroupByIdChts()])
            .then(values => {
                let [workers, brigades, grp_chts] = values
                res.tpl('workers/list', {
                    actions:[
                        {
                            action: '<a href="/workers/rest_calendar"  rel="modal:open" class="btn btn-sm btn-white"><i class="fas fa-calendar"></i></a>',
                            access: 'workers:edit_rest_calendar'
                        },
                        {
                            action: '<a href="/workers/all_workers/calendar" class="btn btn-sm btn-primary" onclick="Tabs.sameTab(\'/workers/all_workers/calendar\');return false;"><i class="far fa-chart-bar"></i></a>',
                            access: 'workers:view_workers'
                        },
                        {
                            action: '<a href="/workers/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить работника</a>',
                            access: 'workers:add_worker'
                        }
                    ],
                    title: 'Работники',
                    plugin: 'workers',
                    workers: workers,
                    brigades: brigades,
                    grp_chts: grp_chts
                });

            })
    }
    /** ! Добавление рабочего */
    addWorker(req, res, next) {
        Promise.all([this.helper._getSectionsBrigades2(), this.helper.getGroupChts()])
            .then(values => {
                let [sections, grp_chts] = values
                res.render('../plugins/workers/views/workers/add', {sections: sections, grp_chts:grp_chts})
            })
    }
    addWorkerPost(req, res, next) {
        this.db.pub_get2('workers', 'workers', 'addWorker', [parseInt(req.body.brigade_id), req.body.fio, req.body.position, parseInt(req.body.chts_id), req.user.id])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'workers',
                        action: 'addWorker',
                        data: {
                            id: status,
                            brigade_id: parseInt(req.body.brigade_id),
                            position: req.body.position,
                            fio: req.body.fio,
                            chts_id: parseInt(req.body.chts_id)
                        }
                    });
                }
            });
    }
    /** ! Редактирование рабочего */
    editWorker(req, res, next) {
        Promise.all([this.helper._getSectionsBrigades2(), this.helper.getGroupChts(), this.helper.getWorker(parseInt(req.params.id))])
            .then(values => {
                let [sections, grp_chts, data] = values
                res.render('../plugins/workers/views/workers/edit', {sections:sections, data:data, grp_chts:grp_chts})
            })
    }
    editWorkerPost(req, res, next) {
        this.db.pub_get2('workers', 'workers', 'editWorker', [parseInt(req.params.id), parseInt(req.body.brigade_id), req.body.fio, req.body.position, parseInt(req.body.chts_id)])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'workers',
                        action: 'editWorker',
                        data: {
                            id: status,
                            brigade_id: parseInt(req.body.brigade_id),
                            position: req.body.position,
                            fio: req.body.fio,
                            chts_id: parseInt(req.body.chts_id)
                        }
                    });
                }
            });
    }
    /** Удаление рабочего */
    deleteWorker = (req, res, next) => {
        this.db.pub('workers', 'fire', 'deleteWorker', parseInt(req.params.id))
            .then(() => {
                res.json({ok: true});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'workers',
                    action: 'deletWorker',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            });
    }
    /** Просмотр календаря рабочего */
    viewWorkerCalendar(req, res, next) {
        this.helper.getWorker(parseInt(req.params.id)).then((worker) => res.render('../plugins/workers/views/workers/calendar_modal', {title: worker.fio, id: worker.id}))
    }
    /** Рендер JSON результатов календаря рабочего */
    viewWorkerCalendarJson(req, res, next) {
        this.helper._workerDays(parseInt(req.params.id), moment(req.query.start).format('YYYY-MM-DD'), moment(req.query.end).format('YYYY-MM-DD'))
            .then((data) => {
                let days = data[0]
                let wd = [];
                for (let day in days) {
                    let work_length = days[day];
                    wd.push({
                        allDay: true,
                        start: day,
                        rendering: 'background',
                        backgroundColor: (work_length === 0 ? '#ff9e9e' : '#abe1a3'),
                        extendedProps: {
                            type: (work_length === 0 ? 'rest' : 'work')
                        }
                    });
                }
                res.json(wd);
            });
    }
    /** Отображение рабочего календаря */
    viewRestCalendar = (req, res, next) => res.render('../plugins/workers/views/workers/calendar_rest', {title: 'Производственный календарь'})
    /** Отображение графика со всеми рабочими */
    viewAllWorkersCalendar(req, res, next) {
        res.tpl('workers/calendar_all', {
            actions: [],
            back: {
                url: '/workers',
                title: '← назад к списку работников'
            },
            title: 'График работы всех работников',
            plugin: 'workers'
        });
    }
    /** JSON resources Отображение графика со всеми рабочими */
    viewAllWorkersCalendarResources = (req, res, next) => {
        let res_init = {};
        return Promise.all([this.helper.getAllSections(), this.helper.getAllWorkers(), this.helper.getAllBrigadesSectionsMap()])
            .then(values => {
                let [workers_sections, workers, brigades] = values
                for (let i in workers_sections) {
                    let secs = workers_sections[i];
                    res_init[secs.id] = {
                        id: 's_'+secs.id,
                        title: secs.name,
                        children: [],
                        eventColor: this.helper.eventColors[2],
                        eventTextColor: this.helper.eventColors[1]
                    };
                }
                for (let i in workers) {
                    let wrkrs = workers[i];
                    res_init[brigades[wrkrs.brigade_id]].children.push({
                        id: wrkrs.id,
                        title: wrkrs.fio,
                        eventColor: this.helper.eventColors[0],
                        eventTextColor: this.helper.eventColors[1]
                    });
                }
                let resources = [];
                for (let i in res_init) {
                    if (res_init[i].children.length > 0) {
                        resources.push(res_init[i]);
                    }
                }

                resources.push({
                    id: 'all',
                    title: 'Общее',
                    eventColor: this.helper.eventColors[3],
                    eventTextColor: this.helper.eventColors[1]
                })

                res.json(resources);
            })
    }
    /** JSON events Отображение графика со всеми рабочими */
    viewAllWorkersCalendarEvents(req, res, next) {
        this.helper._allWorkerDays(moment(req.query.start).format('YYYY-MM-DD'), moment(req.query.end).format('YYYY-MM-DD')).then(events => res.json(events));
    }
    /** ! Рендер JSON производственного календаря */
    viewRestCalendarJson(req, res, next) {
        this.helper.getWorkersHolidays(moment(req.query.start).format('YYYY-MM-DD'), moment(req.query.end).format('YYYY-MM-DD'))
            .then((days) => {
                let wd = days.map(i => {
                    return {
                        allDay: true,
                        start: i,
                        rendering: 'background',
                        backgroundColor: '#ff9e9e'
                    }
                }) 
                res.json(wd);
            });
        
    }
    /** ! Редактирование общего производственного календаря */
    viewRestCalendarPost(req, res, next) {
        this.helper.getWorkersHolidays(req.body.date, req.body.date)
            .then((days) => {
                if (days.length > 0) {
                    this.db.pub('workers', 'fire', 'removeHoliday', req.body.date).then(() => res.json({ok: true}))
                } else {
                    this.db.pub('workers', 'fire', 'addHoliday', req.body.date).then(() => res.json({ok: true}))
                }
            });
    }
    /** ! Редактирование дня производственного календаря рабочего */
    editWorkerDatePost(req, res, next) {
        this.helper._workerDays(parseInt(req.params.id), req.body.date, req.body.date)
            .then((data) => {
                let is_work = 1
                let [days, worker] = data
                let key = (Object.keys(days).length > 0 ? Object.keys(days)[0] : false);
                if (key != false) {
                    if (days[key] == 0) {
                        // Добавляем рабочий день
                        if (worker.rest_days.excs.includes(key) === true) {
                            worker.rest_days.excs = this.helper._removeFromArray(worker.rest_days.excs, key);
                        }
                        if (worker.rest_days.incs.includes(key) === false) {
                            worker.rest_days.incs.push(key);
                        }
                    } else {
                        // Добавляем выходной
                        is_work = 0
                        if (worker.rest_days.incs.includes(key) === true) {
                            worker.rest_days.incs = this.helper._removeFromArray(worker.rest_days.incs, key);
                        }
                        if (worker.rest_days.excs.includes(key) === false) {
                            worker.rest_days.excs.push(key);
                        }
                    }
                    this.db.pub_get2('workers', 'workers', 'editWorkerRestDays', [parseInt(req.params.id), JSON.stringify(worker.rest_days), req.body.date, is_work])
                        .then((status) => {
                            res.json({ok: status});
                        });
                } else {
                    res.json({ok: false});
                }
            });
    }
    /** JSON Events для участка */
    viewSectionsCalendarEvents(req, res, next) {
        this.helper.getWorkersSectionDays(parseInt(req.params.id), moment(req.query.start).format('YYYY-MM-DD'), moment(req.query.end).format('YYYY-MM-DD')).then(events => res.json(events));
    }


    // ----------- ! УЧАСТКИ
    /** ! Просмотр списка учвстков */
    viewSections(req, res, next) {
        this.helper.getAllSections()
            .then(items => {
                res.tpl('sections/list', {
                    actions:[
                        {
                            action: '<a href="/workers/sections/busy_calendar" class="btn btn-sm btn-primary" onclick="Tabs.sameTab(\'/workers/sections/busy_calendar\');return false;"><i class="far fa-chart-bar"></i></a>',
                            access: 'workers:view_sections'
                        },
                        {
                            action: '<a href="/workers/sections/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить участок</a>',
                            access: 'workers:add_sections'
                        }
                    ],
                    title: 'Производственные участки',
                    plugin: 'workers',
                    items: items
                });
            });
    }
    /** ! Добавление участка */
    addSection = (req, res, next) => res.render('../plugins/workers/views/sections/add')
    addSectionPost(req, res, next) {
        this.db.pub_get2('workers', 'workers_sections', 'addSection', [req.body.name, req.user.id])
            .then(status => {
                res.json({ok: (status!=false?true:false)});
                if (status !== false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'workers',
                        action: 'addSection',
                        data: {
                            id: status,
                            name: req.body.name
                        }
                    });
                }
            });
    }
    /** ! Редактирование участка */
    editSection(req, res, next) {
        this.helper.getSection(parseInt(req.params.id)).then(section_data => {
            res.render('../plugins/workers/views/sections/edit', {data: section_data});
        });
    }
    editSectionPost(req, res, next) {
        this.db.pub_get2('workers', 'workers_sections', 'editSection', [parseInt(req.params.id), req.body.name])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'workers',
                        action: 'editSection',
                        data: {
                            id: status,
                            name: req.body.name
                        }
                    });
                }
            });
    }
    /** ! Удаление участка */
    deleteSection(req, res, next) {
        this.db.pub('workers', 'fire', 'deleteSection', parseInt(req.params.id))
            .then(() => {
                res.json({ok: true});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'workers',
                    action: 'deleteSection',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            });
    }
    /** ! Календарь участка */
    viewSectionsCalendar(req, res, next) {
        this.helper.getSection(parseInt(req.params.id))
            .then(section => {
                res.tpl('sections/calendar', {
                    actions: [],
                    back: {
                        url: '/workers/sections',
                        title: '← назад к списку участков'
                    },
                    title: 'График работы участка',
                    plugin: 'workers',
                    id: parseInt(req.params.id),
                    section: section
                });
            }); 
    }
    /** ! Календарь участка: JSON Resources для участка */
    viewSectionsCalendarResources(req, res, next) {
        this.helper.getSectionsWorkersIdFio(parseInt(req.params.id))
            .then((workers) => {
                let resources = workers.map(i => {
                    return {
                        id: i.id,
                        title: i.fio,
                        // children: [],
                        eventColor: this.helper.eventColors[0],
                        eventTextColor: this.helper.eventColors[1]
                    }
                });
                res.json(resources);
            });
    }
    /** График календарь загрузки участков */
    viewSectionsBusyCalendar(req, res, next) {
        res.tpl('sections/occupation', {
            actions: [],
            back: {
                url: '/workers/sections',
                title: '← назад к списку участков'
            },
            title: 'График загрузки участков',
            plugin: 'workers'
        });
    }
    /** График календарь загрузки участков: JSON Resources */
    viewSectionsBusyCalendarResources(req, res, next) {
        this.helper.getAllSections().then(workers_sections => {
            let resources = [];
            for (let i in workers_sections) {
                let secs = workers_sections[i];
                resources.push({
                    id: secs.id,
                    title: secs.name,
                    // children: [],
                    // eventColor: this.helper.eventColors[2],
                    // eventTextColor: this.helper.eventColors[1]
                });
            }
            res.json(resources);

        })
    }
    /** График календарь загрузки участков: JSON эвенты */
    viewSectionsBusyCalendarEvents(req, res, next) {
        let first_date = moment(req.query.start).format('YYYY-MM-DD')
        let last_date = moment(req.query.end).format('YYYY-MM-DD')
        this.plugins.standartizer.helper.getLenInDates(first_date, last_date, true).then(data => {
            // [all, occupied, avail]
            let events = [];
            for (let section in data[0]) {
                for (let day in data[0][section]) {
                    let len = data[0][section][day]
                    if (len > 0) {
                        events.push({
                            resourceId: section,
                            propOrder: 1,
                            title: len,
                            start: day,
                            color: '#426b51',
                            textColor: '#ffffff',
                            editable: false,
                            resourceEditable: false
                        });
                    }
                }
            }
            for (let section in data[1]) {
                for (let day in data[1][section]) {
                    let len = data[1][section][day]
                    events.push({
                        resourceId: section,
                        propOrder: 2,
                        title: len,
                        start: day,
                        color: '#a2003c',
                        textColor: '#ffffff',
                        editable: false,
                        resourceEditable: false
                    });
                }
            }
            res.json(events);
        })

        
    }

    // ----------- ! БРИГАДЫ
    /** ! Просмотр списка бригад */
    viewBrigades(req, res, next) {
        this.helper._getSectionsBrigades()
            .then((sections) => {
                res.tpl('brigades/list', {
                    actions:[
                        {
                            action: '<a href="/workers/rest_calendar"  rel="modal:open" class="btn btn-sm btn-white"><i class="fas fa-calendar"></i></a>',
                            access: 'workers:edit_rest_calendar'
                        }, 
                        {
                            action: '<a href="/workers/brigades/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить бригаду</a>',
                            access: 'workers:add_brigade'
                        }
                    ],
                    title: 'Бригады',
                    plugin: 'workers',
                    sections: sections
                });
            });
    }
    /** ! Добавление бригады */
    addBrigade = (req, res, next) => this.helper.getAllSectionsIdsNames().then(sections => this.db.pub_get2('workers', 'workers_brigade', 'getGroupDivisionsPredicatedData', []).then(pre => res.render('../plugins/workers/views/brigades/add', {sections: sections, pre: pre})));
    addBrigadePost(req, res, next) {
        this.db.pub_get2('workers', 'workers_brigade', 'addBrigade', [req.body.section_id, req.body.start_date, req.body.group_name, req.body.division_name, parseInt(req.body.work_plan), parseInt(req.body.work_length),parseFloat(req.body.average_payment), req.user.id])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'workers',
                        action: 'addBrigade',
                        data: {
                            id: status,
                            section_id: req.body.section_id,
                            start_date: req.body.start_date,
                            group_name: req.body.group_name,
                            division_name: req.body.division_name,
                            work_plan: parseInt(req.body.work_plan),
                            work_length: parseInt(req.body.work_length),
                            average_payment: parseFloat(req.body.average_payment)
                        }
                    });
                }
            });
    }
    /** ! Редактирование бригады */
    editBrigade(req, res, next) {
        Promise.all([this.helper.getAllSectionsIdsNames(), this.helper.getBrigade(parseInt(req.params.id)), this.db.pub_get2('workers', 'workers_brigade','getGroupDivisionsPredicatedData', [])])
            .then((values) => {
                let [sections, data, pre] = values
                res.render('../plugins/workers/views/brigades/edit', {sections:sections, data:data, pre:pre})

            })
    }
    editBrigadePost(req, res, next) {
        this.db.pub_get2('workers', 'workers_brigade', 'editBrigade', [parseInt(req.params.id), req.body.section_id,  req.body.start_date, req.body.group_name, req.body.division_name, parseInt(req.body.work_plan), parseInt(req.body.work_length), parseFloat(req.body.average_payment)])
            .then((status) => {
                res.json({ok: (status!=false?true:false)});
                if (status !== false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'workers',
                        action: 'editBrigade',
                        data: {
                            id: parseInt(req.params.id),
                            section_id: req.body.section_id,
                            start_date: req.body.start_date,
                            group_name: req.body.group_name,
                            division_name: req.body.division_name,
                            work_plan: parseInt(req.body.work_plan),
                            work_length: parseInt(req.body.work_length),
                            average_payment: parseFloat(req.body.average_payment)
                        }
                    });
                }
            });
    }
    /** ! Удаление бригады */
    deleteBrigade(req, res, next) {
        this.db.pub('workers', 'fire', 'deleteBrigade', parseInt(req.params.id))
            .then(() => {
                res.json({ok: true});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'workers',
                    action: 'deleteBrigade',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            });
    }
    /** ! Календарь бригады */
    viewBrigadesCalendar(req, res, next) {
        res.tpl('brigades/calendar', {
            actions: [],
            back: {
                url: '/workers/brigades',
                title: '← назад к списку бригад'
            },
            title: 'График работы бригады',
            plugin: 'workers',
            id: parseInt(req.params.id)
        });
    }
    /** ! Календарь бригады: JSON Resources для бригад */
    viewBrigadesCalendarResources(req, res, next) {
        this.helper.getBrigadeWorkersIdFio(parseInt(req.params.id))
            .then((workers) => {
                let resources = [];
                for (let i in workers) {
                    resources.push({
                        id: workers[i].id,
                        title: workers[i].fio,
                        // children: [],
                        eventColor: this.helper.eventColors[0],
                        eventTextColor: this.helper.eventColors[1]
                    });
                }
                res.json(resources);
            });
    }
    /** Просмотр и редактирования графика бригады */
    viewBrigadesRestCalendar = (req, res, next) => res.render('../plugins/workers/views/brigades/calendar_rest', {title: 'Производственный календарь бригады', id:parseInt(req.params.id) })
    /** Данные рафика бригады */
    viewBrigadesRestCalendarJson(req, res, next) {
        let req_data = {
            id: parseInt(req.params.id),
            start: moment(req.query.start).format('YYYY-MM-DD'),
            end: moment(req.query.end).format('YYYY-MM-DD')
        }
        this.helper.getbrigadeDays(req_data.id, req_data.start, req_data.end)
            .then((data) => {
                let wd = [];
                for (let day in data) {
                    let work_length = data[day];
                    wd.push({
                        allDay: true,
                        start: day,
                        rendering: 'background',
                        backgroundColor: (work_length === 0 ? '#ff9e9e' : '#abe1a3'),
                        extendedProps: {
                            type: (work_length === 0 ? 'rest' : 'work')
                        }
                    });
                }
                res.json(wd);
            })
    }
    /** Смена графика бригады */
    viewBrigadesRestCalendarPost = (req, res, next) => {
        this.db.pub_get2('workers', 'registry_brigade_days', 'changeBrigadeGraph', [parseInt(req.params.id), req.body.date])
            .then(() => {
                res.json({ok: true})
            })
    }
    /** JSON events для бригад */
    viewBrigadesCalendarEvents(req, res, next) {
        this.helper.getWorkersBrigadeDays(parseInt(req.params.id), moment(req.query.start).format('YYYY-MM-DD'), moment(req.query.end).format('YYYY-MM-DD'))
            .then((events) => {
                res.json(events);
            });
    }

    // ----------- !ТАРИФНЫЕ СТАВКИ
    /** ! Просмотр списка тарифных ставок */
    viewChts = (req, res, next) => {
        this.helper.getAllChts()
            .then(items => {
                res.tpl('chts/list', {
                    actions:[
                        {
                            action: '<a href="/workers/chts/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить ЧТС</a>',
                            access: 'workers:add_chts'
                        }
                    ],
                    title: 'Тарифные ставки',
                    plugin: 'workers',
                    items: items
                });
            });
    }
    /** ! Добавление тарифных ставок */
    addChts = (req, res, next) => res.render('../plugins/workers/views/chts/add')
    addChtsPost = (req, res, next) => {
        this.db.pub_get2('workers', 'workers_chts', 'createChts', [req.user.id, req.body.position, parseInt(req.body.cls), parseFloat(req.body.rate)])
            .then(id => {
                res.json({ok: (id!=false?true:false)});
                if (id !== false) {
                    this.events.emit('log', {
                        uid: req.user.id,
                        plugin: 'workers',
                        action: 'addChts',
                        data: {
                            id: id,
                            position: req.body.position,
                            class:  parseInt(req.body.cls),
                            rate: parseFloat(req.body.rate)
                        }
                    });
                }
            })
    }
    /** ! Редактирование тарифных ставок */
    editChts(req, res, next) {
        this.helper.getChts(parseInt(req.params.id))
            .then(data => {
                res.render('../plugins/workers/views/chts/edit', {data: data});
            })
    }
    editChtsPost(req, res, next) {
        this.db.pub_get2('workers', 'workers_chts', 'editChts', [parseInt(req.params.id), req.body.position, parseInt(req.body.cls), parseFloat(req.body.rate)])
            .then(() => {
                res.json({ok: true});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'workers',
                    action: 'editChts',
                    data: {
                        id: parseInt(req.params.id),
                        position: req.body.position,
                        class:  parseInt(req.body.cls),
                        rate: parseFloat(req.body.rate)
                    }
                });
            });
    }
    /** ! Удаление тарифных ставок */
    deleteChts = (req, res, next) => {
        this.db.pub('workers', 'fire', 'deleteChts', parseInt(req.params.id))
            .then(() => {
                res.json({ok: true});
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'workers',
                    action: 'deleteChts',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            })
    }


}