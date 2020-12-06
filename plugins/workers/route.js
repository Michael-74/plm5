module.exports = {
    get: {
        // ----------- УЧАСТКИ
        '/workers/sections': 'viewSections',
        '/workers/sections/add': 'addSection',
        '/workers/sections/edit/:id': 'editSection',
        '/workers/sections/delete/:id': 'deleteSection',
        '/workers/sections/calendar/:id': 'viewSectionsCalendar',
        '/workers/sections/calendar_resources/:id': 'viewSectionsCalendarResources',
        '/workers/sections/calendar_events/:id': 'viewSectionsCalendarEvents',
        '/workers/sections/busy_calendar': 'viewSectionsBusyCalendar',
        '/workers/sections/busy_calendar_resources': 'viewSectionsBusyCalendarResources',
        '/workers/sections/busy_calendar_events': 'viewSectionsBusyCalendarEvents',


        // ----------- БРИГАДЫ
        '/workers/brigades': 'viewBrigades',
        '/workers/brigades/rest_calendar/:id': 'viewBrigadesRestCalendar',
        '/workers/brigades/rest_calendar_json/:id': 'viewBrigadesRestCalendarJson',

        '/workers/brigades/calendar/:id': 'viewBrigadesCalendar',
        '/workers/brigades/calendar_resources/:id': 'viewBrigadesCalendarResources',
        '/workers/brigades/calendar_events/:id': 'viewBrigadesCalendarEvents',
        '/workers/brigades/add': 'addBrigade',
        '/workers/brigades/edit/:id': 'editBrigade',
        '/workers/brigades/delete/:id': 'deleteBrigade',


        // ----------- РАБОТНИКИ
        '/workers': 'viewWorkers',
        '/workers/add': 'addWorker',
        '/workers/edit/:id': 'editWorker',
        '/workers/calendar/:id': 'viewWorkerCalendar',
        '/workers/calendar_json/:id': 'viewWorkerCalendarJson',
        '/workers/delete/:id': 'deleteWorker',
        '/workers/rest_calendar': 'viewRestCalendar',
        '/workers/calendar_rest_json': 'viewRestCalendarJson',
        '/workers/all_workers/calendar': 'viewAllWorkersCalendar',
        '/workers/all_workers/calendar/resources': 'viewAllWorkersCalendarResources',
        '/workers/all_workers/calendar/events': 'viewAllWorkersCalendarEvents',


        
        // ----------- ТАРИФНЫЕ СТАВКИ
        '/workers/chts': 'viewChts',
        '/workers/chts/add': 'addChts',
        '/workers/chts/edit/:id': 'editChts',
        '/workers/chts/delete/:id': 'deleteChts',
    },
    post: {
        // ----------- УЧАСТКИ
        '/workers/sections/add': 'addSectionPost',
        '/workers/sections/edit/:id': 'editSectionPost',


        // ----------- БРИГАДЫ
        '/workers/brigades/add': 'addBrigadePost',
        '/workers/brigades/edit/:id': 'editBrigadePost',
        '/workers/brigades/rest_calendar/:id': 'viewBrigadesRestCalendarPost',


        // ----------- РАБОТНИКИ
        '/workers/add': 'addWorkerPost',
        '/workers/calendar_edit/:id': 'editWorkerDatePost',
        '/workers/edit/:id': 'editWorkerPost',
        '/workers/rest_calendar': 'viewRestCalendarPost',


        // ----------- ТАРИФНЫЕ СТАВКИ
        '/workers/chts/add': 'addChtsPost',
        '/workers/chts/edit/:id': 'editChtsPost',

    }

}