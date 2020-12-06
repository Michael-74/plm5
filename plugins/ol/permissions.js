module.exports = {
    // Опросные листы
    'viewLists': {
        name: 'Просмотр списка опросных листов',
        description: 'Разрешение на просмотр списка опросных листов',
        list: ['viewlist','viewlistjson']
    },
    'viewList': {
        name: 'Просмотр опросных листов',
        description: 'Разрешение на просмотр отдельных опросных листов',
        list: ['view', 'view_ol', 'export_docx', 'export_pdf']
    },
    'addLists': {
        name: 'Добавление и копирование опросных листов',
        description: 'Разрешение на добавление и копирование опросных листов',
        list: ['add','addPost', 'copyOl']
    },
    'editLists': {
        name: 'Редактирование опросных листов',
        description: 'Разрешение на редактирование опросных листов',
        list: ['edit','editPost','group','editMainPost','addFile']
    },
    'editnumLists': {
        name: 'Редактирование номеров опросных листов',
        description: 'Разрешение на редактирование номеров опросных листов',
        list: ['editnum','editnumPost']
    },
    'deleteLists': {
        name: 'Удаление опросных листов',
        description: 'Разрешение на удаление опросных листов',
        list: ['delete']
    },
    'closeLists': {
        name: 'Закрытие опросных листов от редактирования',
        description: 'Разрешение на закрытие опросных листов от редактирования',
        list: ['close']
    },
    // Шаблоны
    'viewTemplates': {
        name: 'Просмотр шаблонов',
        description: 'Разрешение на просмотр списка шаблонов опросных листов',
        list: ['templatesView']
    },
    'addTemplates': {
        name: 'Добавление шаблонов',
        description: 'Разрешение на добавление шаблонов опросных листов',
        list: ['templatesAdd','templatesAddPost','templatesCopy']
    },
    'editTemplates': {
        name: 'Редактирование шаблонов',
        description: 'Разрешение на редактирование шаблонов опросных листов',
        list: ['templatesEdit','templatesEditPost']
    },
    'deleteTemplates': {
        name: 'Удаление шаблонов',
        description: 'Разрешение на удаление любых шаблонов опросных листов',
        list: ['templatesDelete']
    },

    // Разделы шаблонов
    'viewSections': {
        name: 'Просмотр разделов',
        description: 'Разрешение на просмотр разделов шаблонов опросных листов',
        list: ['sectionsView']
    },
    'addSections': {
        name: 'Добавление разделов в шаблоны',
        description: 'Разрешение на добавление разделов в шаблоны опросных листов',
        list: ['sectionsAdd','sectionsAddPost']
    },
    'editSections': {
        name: 'Редактирование разделов шаблонов',
        description: 'Разрешение на редактирование разделов шаблонов опросных листов',
        list: ['sectionsEdit','sectionsEditPost','sectionsEditColorPost','sectionsResort']
    },
    'deleteSections': {
        name: 'Удаление разделов из шаблонов',
        description: 'Разрешение на удаление разделов из шаблонов опросных листов',
        list: ['sectionsDelete']
    },

    // Характеристики
    'viewSpecs': {
        name: 'Просмотр характеристик разделов',
        description: 'Разрешение на просмотр характеристик разделов опросных листов',
        list: ['specsView','specsViewGroup']
    },
    'addSpecs': {
        name: 'Добавление характеристик в разделы',
        description: 'Разрешение на добавление характеристик в разделы опросных листов',
        list: ['specsAdd','specsAddPost','specsAddGroup','specsAddGroupPost']
    },
    'editSpecs': {
        name: 'Редактирование характеристик',
        description: 'Разрешение на редактирование характеристик в разделах шаблонов опросных листов',
        list: ['specsEdit','specsEditPost','specsResort','specsSave','specsAddParam','specsDeleteParam']
    },
    'deleteSpecs': {
        name: 'Удаление характеристик',
        description: 'Разрешение на удаление характеристик из разделов шаблонов опросных листов',
        list: ['specsDelete']
    }
}