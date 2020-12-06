const moment = require('moment');

module.exports = class {

    constructor(db) {
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
        this.defineModel();
    }

    async defineModel() {
        this.sequelize.define('ol', {
            'id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'num': {
                type: this.Sequelize.INTEGER,
            },
            'tpl_id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
            },
            'params': {
                type: this.Sequelize.TEXT,
            },
            'status': {
                type: this.Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
            'ol_num': {
                type: this.Sequelize.STRING,
            },
            'rd_num': {
                type: this.Sequelize.STRING,
            },
            'place': {
                type: this.Sequelize.TEXT,
            },
            'customer': {
                type: this.Sequelize.STRING,
            },
            'type': {
                type: this.Sequelize.TEXT,
            },
            'sub_type': {
                type: this.Sequelize.TEXT,
            },
            'customer_cat': {
                type: this.Sequelize.INTEGER,
            },
            'project_inst': {
                type: this.Sequelize.STRING,
            },
            'count': {
                type: this.Sequelize.INTEGER,
            },
            'closed': {
                type: this.Sequelize.BOOLEAN,
                defaultValue: 0
            },
            'rd_fullname': {
                type: this.Sequelize.STRING,
            },
            'additional': {
                type: this.Sequelize.TEXT,
            },
            'parts': {
                type: this.Sequelize.INTEGER,
            },
            'create_date': {
                type: this.Sequelize.DATE,
                allowNull: false,
                defaultValue: this.Sequelize.literal('CURRENT_TIMESTAMP')
            },
            'user_id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'auth_users',
                    key: 'id'
                }
            }
        }, {
            timestamps: false,
            tableName: 'ol'
        });
        this.sequelize.define('ol_sections', {
            'id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'name': {
                type: this.Sequelize.STRING,
                allowNull: false,
            },
            'order': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
            },
            'color': {
                type: this.Sequelize.STRING,
            },
            'template_id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
            },
            'status': {
                type: this.Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: 1
            },
            'user_id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'auth_users',
                    key: 'id'
                }
            }
        }, {
            timestamps: false,
            tableName: 'ol_sections'
        });
        this.sequelize.define('ol_sections_params', {
            'id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'name': {
                type: this.Sequelize.STRING,
            },
            'section': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
            },
            'order': {
                type: this.Sequelize.INTEGER,
            },
            'type': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
            },
            'status': {
                type: this.Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: 0
            },
            'group': {
                type: this.Sequelize.INTEGER,
            },
            'user_id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'auth_users',
                    key: 'id'
                }
            }
        }, {
            timestamps: false,
            tableName: 'ol_sections_params'
        });
        this.sequelize.define('ol_sections_params_values', {
            'id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'param_id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
            },
            'section_id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
            },
            'value': {
                type: this.Sequelize.STRING,
            }
        }, {
            timestamps: false,
            tableName: 'ol_sections_params_values'
        });
        this.sequelize.define('ol_templates', {
            'id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            'status': {
                type: this.Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: 1
            },
            'name': {
                type: this.Sequelize.STRING,
            },
            'user_id': {
                type: this.Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'auth_users',
                    key: 'id'
                }
            }
        }, {
            timestamps: false,
            tableName: 'ol_templates'
        });
        await this.sequelize.models.ol.sync();
        await this.sequelize.models.ol_sections.sync();
        await this.sequelize.models.ol_sections_params.sync();
        await this.sequelize.models.ol_sections_params_values.sync();
        await this.sequelize.models.ol_templates.sync();
    }

    // -------------- ОПРОСНЫЕ ЛИСТЫ

    /** Получение последнего номера опросного листа */
    getLastOlNum(cb) {
        this.models.ol.findAll({
            raw: true,
            attributes: ['ol_num'],
            where: {
                ol_num: {
                    [this.Op.ne]: ''
                },
                status: 1
            }
        }).then(res => {
            let max_num = 1;
            if (res.length > 0) {
                for (let i in res) {
                    let ol_num = res[i].ol_num;
                    let regex = /ОЛ\s(\d+)\/(\d+)/gm;
                    let match = regex.exec(ol_num);
                    let year = parseInt(match[1]);
                    let num = parseInt(match[2]);
                    if (year === parseInt(moment().format('YYYY'))) {
                        if (num > max_num) {
                            max_num = num;
                        }
                    }
                }
                let nplusone = max_num+1;
                cb(nplusone);
            } else {
                cb(1);
            }
        }).catch(error => {
            cb(1);
        });
    }
    /** Получение ID по номеру опросного листа */
    getIDbyOLnum = (num) => {
        return this.models.ol.findAll({
            raw: true,
            attributes: ['id', 'num'],
            where: {
                num: num
            }
        }).then(res => {
            return res
        }).catch(error => {
            return false
        });
    }
    _getOLCustomers() {
        return new Promise((resolve) => {
            this.models.ol.findAll({
                raw: true,
                attributes: [[this.Sequelize.literal('DISTINCT [customer]'), 'customers']],
                where: {
                    customer: {
                        [this.Op.ne]: ''
                    }
                }
            }).then(res => {
                let customers = [];
                for (let i in res) customers.push(res[i].customers);
                resolve(customers);
            });
        });
    }
    _getOLTypes() {
        return new Promise((resolve) => {
            this.models.ol.findAll({
                raw: true,
                attributes: [[this.Sequelize.literal('DISTINCT [type]'), 'types']],
                where: {
                    type: {
                        [this.Op.ne]: ''
                    }
                }
            }).then(res => {
                let types = [];
                for (let i in res) types.push(res[i].types);
                resolve(types);
            });
        });
    }
    _getOLSubTypes() {
        return new Promise((resolve) => {
            this.models.ol.findAll({
                raw: true,
                attributes: [[this.Sequelize.literal('DISTINCT [sub_type]'), 'subtypes']],
                where: {
                    sub_type: {
                        [this.Op.ne]: ''
                    }
                }
            }).then(res => {
                let subtypes = [];
                for (let i in res) subtypes.push(res[i].subtypes);
                resolve(subtypes);
            });
        });
    }
    _getOLProInst() {
        return new Promise((resolve) => {
            this.models.ol.findAll({
                raw: true,
                attributes: [[this.Sequelize.literal('DISTINCT [project_inst]'), 'projectinsts']],
                where: {
                    project_inst: {
                        [this.Op.ne]: ''
                    }
                }
            }).then(res => {
                let pro_inst = [];
                for (let i in res) pro_inst.push(res[i].projectinsts);
                resolve(pro_inst);
            });
        });
    }
    /** Получение данных для предикативного ввода в ОЛ */
    async getAddPredicatedData(cb) {
        let customers = await this._getOLCustomers();
        let types = await this._getOLTypes();
        let subtypes = await this._getOLSubTypes();
        let pro_inst = await this._getOLProInst();
        cb({
            customers: customers,
            types: types,
            subtypes: subtypes,
            pro_inst: pro_inst
        });
    }
    /** Добавление ОЛ */
    addOl(user_id, tpl_id, ol_num, rd_fullname, rd_num, place, customer, type, subtype, customer_cat, project_inst, count, cb) {
        this.models.ol.create({
            tpl_id: parseInt(tpl_id),
            params: '',
            status: '1',
            user_id: parseInt(user_id),
            ol_num: ol_num,
            rd_fullname: rd_fullname,
            rd_num: rd_num,
            place: place,
            customer: customer,
            type: type,
            sub_type: subtype,
            customer_cat: parseInt(customer_cat),
            project_inst: project_inst,
            count: parseInt(count),
            closed: '0'
        }).then(res => {
            cb(res.dataValues.id);
        }).catch(error => {
            // console.log(error);
            cb(false);
        });
    }
    /** Получение списка ОЛ */
    getOls(cb) {
        this.models.ol.findAll({
            raw: true,
            where: {
                status: 1
            },
            order: [
                ['create_date', 'DESC']
            ]
        }).then(res => {
            cb(res);
        });
    }
    /** Получение ОЛ по ID */
    getOl(id, cb) {
        this.models.ol.findAll({
            raw: true,
            where: {
                id: parseInt(id),
                status: 1
            }
        }).then(res => {
            cb((res.length > 0 ? res[0] : false));
        }).catch(error => {
            cb(false);
        });
    }
    /** Удаление ОЛ (изменение статуса на 0) */
    deleteOL(id, cb) {
        this.models.ol.update({
            status: '0'
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Получение номера ОЛ по ID */
    getOlNum(item_id, cb) {
        let that = this;
        this.models.ol.findAll({
            raw: true,
            attributes: [[this.Sequelize.literal('TOP 1 [num]'), 'num']],
            where: {
                status: 1
            },
            order: [
                ['num', 'DESC']
            ]
        }).then(res => {
            let lnum = parseInt(res[0].num)+1;
            that.models.ol.findAll({
                raw: true,
                attributes: [[that.Sequelize.literal('TOP 1 [num]'), 'num']],
                where: {
                    id:  parseInt(item_id)
                },
                order: [
                    ['num', 'DESC']
                ]
            }).then(res2 => {
                let val = parseInt(res2[0].num);
                cb(lnum, val);
            });
        });
    }
    /** Сохранение номера ОЛ */
    saveOlNum(item_id, num, cb) {
        this.models.ol.update({
            num: parseInt(num)
        },{
            where: {
                id: parseInt(item_id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Закрытие ОЛ от редактирования */
    changeClosed(id, state, cb) {
        this.models.ol.update({
            closed: (parseInt(state) == 1 ? '1' : '0')
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** ASYNC: Получение данных категории */
    async getOlExtraDataSec(sections, cb) {
        let sections_data = {}
        for (let i in sections) {
            let ldata =  await this.getSpecsParamsWithValuesAsync(sections[i].id);
            sections_data[sections[i].id] = {
                section_params: ldata[0],
                params_values: ldata[1]
            }
        }
        cb(sections_data);
    }
    /** Вспомогательная функция: проверка и вывод JSON строки в виде объекта */
    _parseJsonString(data, pre) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return pre;
        }
    }
    /** Получение даных ОЛ */
    getOlExtraData(id, cb) {
        this.getOl(id, (ol_data) => {
            // console.log(ol_data);
            ol_data.params = this._parseJsonString(ol_data.params, {});
            this.getSections(ol_data.tpl_id, (template_data, sections) => {
                this.getOlExtraDataSec(sections, (sections_data) => {
                    cb(ol_data, sections, sections_data, template_data);
                });
            });
        });
    }
    /** Сохранение ОЛ */
    saveOl(id, params, cb) {
        this.models.ol.update({
            params: params
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Сохранение основных данных ОЛ */
    saveMainOl(id, params, cb) {
        this.models.ol.update({
            ol_num: params.ol_num,
            rd_fullname: params.rd_fullname,
            rd_num: params.rd_num,
            type: params.type,
            sub_type: params.sub_type,
            customer: params.customer,
            customer_cat: parseInt(params.customer_cat),
            parts: parseInt(params.parts),
            place: params.place,
            project_inst: params.project_inst,
            additional: params.additional
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Подготовка данных и типов */
    prepareValueTypes(type, value, section_params_values, id) {
        if (type == 1) {
            // let lines = value.split("\n");
            // return "<w:p><w:r><w:t>" + lines.join("<w:br/>") + "</w:t></w:r></w:p>";
            return value;
        } else if (type == 2) {
            return value;
        } else if (type == 3) {
            return value;
        } else if (type == 4) {
            return (value=='off'?'Нет':'Да');
        } else if (type == 5) {
            return moment(value, 'YYYY-MM-DD').format('DD.MM.YYYY');
        } else if (type == 6) {
            if (typeof section_params_values[id] != 'undefined') {
                let vl = false;
                for (let j in section_params_values[id]) {
                    if (section_params_values[id][j].id == value) {
                        vl = section_params_values[id][j].value;
                    }
                }
                return (vl == false ? '' : vl);
            } else {
                return '';
            }
        } else if (type == 7) {
            return (value[0] ? value[0]+' x ' : '')+(value[1] ? value[1]+' x ' : '')+(value[2] ? value[2] : '');
        } else if (type == 8) {
            return value;
        } else if (type == 9) {
            return '';
        }
    }
    /** Создание копии опросного листа */
    copyOl(id, user_id, cb) {
        this.getOl(id, (parent_data) => {
            delete parent_data['id'];
            delete parent_data['num'];
            parent_data.tpl_id = parent_data.tpl_id+'';
            parent_data.customer_cat = parent_data.customer_cat+'';
            parent_data.count = parent_data.count+'';
            parent_data.status = '1';
            parent_data.closed = '0';
            parent_data.user_id = user_id;
            parent_data.rd_num = 'Копия '+parent_data.rd_num;
            let ndata = parent_data;
            this.models.ol.create(ndata).then(res => {
                cb(true);
            }).catch(error => {
                cb(false);
            });
        });
    }
    /** Генерация данных для экспорта */
    genExportJson(ol_data, sections, sections_data, cb) {
        let categories = [];
        categories.push({
            order: 1,
            title: 'ОБЩИЕ ДАННЫЕ',
            values: [
                {
                    order: '1.1.',
                    name: 'Полное наименование (обозначение в РД)',
                    value: ol_data.rd_fullname
                },{
                    order: '1.2.',
                    name: 'Обозначение (обозначение в РД)',
                    value: ol_data.rd_num
                },{
                    order: '1.3.',
                    name: 'Место установки станции (город или ближайший круп населенный пункт) (обозначение в РД)',
                    value: ol_data.place
                },{
                    order: '1.4.',
                    name: 'Назначение',
                    value: ol_data.type
                },{
                    order: '1.5.',
                    name: 'Количество частей',
                    value: ol_data.parts
                },{
                    order: '1.6.',
                    name: 'Категория заказчика (1, 2, 3)',
                    value: ol_data.customer_cat+' категория'
                },{
                    order: '1.7.',
                    name: 'Наименование заказчика, проектного института',
                    value: ol_data.project_inst
                },{
                    order: '1.8.',
                    name: 'Дополнительные требования',
                    value: ol_data.additional
                }
            ]
        });
        let num1 = 2;
        for (let i in sections) {
            let num2 = 1;
            let category = {
                order: num1,
                title: sections[i].name,
                values: []
            };
            let sec_id = sections[i].id;
            let section_params = sections_data[sec_id].section_params;
            let section_params_values = sections_data[sec_id].params_values;
            for (let n in section_params) {
                if (section_params[n].group == 0) {
                    if (typeof ol_data.params[section_params[n]['id']] != 'undefined' && ol_data.params[section_params[n]['id']] != '') {
                        category.values.push({
                            order: num1+'.'+num2,
                            name: section_params[n].name,
                            value: this.prepareValueTypes(section_params[n].type, ol_data.params[section_params[n]['id']], section_params_values, section_params[n].id)
                        });
                        num2 += 1;
                    }
                } else if (section_params[n].group == 1) {
                    if (typeof ol_data.params.group != 'undefined') {
                        if (typeof ol_data.params.group[section_params[n].id] != 'undefined') {
                            let nsize = this._objSize(ol_data.params.group[section_params[n].id][0]);
                            category.values.push({
                                order: num1+'.'+num2,
                                name: section_params[n].name,
                                // value: ol_data.params.group[section_params[n].id] 
                                value: ''
                            });
                            for (let ii = 0; ii < ol_data.params.group[section_params[n].id].length; ii++) {
                                for (let z in section_params) {
                                    let section_param2 = section_params[z];
                                    if (section_param2.group == section_params[n].id) {
                                        let value = ol_data.params.group[section_params[n].id][ii][section_param2.id];
                                        if (typeof value != 'undefined' && value != '') {
                                            category.values.push({
                                                order: num1+'.'+num2+'.'+(ii+1)+'.'+(nsize > 1 ? section_param2.order+'.' : ''),
                                                name: section_param2.name,
                                                value: this.prepareValueTypes(section_param2.type, value, section_params_values, section_param2.id)
                                            });
                                        }
                                    }
                                }
                            }
                            num2 += 1;
                        }
                    }
                }
            }
            if (category.values.length > 0) {
                num1 += 1; 
            }
            categories.push(category);
        }
        let ncat = [];
        for (let j in categories) {
            if (categories[j].values.length > 0) {
                ncat.push(categories[j]);
            }
        }
        let data = {
            "station_num": ol_data.num, // Номер станции
            "ol_num": ol_data.ol_num, // Номер опросного листа
            "company": "ООО «ЧЗМЭК»", // Организация 
            "director": "Жданов Н.В.", // ФИО Директора
            "tech_director": "Нестеров И.В.", // ФИО тех. директора
            "fio_developer": "", // РАЗРАБОТАЛ
            "fio_checker": "",  // ПРОВЕРИЛ
            "rd_full_name": ol_data.rd_fullname, // Наименование в РД
            "rd_type": ol_data.rd_num, // Обозначение в РД
            "place": ol_data.place, // Место
            "categories": ncat
        }
        cb(data);
    }
    /** Размер объекта */
    _objSize(obj) {
        let size = 0;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };



    // -------------- ШАБЛОНЫ

    /** Получение шаблона по ID */
    getTemplate(id, cb) {
        this.models.ol_templates.findAll({
            raw: true,
            attributes: [[this.Sequelize.literal('TOP 1 [name]'), 'name'], 'id', 'user_id'],
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            cb(res[0]);
        });
    }
    /** Получение списка шаблонов */
    getTemplates(cb) {
        this.models.ol_templates.findAll({
            raw: true,
            attributes: ['name', 'id', 'status'],
            where: {
                status: 1
            },
            order: [
                ['id','ASC']
            ]
        }).then(res => {
            let templates = {};
            for (let i in res) {
                if (typeof templates[res[i].id] != '') {
                    templates[res[i].id] = res[i];
                }
            }
            cb(templates);
        });
    }
    /** Добавление шаблона */
    addTemplate(name, user_id, cb) {
        this.models.ol_templates.create({
            name: name,
            status: '1',
            user_id: user_id
        }).then(res => {
            cb(res.dataValues.id);
        }).catch(error => {
            cb(false);
        });
    }
    /** Редактирование шаблона */
    editTemplate(name, id, cb) {
        this.models.ol_templates.update({
            name: name
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Удаление шаблона */
    deleteTemplate(id, cb) {
        this.models.ol_templates.update({
            status: '0'
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** (ASYNC) Вспомогательная функция: копирование данных шаблона */
    async copyTemplateData(sections, user_id, cb) {
        let tpl_data = [];
        for (let i in sections) {
            let params = [];
            let ldata = await this.getSpecsParamsWithValuesAsync(sections[i].id);
            let section_params = ldata[0];
            let params_values= ldata[1];

            for (let j in section_params) {
                let vals = [];
                for (let param_id in params_values) {
                    if (param_id == section_params[j].id) {
                        for (let g in params_values[param_id]) {
                            vals.push(params_values[param_id][g].value);
                        }
                    }
                }

                params.push({
                    id: section_params[j].id,
                    name: section_params[j].name,
                    order: section_params[j].order,
                    type: section_params[j].type,
                    group: section_params[j].group,
                    user_id: user_id,
                    values: vals
                })
            }
            tpl_data.push({
                id: sections[i].id,
                name: sections[i].name,
                order: sections[i].order,
                color: sections[i].color,
                user_id: user_id,
                params: params
            });
        }
        cb(tpl_data);
    }
    /** Копирование шаблона */
    copyTemplate(int_id, user_id, cb) {
        this.getSections(int_id, (template_data, sections) => {
            this.addTemplate('Копия '+template_data.name, user_id, (new_tpl_id) => {
                this.copyTemplateData(sections, user_id, (tpl_data) => {
                    for (let ii in tpl_data) {
                        this.addSectionWithOrder(new_tpl_id, tpl_data[ii].name, user_id, '1', tpl_data[ii].order, tpl_data[ii].color, (sec_id) => {
                            for (let j in tpl_data[ii].params) {
                                let param = tpl_data[ii].params[j];
                                this._pureAddSpecProcess(param.name, param.type, sec_id, param.group, user_id, param.order, (param_id) => {
                                    if (typeof param.values != 'undefined') {
                                        for (let gg in param.values) {
                                            this.addSpecsParamValue(param_id, sec_id, param.values[gg], (ret) => {

                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                    cb(new_tpl_id);
                });
            });
        });
    }



    // -------------- РАЗДЕЛЫ

    /** Получение раздела по ID */
    getSection(id, cb) {
        this.models.ol_sections.findAll({
            raw: true,
            attributes: [[this.Sequelize.literal('TOP 1 [name]'), 'name'], 'id', 'order'],
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            cb(res[0]);
        });
    }
    /** Получение раздлов по ID шаблона */
    getSections(tpl_id, cb) {
        this.getTemplate(tpl_id, (template) => {
            this.models.ol_sections.findAll({
                raw: true,
                where: {
                    template_id: tpl_id,
                    status: 1
                },
                order: [
                    ['order','ASC']
                ]
            }).then(res => {
                cb(template, res);
            });
        });
    }
    /** Получение порядкового номера раздела */
    _getSectionOrder(template_id, cb) {
        this.models.ol_sections.findAll({
            raw: true,
            attributes: [[this.Sequelize.literal('TOP 1 [order]'), 'order']],
            where: {
                template_id: parseInt(template_id)
            },
            order: [
                ['order','DESC']
            ]
        }).then(res => {
            let ins_order = 1;
            if (typeof res[0] != 'undefined') {
                ins_order = parseInt(res[0].order)+1;
            }
            cb(ins_order);
        });
    }
    /** Добавление раздела */
    addSection(template_id, name, user_id, cb) {
        this._getSectionOrder(template_id, (ins_order) => {
            this.addSectionWithOrder(template_id, name, user_id, '1', ins_order, '', (data) => {
                cb(data);
            })
        });
    }
    /** Добавление раздела с известной сортировкой*/
    addSectionWithOrder(template_id, name, user_id, status, order, color, cb) {
        this.models.ol_sections.create({
            name: name,
            order: order,
            template_id: template_id,
            status: status,
            user_id: user_id,
            color: color
        }).then(res => {
            cb(res.dataValues.id);
        }).catch(error => {
            cb(false);
        });
    }
    /** Редактирование раздела */
    editSection(id, name, cb) {
        this.models.ol_sections.update({
            name: name
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Изменение цвета раздела */
    changeColorSection(id, color, cb) {
        this.models.ol_sections.update({
            color: color
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Удаление раздела */
    deleteSection(id, cb) {
        this.models.ol_sections.update({
            status: '0'
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Вспомогательная функция: сохранение сортировки */
    _saveResort(id, index) {
        return new Promise((resolve) => {
            this.models.ol_sections.update({
                order: index
            },{
                where: {
                    id: parseInt(id)
                }
            }).then((res) => {
                resolve(true);
            });
        });
    }
    /** Сохранение сортировки */
    async resortSections(ids, cb) {
        let ii = 1;
        for (let i in ids) {
            await this._saveResort(parseInt(ids[i]), ii);
            ii++;
        }
        if (cb) cb(true);
    }



    // -------------- ХАРАКТЕРИСТИКИ

    /** Получение характеристики по ID */
    getSpec(id, cb) {
        this.models.ol_sections_params.findAll({
            raw: true,
            where: {
                id: parseInt(id)
            }
        }).then(res => {
            cb(res[0]);
        });
    }
    /** Получение Характеристик */
    getSpecs(tpl_id, sec_id, cb) {
        this.getTemplate(tpl_id, (template) => {
            this.getSection(sec_id, (section) => {
                this.getSpecsParams(sec_id, (params_data) => {
                    this.getSpecsParamsValues(sec_id, (params_values_data) => {
                        cb(template, section, params_data, params_values_data);
                    });
                });
            });
        });
    }
    /** ПОлучение характеристик группы */
    getSpecsGroup(tpl_id, sec_id, id, cb) {
        this.getTemplate(tpl_id, (template) => {
            this.getSection(sec_id, (section) => {
                this.getSpec(id, (group_data) => {
                    this.getSpecsParamsGroup(sec_id, group_data.id, (params_data) => {
                        this.getSpecsParamsValues(sec_id, (params_values_data) => {
                            cb(template, section, group_data, params_data, params_values_data);
                        });
                    });
                });
            });
        });
    }
    /** Получение параметров характеристик */
    getSpecsParams(sec_id, cb) {
        this.models.ol_sections_params.findAll({
            raw: true,
            where: {
                section: sec_id,
                status: 1
            },
            order: [
                ['order','ASC']
            ]
        }).then(res => {
            cb(res);
        });
    }
    /** Получение значения параметров характеристик */
    getSpecsParamsValues(sec_id, cb) {
        this.models.ol_sections_params_values.findAll({
            raw: true,
            where: {
                section_id: sec_id
            }
        }).then(res => {
            let params_values = {};
            for (let i in res) {
                let param_value = res[i];
                if (typeof params_values[param_value.param_id] == 'undefined') params_values[param_value.param_id] = [];
                params_values[param_value.param_id].push(param_value);
            }
            cb(params_values);
        });
    }
    /** ASYNC: Получение значения параметров c характеристиками */
    getSpecsParamsWithValuesAsync(sec_id) {
        return new Promise((resolve) => {
            this.getSpecsParamsWithValues(sec_id, (response) => {
                resolve(response);
            });
        });
    }
    /** Получение значения параметров c характеристиками */
    getSpecsParamsWithValues(sec_id, cb) {
        let that = this;
        this.models.ol_sections_params.findAll({
            raw: true,
            where: {
                section: sec_id,
                status: 1
            },
            order: [
                ['order','ASC']
            ]
        }).then(params_data => {
            that.models.ol_sections_params_values.findAll({
                raw: true,
                where: {
                    section_id: sec_id,
                    value: {
                        [that.Op.ne]: ''
                    }
                }
            }).then(params_values_data => {
                let params_values = {};
                for (let i in params_values_data) {
                    let param_value = params_values_data[i];
                    if (typeof params_values[param_value.param_id] == 'undefined') params_values[param_value.param_id] = [];
                    params_values[param_value.param_id].push(param_value);
                }
                cb([params_data, params_values]);
            });
        });
    }
    /** Получение Групп харакетристик */
    getSpecsParamsGroup(sec_id, group_id, cb) {
        this.models.ol_sections_params.findAll({
            raw: true,
            where: {
                section: sec_id,
                status: 1,
                group: group_id,
                type: {
                    [this.Op.ne]: 9
                }
            },
            order: [
                ['order', 'ASC']
            ]
        }).then(res => {
            cb(res);
        });
    }
    /** Получение последнего по порядку характеристики */
    getLastSpecsOrder(section_id, group_id, cb) {
        this.models.ol_sections_params.findAll({
            raw: true,
            attributes: [[this.Sequelize.literal('TOP 1 [order]'), 'order']],
            where: {
                section:  parseInt(section_id),
                group: parseInt(group_id)
            },
            order: [
                ['order', 'DESC']
            ]
        }).then(res => {
            if (typeof res[0] != 'undefined') {
                cb(parseInt(res[0].order)+1);
            } else {
                cb(1);
            }
        });
    }
    /** Получение последней по порядку характеристики */
    getLastSpecsOrder2(section_id, cb) {
        this.models.ol_sections_params.findAll({
            raw: true,
            attributes: [[this.Sequelize.literal('TOP 1 [order]'), 'order']],
            where: {
                section:  parseInt(section_id),
                status: 1
            },
            order: [
                ['order', 'DESC']
            ]
        }).then(res => {
            if (typeof res[0] != 'undefined') {
                cb(parseInt(res[0].order)+1);
            } else {
                cb(1);
            }
        });
    }
    /** Получение последней по порядку группы */
    getLastSpecsGroup(section_id, cb) {
        this.models.ol_sections_params.findAll({
            raw: true,
            attributes: [[this.Sequelize.literal('TOP 1 [group]'), 'group']],
            where: {
                section:  parseInt(section_id)
            },
            order: [
                ['group', 'DESC']
            ]
        }).then(res => {
            if (typeof res[0] != 'undefined') {
                cb(parseInt(res[0].group)+1);
            } else {
                cb(1);
            }
        });
    }
    /** Вспомогательная функция: добавление харакетристики */
    addspecprocess(name, type, section_id, group, user_id, order, cb) {
        this._pureAddSpecProcess(name, type, section_id, group, user_id, order, (id) => {
            this.addDefaultTypes(parseInt(type), parseInt(section_id), parseInt(id));
            cb(id);
        });
    }
    _pureAddSpecProcess(name, type, section, group, user_id, order, cb) {
        this.models.ol_sections_params.create({
            name: name,
            section: parseInt(section),
            order: order,
            type: parseInt(type),
            status: '1',
            group: group,
            user_id: user_id
        }).then(res => {
            cb(res.dataValues.id);
        }).catch(error => {
            cb(false);
        });
    }
    /** Добавление харакетристики */
    addSpec(name, type, id, group, user_id, cb) {
        if (group == 0) {
            this.getLastSpecsOrder2(parseInt(id), (order) => {
                this.addspecprocess(name, type, id, group, user_id, order, (data) => {
                    cb(data);
                });
            })
        } else {
            this.getLastSpecsOrder(parseInt(id), group, (order) => {
                this.addspecprocess(name, type, id, group, user_id, order, (data) => {
                    cb(data);
                });
            })
        }
        
    }
    /** Добавление группы характеристик */
    addSpecGroup(name, type, id, user_id, cb) {
        let group = 1;
        this.getLastSpecsOrder2(parseInt(id), (order) => {
            this.models.ol_sections_params.create({
                name: name,
                section: parseInt(id),
                order: order,
                type: parseInt(type),
                status: '1',
                group: group,
                user_id: user_id
            }).then(res => {
                cb(true, res.dataValues.id, group);
            }).catch(error => {
                cb(false, false, group);
            });
        });
    }
    /** Добавление типов по-умолчанию */
    addDefaultTypes(type, section_id, param_id) {
        if (type == 3) {
            this.models.ol_sections_params_values.create({
                section_id: parseInt(section_id),
                param_id: parseInt(param_id),
                value: 2
            });
        }
    }
    /** Редактирование наименования характеристики */
    editSpecName(name, id, cb) {
        this.models.ol_sections_params.update({
            name: name
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Удаление характеристики */
    deleteSpec(id, cb) {
        this.models.ol_sections_params.update({
            status: '0'
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** ASYNC: Сохранение сортировки */
    _saveResortSpecs(order, id) {
        return new Promise((resolve) => {
            this.models.ol_sections_params.update({
                order: order
            },{
                where: {
                    id: parseInt(id)
                }
            }).then((res) => {
                resolve(true);
            });
        });
    }
    /** Сохранение сортировки */
    async resortSpecs(ids, cb) {
        let ii = 1;
        for (let i in ids) {
            await this._saveResortSpecs(ii, parseInt(ids[i]));
            ii++;
        }
        if (cb) cb(true);
    }
    /** Сохранение значений характеристик */
    saveSpecs(id, value, cb) {
        this.models.ol_sections_params_values.update({
            value: value
        },{
            where: {
                id: parseInt(id)
            }
        }).then((res) => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
    /** Добавление значений характеристик */
    addSpecsParam(param_id, section_id, cb) {
        this.models.ol_sections_params_values.create({
            param_id: parseInt(param_id),
            section_id: parseInt(section_id),
            value: ''
        }).then(res => {
            cb(res.dataValues.id);
        }).catch(error => {
            cb(false);
        });
    }
    /** Добавление значений характеристик с заданным значением */
    addSpecsParamValue(param_id, section_id, value, cb) {
        this.models.ol_sections_params_values.create({
            param_id: parseInt(param_id),
            section_id: parseInt(section_id),
            value: value
        }).then(res => {
            cb(res.dataValues.id);
        }).catch(error => {
            cb(false);
        });
    }
    /** Удаление значения характеристики */
    deleteSpecsParam(param_id, cb) {
        this.models.ol_sections_params_values.destroy({
            where: {
                id: parseInt(param_id)
            }
        }).then(res => {
            cb(true);
        }).catch(error => {
            cb(false);
        });
    }
}