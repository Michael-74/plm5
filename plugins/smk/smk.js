
module.exports = class {

    constructor(that, Helper, route, permissions, menu, welcome) {
        that._d('- plugin "smk" loaded');
        this.name = 'Структура разделов СМК';
        this._d = (msg) => that._d(msg);
        this.route = route;
        this.helper = new Helper(that.db);
        this.permissions = permissions;
        this.menu = menu;
        this.plugins = that.plugins;
        this.welcome = welcome;
        this.events = that.events;
        this.options = that.options;
    }

    // STRUCTURE
    viewstructure(req, res, next) {
        // this.helper.getCategories((cats) => {
            // let cats = this.helper._cache.categories;
            // this._d(cats);
            res.tpl('structure/list', {
                actions:[
                    {
                        action: '<a href="/smk/structure/add" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить раздел</a>',
                        access: 'smk:editStructrue'
                    }
                ],
                back: {
                    url: '/smk/files',
                    title: '← назад к списку файлов'
                },
                title: 'Структура разделов СМК',
                plugin: 'smk',
                items: this.helper._cache.categories
            });
        // });
    }
    addsection(req, res, next) {
        res.render('../plugins/smk/views/structure/add');
    }
    addsectionPost(req, res, next) {
        this.helper.addSection(req.body.name, (status) => {
            res.json({ok: (status!=false?true:false)});
            if (status !== true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'smk',
                    action: 'addSection',
                    data: {
                        id: status,
                        name: req.body.name
                    }
                });
            }   
        });
    }
    editsection(req, res, next) {
        this.helper.getCategory(parseInt(req.params.id), (data) => {
            if (data !== false) {
                res.render('../plugins/smk/views/structure/edit', {
                    id: data.id,
                    name: data.name
                });
            } else {
                res.json({ok: false});
            }
        });
    }
    editsectionPost(req, res, next) {
        this.helper.editSection(parseInt(req.params.id), req.body.name, (status) => {
            res.json({ok: status});
            if (status !== false) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'smk',
                    action: 'editSection',
                    data: {
                        id: parseInt(req.params.id),
                        name: req.body.name
                    }
                });
            }   
        });
    }
    deletesection(req, res, next) {
        this.helper.deleteSection(parseInt(req.params.id), (status) => {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'smk',
                    action: 'deleteSection',
                    data: {
                        id: parseInt(req.params.id)
                    }
                });
            }   
        });
    }
    
    changeParent(req, res, next) {
        this.helper.changeParentSection(parseInt(req.params.id), parseInt(req.params.parent), (status) => {
            res.json({ok: status});
            // if (status === true) {
            //     this.events.emit('log', {
            //         uid: req.user.id,
            //         plugin: 'smk',
            //         action: 'change',
            //         data: {
            //             id: parseInt(req.params.id)
            //         }
            //     });
            // }   
        });
    }
    async changeOrder(req, res, next) {
        let mstat = true;
        let order = req.params.order.split(',');
        for (let i = 0; i < order.length; i++) {
            let status = await this.helper.changeOrderSectionAsync(parseInt(order[i]), i+1);
            if (status == false) {
                mstat = false;
            }
        }
        res.json({ok: mstat});
    }


    // FILES
    viewfiles(req, res, next) {
        let cat = 0;
        if (typeof req.params.id !== 'undefined') {
            cat = parseInt(req.params.id);
        }
        // this.helper.getCategories((cats) => {
            // let cats = this.helper._cache.categories;
            this.helper.getCategoryFiles(cat, (files) => {
                res.tpl('files/list', {
                    actions:[
                        {
                            action: '<a href="http://192.168.1.8:333/" title="Перейти на портал СМК" target="_blank" class="btn btn-sm btn-white"><i class="fas fa-external-link"></i></a>',
                            access: 'smk:viewFiles'
                        },
                        {
                            action: '<a href="/smk" onclick="Tabs.sameTab(\'/smk\'); return false;" class="btn btn-sm btn-white"><i class="fas fa-tools"></i></a>',
                            access: 'smk:editStructrue'
                        },
                        {
                            action: '<a href="/smk/files/add/'+cat+'" rel="modal:open" class="btn btn-sm btn-success"><i class="fa fa-plus"></i>&nbsp;добавить файл</a>',
                            access: 'smk:editFiles'
                        },
                        {
                            action: '<a href="#" onclick="SmkFiles.deleteSelected();return false;" class="btn btn-sm btn-danger if_checked"><i class="fal fa-trash-alt"></i>&nbsp;Удалить выбранные</a>',
                            access: 'smk:editFiles'
                        }
                    ],
                    title: 'Файлы СМК',
                    plugin: 'smk',
                    items: files,
                    cats: this.helper._cache.categories,
                    cat: [cat]
                });
            });
        // });
    }

    addFiles(req, res, next) {
        let cat = parseInt(req.params.cat);
        // this.helper.getCategories((cats) => {
            // let cats = this.helper._cache.categories;
            res.render('../plugins/smk/views/files/add', {cats:this.helper._cache.categories, cat:[cat]});
        // });
    }

    addFilesPost(req, res, next) {
        this.helper.addFiles(req.files.files, (typeof req.body.sections == 'object' ? req.body.sections : [req.body.sections]), (status) => {
            res.json({ok: status});
        });
    }

    deleteFile(req, res, next) {
        let ids = [];
        let pids = req.params.id.split(',');
        if (pids.length > 1) {
            for (let i in pids) {
                ids.push(parseInt(pids[i]));
            }
        } else {
            ids.push(parseInt(req.params.id));
        }
        this.helper.deleteFile(ids, (status) => {
            res.json({ok: status, ids:ids});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'smk',
                    action: 'deleteFile',
                    data: {
                        ids: ids
                    }
                });
            }   
        });
    }

    downloadFile(req, res, next) {
        this.helper.getFileBody(parseInt(req.params.id), (data) => {
            res.set('Content-Type', data.mimetype);
            res.set('Content-disposition', 'attachment; filename="'+encodeURIComponent(data.name)+'.'+data.format+'"');
            res.send(data.body);
        });
    }

    editFile(req, res, next) {
        this.helper.getFile(parseInt(req.params.id), (data) => {
            let mod_cats = [];
            let acats = data.categories.split(',');
            for (let n in acats) {
                mod_cats.push(parseInt(acats[n].split('#')[1]));
            }
            // this.helper.getCategories((cats) => {
                // let cats = this.helper._cache.categories;
                res.render('../plugins/smk/views/files/edit', {
                    id: data.id,
                    name: data.name,
                    comment: data.comment,
                    cats: this.helper._cache.categories,
                    cat: mod_cats
                });
            // });
        });
    }

    editFilePost(req, res, next) {
        this.helper.editFile(parseInt(req.params.id), req.body.name, req.body.comment, (typeof req.body.sections == 'object' ? req.body.sections : [req.body.sections]), (status) => {
            res.json({ok: status});
        });
    }

    changePinState(req, res, next) {
        this.helper.updatePinState(parseInt(req.params.id), parseInt(req.params.state), (status) => {
            res.json({ok: status});
            if (status === true) {
                this.events.emit('log', {
                    uid: req.user.id,
                    plugin: 'smk',
                    action: 'changePinStatus',
                    data: {
                        id: parseInt(req.params.id),
                        state: parseInt(req.params.state)
                    }
                });
            }
        });
    }

}