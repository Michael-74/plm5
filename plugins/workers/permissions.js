module.exports = {
    // ----------- УЧАСТКИ
    'view_sections': {
        name: 'Просмотр списка участков',
        description: 'Просмотр списка участков',
        list: [
            'viewSections', 'viewSectionsCalendar', 'viewSectionsCalendarResources', 'viewSectionsCalendarEvents',
            'viewSectionsBusyCalendar', 'viewSectionsBusyCalendarResources', 'viewSectionsBusyCalendarEvents'
        ]
    },
    'add_sections': {
        name: 'Удаление участка',
        description: 'Удаление участка',
        list: ['addSection','addSectionPost']
    },
    'edit_sections': {
        name: 'Редактирование участка',
        description: 'Редактирование участка',
        list: ['editSection','editSectionPost']
    },
    'delete_sections': {
        name: 'Удаление участка',
        description: 'Удаление участка',
        list: ['deleteSection']
    },

    // ----------- БРИГАДЫ
    'view_brigades': {
        name: 'Просмотр списка бригад',
        description: 'Просмотр списка бригад',
        list: ['viewBrigades','viewBrigadesCalendar','viewBrigadesCalendarResources', 'viewBrigadesCalendarEvents']
    },
    'add_brigade': {
        name: 'Добавление бригады',
        description: 'Добавление бригады',
        list: ['addBrigade','addBrigadePost']
    },
    'edit_brigade': {
        name: 'Редактирование бригады',
        description: 'Редактирование бригады',
        list: ['editBrigade','editBrigadePost','viewBrigadesRestCalendar','viewBrigadesRestCalendarJson', 'viewBrigadesRestCalendarPost']
    },
    'delete_brigade': {
        name: 'Удаление бригады',
        description: 'Удаление бригады',
        list: ['deleteBrigade']
    },

    // ----------- РАБОТНИКИ
    'view_workers': {
        name: 'Просмотр списка рабочих',
        description: 'Просмотр списка рабочих',
        list: ['viewWorkers','viewWorkerCalendar','viewWorkerCalendarJson','viewAllWorkersCalendar','viewAllWorkersCalendarResources','viewAllWorkersCalendarEvents']
    },
    'add_worker': {
        name: 'Добавление рабочего',
        description: 'Добавление рабочего',
        list: ['addWorker', 'addWorkerPost']
    },
    'edit_worker': {
        name: 'Редактирование рабочего',
        description: 'Редактирование рабочего',
        list: ['editWorker', 'editWorkerPost', 'editWorkerDatePost']
    },
    'delete_worker': {
        name: 'Удаление рабочего',
        description: 'Удаление рабочего',
        list: ['deleteWorker']
    },
    'edit_rest_calendar': {
        name: 'Редактирование рабочего календаря',
        description: 'Редактирование рабочего календаря',
        list: ['viewRestCalendar','viewRestCalendarPost','viewRestCalendarJson']
    },

    // ----------- РАБОЧИЕ ЦЕНТРЫ
    'view_wcs': {
        name: 'Просмотр списка рабочих центров',
        description: 'Просмотр списка рабочих центров',
        list: ['viewWC']
    },
    'add_wcs': {
        name: 'Добавление рабочих центров',
        description: 'Добавление рабочих центров',
        list: ['addWC', 'addWCPost']
    },
    'edit_wcs': {
        name: 'Редактирование рабочих центров',
        description: 'Редактирование рабочих центров',
        list: ['editWC', 'editWCPost']
    },
    'delete_wcs': {
        name: 'Удаление рабочих центров',
        description: 'Удаление рабочих центров',
        list: ['deleteWC']
    },

    
    // ----------- ТАРИФНЫЕ СТАВКИ
    'view_chts': {
        name: 'Просмотр списка тарифных ставок',
        description: 'Просмотр списка тарифных ставок',
        list: ['viewChts']
    },
    'add_chts': {
        name: 'Добавление тарифных ставок',
        description: 'Добавление тарифных ставок',
        list: ['addChts', 'addChtsPost']
    },
    'edit_chts': {
        name: 'Редактирование тарифных ставок',
        description: 'Редактирование тарифных ставок',
        list: ['editChts', 'editChtsPost']
    },
    'delete_chts': {
        name: 'Удаление тарифных ставок',
        description: 'Удаление тарифных ставок',
        list: ['deleteChts']
    }
}