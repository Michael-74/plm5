module.exports = {
    // структура
    'viewStructure': {
        name: 'Просмотр списка разделов',
        description: 'Просмотр разделов СМК',
        list: ['viewstructure']
    },
    
    'editStructrue': {
        name: 'Управление структурой',
        description: 'Добавление, редактирование и удаление разделов СМК',
        list: ['addsection','addsectionPost','editsectionPost','editsection','deletesection','changeParent','changeOrder']
    },


    // файлы
    'viewFiles': {
        name: 'Просмотр файлов',
        description: 'Просмотр файлов СМК',
        list: ['viewfiles','downloadFile']
    },
    'editFiles': {
        name: 'Управление файлами',
        description: 'Добавление, редактирование, удаление файлов СМК',
        list: ['addFiles','addFilesPost','deleteFile','editFile','editFilePost','changePinState']
    }
}