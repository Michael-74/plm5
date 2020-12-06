const   moment = require('moment'),
        PizZip = require('pizzip'),
        Docxtemplater = require('docxtemplater'),
        fs = require('fs'),
        contentDisposition = require('content-disposition');

module.exports = class {

    constructor(that, Helper, route, permissions, menu, welcome) {
        that._d('- plugin "ol" loaded');
        this.name = 'Опросные листы';
        this._d = (msg) => that._d(msg);
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.menu = menu;
        this.plugins = that.plugins;
        this.welcome = welcome;
        this.events = that.events;
        this.options = that.options;
        this.pagination_limit = that.db.pagination_limit;
    }

    // Опросные листы
    viewlist(req, res, next) {
        this.helper.getOls((ols) => {
            res.tpl('list2', {
                actions:[
                    {
                        action: '<a href="/ol/templates" onclick="Tabs.sameTab(\'/ol/templates\'); return false;" class="btn btn-sm btn-white"><i class="fas fa-tools"></i></a>',
                        access: 'ol:viewTemplates'
                    },
                    {
                        action: '<a href="/ol/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;создать опросный лист</a>',
                        access: 'ol:addLists'
                    }
                ],
                title: 'Опросные листы',
                plugin: 'ol',
                items: ols,
                userid: req.user.id
            });
        });
    }
    viewlistjson(req, res, next) {
        let page = (typeof query.page != 'undefined' ? query.page : 1)
        let limit = this.pagination_limit
        let orderVal = (typeof query.sortVal != 'undefined'?query.sortVal:'date')
        let orderDir = (typeof query.sortDir != 'undefined'?(query.sortDir=='asc'?'asc':'desc'):'desc')
    }
    add(req, res, next) {
        this.helper.getTemplates((templates) => {
            this.helper.getLastOlNum((last_ol_num) => {
                this.helper.getAddPredicatedData((pre) => {
                    let ol_num = 'ОЛ '+parseInt(moment().format('YYYY'))+'/'+last_ol_num;
                    res.render('../plugins/ol/views/add', {
                        title: 'Создание опросного листа',
                        plugin: 'ol',
                        templates: templates,
                        last_ol_num: ol_num,
                        pre: pre
                    });
                });
            });
        });
    }
    addPost(req, res, next) {
        this.helper.addOl(req.user.id, parseInt(req.body.tpl_id), req.body.ol_num, req.body.rd_fullname, req.body.rd_num, req.body.place, req.body.customer, req.body.type, req.body.sub_type, parseInt(req.body.customer_cat), req.body.project_inst, parseInt(req.body.parts), (data) => {
            res.json({ok:(data===false?false:true)});
            if (data != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'addOl',
                    data: {
                        id: parseInt(data),
                        ol_num: req.body.ol_num
                    }
                });
            }
        });
    }
    delete(req, res, next) {
        this.helper.deleteOL(parseInt(req.params.id), (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'deleteOl',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            }
        });
    }
    editnum(req, res, next) {
        let item_id = parseInt(req.params.id);
        this.helper.getOlNum(item_id, (lnum, val) => {
            res.render('../plugins/ol/views/editnum', { item_id: item_id, lnum: lnum, val: val  });
        });
    }
    editnumPost(req, res, next) {
        this.helper.saveOlNum(parseInt(req.params.id), parseInt(req.body.num), (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'editNumOl',
                    data: {
                        id: parseInt(req.params.id),
                        num: parseInt(req.body.num)
                    }
                });
            }
        });
    }
    close(req, res, next) {
        this.helper.changeClosed(parseInt(req.params.id), parseInt(req.params.state), (status) => {
            res.json({ok:status});
        });
    }
    edit(req, res, next) {
        this.helper.getOlExtraData(parseInt(req.params.id), (ol_data, sections, sections_data, template_data) => {
            this.helper.getAddPredicatedData((pre) => {
                res.tpl('edit2', {
                    actions:[
                        {
                            action: '<a href="#" class="btn btn-sm btn-primary" onclick="OlEdit.submitMainForm(); return false;"><i class="fal fa-save"></i>&nbsp;Сохранить</a>',
                            access: 'ol:editLists'
                        }
                    ],
                    back: {
                        url: '/ol',
                        title: '← назад к списку опросных листов'
                    },
                    title: 'Редактирование опросного листа',
                    plugin: 'ol',
                    id: parseInt(req.params.id),
                    ol_data: ol_data,
                    sections: sections,
                    sections_data: sections_data,
                    template_data: template_data,
                    pre: pre
                });
            });
        });
    }
    view_ol(req, res, next) {
        this.helper.getOlExtraData(parseInt(req.params.id), (ol_data, sections, sections_data, template_data) => {
            this.helper.getAddPredicatedData((pre) => {
                res.tpl('view_ol', {
                    actions:[],
                    back: {
                        url: '/ol',
                        title: '← назад к списку опросных листов'
                    },
                    title: 'Просмотр опросного листа',
                    plugin: 'ol',
                    id: parseInt(req.params.id),
                    ol_data: ol_data,
                    sections: sections,
                    sections_data: sections_data,
                    template_data: template_data,
                    pre: pre
                });
            });
        });
    }
    editPost(req, res, next) {
        let params = {};
        for (let i in req.body) {
            let splt_param = i.split('_');
            if (splt_param[0] == 'data') {
                if (req.body[i] != '') {
                    params[splt_param[1]] = req.body[i];
                }
            } else if (splt_param[0] == 'group') {
                if (typeof params.group == 'undefined') params.group = {};
                if (typeof params.group[splt_param[1]] == 'undefined') params.group[splt_param[1]] = [];
                let index = parseInt(splt_param[2])-1;
                if (typeof params.group[splt_param[1]][index] == 'undefined') params.group[splt_param[1]][index] = {};
                params.group[splt_param[1]][index][splt_param[3]] = req.body[i];
            }
        }
        for (let i in params.group) {
            params.group[i] = params.group[i].filter(function (el) {
                return el != null;
            });
        }
        this.helper.saveOl(parseInt(req.params.id), JSON.stringify(params), (status) => {
            res.json({ok:status});
        });
    }
    editMainPost(req, res, next) {
        this.helper.saveMainOl(parseInt(req.params.id), req.body, (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'editMainOl',
                    data: {
                        id: parseInt(req.params.id),
                        data: req.body
                    }
                });
            }
        });
    }
    group(req, res, next) {
        this.helper.getOlExtraData(parseInt(req.params.id), (ol_data, sections, sections_data, template_data) => {
            let nsize = 0;
            if (typeof ol_data.params.group != 'undefined') {
                if (typeof ol_data.params.group[parseInt(req.params.group)] != 'undefined') {
                    if (typeof ol_data.params.group[parseInt(req.params.group)][0] != 'undefined') {
                        nsize = Object.keys(ol_data.params.group[parseInt(req.params.group)][0]).length;
                    }
                }
            }
            res.render('../plugins/ol/views/editGroup', {
                id: parseInt(req.params.id),
                ol_data: ol_data,
                sections: sections,
                sections_data: sections_data,
                group: parseInt(req.params.group),
                sec_id: parseInt(req.params.sec_id),
                po: parseInt(req.params.po),
                nextnum: parseInt(req.params.nextnum),
                template_data: template_data,
                nsize: nsize
            }, function(err, html) {
                res.json({ok:(err?false:true), html:html});
            });
        });
    }
    view(req, res, next) {
        this.helper.getOlExtraData(parseInt(req.params.id), (ol_data, sections, sections_data, template_data) => {
            this.helper.genExportJson(ol_data, sections, sections_data, (data) => {
                // this._d(data);
                res.json(data);
            });
        });
    }
    export_docx(req, res, next) {
        let reqid = parseInt(req.params.id); 
        this.helper.getOlExtraData(reqid, (ol_data, sections, sections_data, template_data) => {
            this.helper.genExportJson(ol_data, sections, sections_data, (data) => {
                let doc = new Docxtemplater();
                doc.setOptions({
                    linebreaks: true,
                    nullGetter: () => {
                        return "";
                    }
                });
                let zip_docx_template = new PizZip(fs.readFileSync(this.options.dir.base+'templates/template.docx'));
                doc.loadZip(zip_docx_template).setData(data).render();
                let fileReport = doc.getZip().generate({ type: 'nodebuffer' });

                let filename = (ol_data.rd_num ? ol_data.rd_num : reqid);
                filename = filename.replace(/[/\\?%*:|"<>]/g, '_');
                res.setHeader('Content-disposition', contentDisposition(filename+'.docx'));
                res.contentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");

                res.send(fileReport);
                

            });
        });
    }
    export_pdf(req, res, next) {
        // this.helper.getOlExtraData(parseInt(req.params.id), (ol_data, sections, sections_data, template_data) => {
        //     this.helper.genExportJson(ol_data, sections, sections_data, (data) => {
        //         let doc = new Docxtemplater();
        //         doc.setOptions({
        //             nullGetter: () => {
        //                 return "";
        //             }
        //         });
        //         doc.loadZip(this.zip_docx_template).setData(data).render();
        //         let fileReport = doc.getZip().generate({ type: 'nodebuffer' });
        //         crypto.randomBytes(16, (err, buf) => {
        //             let rnd = buf.toString('hex');
        //             fs.writeFileSync(this.options.dir.base+'templates/temp/'+rnd+'.docx', fileReport);
        //         });
        //     });
        // });
    }
    /** копирование опросного листа */
    copyOl(req, res, next) {
        this.helper.copyOl(parseInt(req.params.id), req.user.id, (status) => {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'copyOl',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            }   
        });
    }


    // Шаблоны
    templatesView(req, res, next) {
        this.helper.getTemplates((templates) => {
            res.tpl('templates/list', {
                actions:[
                    {
                        action: '<a href="/ol/templates/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить шаблон</a>',
                        access: 'ol:addTemplates'
                    }
                ],
                back: {
                    url: '/ol',
                    title: '← назад к списку опросных листов'
                },
                title: 'Шаблоны опросных листов',
                plugin: 'ol',
                items: templates
            });
        });
    }
    templatesAdd(req, res, next) {
        res.render('../plugins/ol/views/templates/add');
    }
    templatesAddPost(req, res, next) {
        this.helper.addTemplate(req.body.name, req.user.id, (data) => {
            res.json({ok:(data===false?false:true)});
            if (data != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'addTemplate',
                    data: {
                        id: parseInt(data),
                        name: req.body.name
                    }
                });
            }
        });
    }
    templatesEdit(req, res, next) {
        this.helper.getTemplate(req.params.id, (tpl_data) => {
            res.render('../plugins/ol/views/templates/edit', {item:tpl_data});
        });
    }
    templatesEditPost(req, res, next) {
        this.helper.editTemplate(req.body.name, parseInt(req.params.id), (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'editTemplate',
                    data: {
                        id: parseInt(req.params.id),
                        name: req.body.name
                    }
                });
            }
        });
    }
    templatesDelete(req, res, next) {
        this.helper.deleteTemplate(parseInt(req.params.id), (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'deleteTemplate',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            }
        });
    }
    templatesCopy(req, res, next) {
        this.helper.copyTemplate(parseInt(req.params.id), req.user.id, (status) => {
            res.json({ok:(false?false:true)});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'copyTemplate',
                    data: {
                        id: parseInt(req.params.id),
                        new_id: status
                    }
                });
            }
        });
    }



    // Разделы
    sectionsView(req, res, next) {
        if (typeof req.params.id != 'undefined') {
            let tpl_id = parseInt(req.params.id);
            this.helper.getSections(tpl_id, (template, sections) => {
                res.tpl('sections/list', {
                    actions:[
                        {
                            action: '<a href="/ol/sections/'+template.id+'/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить раздел</a>',
                            access: 'ol:addSections'
                        }
                    ],
                    back: {
                        url: '/ol/templates',
                        title: '← назад к списку шаблонов'
                    },
                    title: template.name,
                    plugin: 'ol',
                    items: sections,
                    template: template
                })
            });
        } else {
            next();
        }
    }
    sectionsAdd(req, res, next) {
        res.render('../plugins/ol/views/sections/add', {id:parseInt(req.params.id)});
    }
    sectionsAddPost(req, res, next) {
        this.helper.addSection(parseInt(req.params.id), req.body.name, req.user.id, (ins_id) => {
            res.json({ok:(ins_id===false?false:true)});
            if (ins_id != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'addSection',
                    data: {
                        template_id: parseInt(req.params.id),
                        id: ins_id,
                        name: req.body.name
                    }
                });
            }
        });
    }
    sectionsEdit(req, res, next) {
        this.helper.getSection(parseInt(req.params.id), (section) => {
            res.render('../plugins/ol/views/sections/edit', {tid:parseInt(req.params.tid),id:parseInt(req.params.id), item:section});
        });
    }
    sectionsEditPost(req, res, next) {
        this.helper.editSection(parseInt(req.params.id), req.body.name, (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'editTemplate',
                    data: {
                        template_id: parseInt(req.params.tid),
                        id: parseInt(req.params.id),
                        name: req.body.name
                    }
                });
            }
        });
    }
    sectionsEditColorPost(req, res, next) {
        this.helper.changeColorSection(parseInt(req.params.id), req.body.color, (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'editColorSection',
                    data: {
                        template_id: parseInt(req.params.tid),
                        id: parseInt(req.params.id),
                        name: req.body.color
                    }
                });
            }
        });
    }
    sectionsDelete(req, res, next) {
        this.helper.deleteSection(parseInt(req.params.id), (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'deleteSection',
                    data: {
                        template_id: parseInt(req.params.tid),
                        id: parseInt(req.params.id)
                    }
                });
            }
        });
    }
    sectionsResort(req, res, next) {
        let ids = req.params.ids.split(',');
        this.helper.resortSections(ids, (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'resortSection',
                    data: {
                        ids: req.params.ids
                    }
                });
            }
        });
    }



    // Характеристики
    specsView(req, res, next) {
        if (typeof req.params.tid != 'undefined' && typeof req.params.id != 'undefined') {
            this.helper.getSpecs(parseInt(req.params.tid), parseInt(req.params.id), (template, section, params_data, params_values_data) => {
                res.tpl('specs/list', {
                    actions:[
                        {
                            action: '<a href="/ol/specs/'+template.id+'/'+section.id+'/addgroup" rel="modal:open" class="btn btn-sm btn-primary"><i class="fa fa-plus"></i>&nbsp;добавить группу</a>',
                            access: 'ol:addSpecs'
                        },
                        {
                            action: '<a href="/ol/specs/'+template.id+'/'+section.id+'/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить характеристику</a>',
                            access: 'ol:addSpecs'
                        }
                    ],
                    back: {
                        url: '/ol/sections/'+template.id,
                        title: '← назад к списку разделов'
                    },
                    title: 'Характеристики «'+section.name+'»',
                    plugin: 'ol',
                    template: template,
                    section: section,
                    params_data: params_data,
                    params_values_data: params_values_data
                })
            });
        } else {
            next();
        }
    }
    specsAdd(req, res, next) {
        let group_id = parseInt(req.query.group) || 0;
        res.render('../plugins/ol/views/specs/addSpec',{tid:parseInt(req.params.tid),id:parseInt(req.params.id),group_id:group_id});
    }
    specsAddPost(req, res, next) {
        this.helper.addSpec(req.body.name, parseInt(req.body.type), parseInt(req.params.id), parseInt(req.body.group_id), req.user.id, (status) => {
            res.json({ok:(status===false?false:true)});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'addSpecs',
                    data: {
                        section_id: parseInt(req.params.id),
                        id: status,
                        name: req.body.name,
                        type: parseInt(req.body.type),
                        group: 0
                    }
                });
            }
        });
    }
    specsEdit(req, res, next) {
        this.helper.getSpec(parseInt(req.params.id), (item) => {
            res.render('../plugins/ol/views/specs/editSpec',{
                tid:parseInt(req.params.tid),
                sid:parseInt(req.params.sid),
                item: item
            });
        });
    }
    specsEditPost(req, res, next) {
        this.helper.editSpecName(req.body.name, parseInt(req.params.id), (status) => {
            res.json({ok:(status===false?false:true)});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'editSpecs',
                    data: {
                        section_id: parseInt(req.params.sid),
                        id: req.params.id,
                        name: req.body.name
                    }
                });
            }
        });
    }
    specsDelete(req, res, next) {
        this.helper.deleteSpec(parseInt(req.params.id), (status) => {
            res.json({ok:(status===false?false:true)});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'deleteSpecs',
                    data: {
                        section_id: parseInt(req.params.sid),
                        id: req.params.id
                    }
                });
            }
        });
    }
    specsResort(req, res, next) {
        let ids = req.params.ids.split(',');
        this.helper.resortSpecs(ids, (status) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'resortSpecs',
                    data: {
                        ids: req.params.ids
                    }
                });
            }
        });
    }
    specsSave(req, res, next) {
        this.helper.saveSpecs(parseInt(req.params.id), req.body.param_value, (status) => {
            res.json({ok:status});
            // if (status != false) {
            //     this.events.emit('log', {
            //         uid: req.user.id,
            //         plugin: 'ol',
            //         action: 'saveSpecsParam',
            //         data: {
            //             param_id: param_id,
            //             param_value: param_value
            //         }
            //     });
            // }
        });
    }
    specsAddParam(req, res, next) {
        let param_id = parseInt(req.params.id);
        let section_id = parseInt(req.params.sec_id);
        this.helper.addSpecsParam(param_id, section_id, (status) => {
            res.json({ok:(status==false?false:true), id:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'addSpecsParam',
                    data: {
                        param_id: param_id,
                        section_id: section_id
                    }
                });
            }
        });
    }
    specsDeleteParam(req, res, next) {
        let param_id = parseInt(req.params.id);
        this.helper.deleteSpecsParam(param_id, (status) => {
            res.json({ok:(status==false?false:true)});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'deleteSpecsParam',
                    data: {
                        id: param_id
                    }
                });
            }
        });
    }
    specsAddGroup(req, res, next) {
        res.render('../plugins/ol/views/specs/addSpecGroup',{
            tid: parseInt(req.params.tid),
            id: parseInt(req.params.id)
        });
    }
    specsAddGroupPost(req, res, next) {
        this.helper.addSpecGroup(req.body.name, parseInt(req.body.type), parseInt(req.params.id), req.user.id, (status, id, group) => {
            res.json({ok:status});
            if (status != false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'ol',
                    action: 'addSpecGroup',
                    data: {
                        section_id: parseInt(req.params.id),
                        id: id,
                        name: req.body.name,
                        type: parseInt(req.body.type),
                        group: group
                    }
                });
            }
        });
    }
    specsViewGroup(req, res, next) {
        let tid = parseInt(req.params.tid);
        let sid = parseInt(req.params.sid);
        let id = parseInt(req.params.id);
        this.helper.getSpecsGroup(tid, sid, id, (template, section, group_data, params_data, params_values_data) => {
            res.tpl('specs/listGroup', {
                actions:[
                    {
                        action: '<a href="/ol/specs/'+template.id+'/'+section.id+'/add?group='+group_data.id+'" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить характеристику</a>',
                        access: 'ol:addSpecs'
                    }
                ],
                back: {
                    url: '/ol/specs/'+template.id+'/'+section.id,
                    title: '← назад к списку разделов'
                },
                title: section.name+' — '+group_data.name,
                plugin: 'ol',
                template: template,
                section: section,
                group_data: group_data,
                params_data: params_data,
                params_values_data: params_values_data
            })
        });

    }
}