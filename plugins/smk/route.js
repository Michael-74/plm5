module.exports = {
    get: {
        '/smk': 'viewstructure',
        '/smk/structure/add': 'addsection',
        '/smk/structure/edit/:id': 'editsection',
        '/smk/structure/delete/:id': 'deletesection',
        '/smk/structure/changeparent/:id/:parent': 'changeParent',
        '/smk/structure/changeorder/:order': 'changeOrder',

        '/smk/files': 'viewfiles',
        '/smk/files/:id': 'viewfiles',
        '/smk/files/add/:cat': 'addFiles',
        '/smk/files/delete/:id': 'deleteFile',
        '/smk/files/download/:id': 'downloadFile',
        '/smk/files/edit/:id': 'editFile',
        '/smk/files/pin/:id/:state': 'changePinState',


    },
    post: {
        '/smk/structure/add': 'addsectionPost',
        '/smk/structure/edit/:id': 'editsectionPost',

        '/smk/files/add/:cat': 'addFilesPost',
        '/smk/files/edit/:id': 'editFilePost',

    }
}