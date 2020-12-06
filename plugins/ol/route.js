module.exports = {
    get: {
        // Опросные листы
        '/ol': 'viewlist',
        '/ol/json': 'viewlistjson',
        '/ol/add': 'add',
        '/ol/edit/:id': 'edit',
        '/ol/view_ol/:id': 'view_ol',
        '/ol/editnum/:id': 'editnum',
        '/ol/delete/:id': 'delete',
        '/ol/close/:id/:state': 'close',
        '/ol/group/:sec_id/:id/:group/:po/:nextnum': 'group',
        '/ol/view/:id': 'view',
        '/ol/export/:id': 'export_docx',
        '/ol/export_pdf/:id': 'export_pdf',
        '/ol/files/add/:id': 'addFile',
        '/ol/copy/:id': 'copyOl',


        // Шаблоны
        '/ol/templates': 'templatesView',
        '/ol/templates/add': 'templatesAdd',
        '/ol/templates/edit/:id': 'templatesEdit',
        '/ol/templates/delete/:id': 'templatesDelete',
        '/ol/templates/copy/:id': 'templatesCopy',

        // Разделы
        '/ol/sections/:id': 'sectionsView',
        '/ol/sections/:id/add': 'sectionsAdd',
        '/ol/sections/:tid/edit/:id': 'sectionsEdit',
        '/ol/sections/:tid/delete/:id': 'sectionsDelete',
        '/ol/sections/resort/:ids': 'sectionsResort',

        // Характеристики
        '/ol/specs/resort/:ids': 'specsResort',
        '/ol/specs/addparam/:sec_id/:id': 'specsAddParam',
        '/ol/specs/deleteparam/:id': 'specsDeleteParam',
        '/ol/specs/:tid/:id': 'specsView',
        '/ol/specs/:tid/:id/add': 'specsAdd',
        '/ol/specs/:tid/:id/addgroup': 'specsAddGroup',
        '/ol/specs/:tid/:sid/edit/:id': 'specsEdit',
        '/ol/specs/:tid/:sid/delete/:id': 'specsDelete',
        '/ol/specs/:tid/:sid/group/:id': 'specsViewGroup',

    },
    post: {
        // Опросные листы
        '/ol/add': 'addPost',
        '/ol/edit/:id': 'editPost',
        '/ol/editmain/:id': 'editMainPost',
        '/ol/editnum/:id': 'editnumPost',
        '/ol/files/add/:id': 'addFilePost',

        // Шаблоны
        '/ol/templates/add': 'templatesAddPost',
        '/ol/templates/edit/:id': 'templatesEditPost',

        // Разделы
        '/ol/sections/:id/add': 'sectionsAddPost',
        '/ol/sections/:tid/edit/:id': 'sectionsEditPost',
        '/ol/sections/:tid/color/:id': 'sectionsEditColorPost',

        // Характеристики
        '/ol/specs/:tid/:id/add': 'specsAddPost',
        '/ol/specs/:tid/:id/addgroup': 'specsAddGroupPost',
        '/ol/specs/:tid/:sid/edit/:id': 'specsEditPost',
        '/ol/specs/save/:id': 'specsSave'
    }
}