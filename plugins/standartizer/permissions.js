module.exports = {
    // Операции
    'viewGroups': {
        name: 'Просмотр списка групп операций',
        description: 'Просмотр списка групп операций',
        list: ['viewGroupsStructure']
    },
    'editGroupStructrue': {
        name: 'Добавление групп операций',
        description: 'Добавление групп операций',
        list: ['editGroup','editGroupPost','addGroup','addGroupPost']
    },
    'copyGroupStructrue': {
        name: 'Копирование групп операций',
        description: 'Копирование групп операций',
        list: ['copyGroup',]
    },
    'deleteGroupStructrue': {
        name: 'Удаление групп операций',
        description: 'Удаление групп операций',
        list: ['deleteGroup']
    },



    'viewStructrue': {
        name: 'Просмотр списка операций',
        description: 'Просмотр операций для нормировщика',
        list: ['viewstructure']
    },
    'editStructrue': {
        name: 'Управление списком операций',
        description: 'Добавление, редактирование и удаление списка операций',
        list: ['editsectionTech', 'editsectionTechPost', 'addsectionTech', 'addsectionTechPost', 'checkUnique','editSectionColorPost','editAP','editAPPost','addsection','addsectionPost','editsectionPost','editsection','deletesection','changeParent','changeOrder']
    },
    

    // Станции
    'viewList': {
        name: 'Просмотр списка станций',
        description: 'Просмотр списка станций',
        list: ['viewlist','viewCurList']
    },
    'editList': {
        name: 'Редактирование списка станций',
        description: 'Добавление, редактирование, удаление списка станций',
        list: ['addlist','addlistPost','editlist','editlistPost','deletelist']
    },
    'copyList': {
        name: 'Создание копии расчета',
        description: 'Создание копии расчета',
        list: ['copylist']
    },
    'calcList': {
        name: 'Построение планов станций',
        description: 'Построение планов станций',
        list: ['stationCalcModal', 'stationCalcModalEventChange', 'changeStationState', 'deleteplan','stationCalcModalCalendarEditPlan', 'stationCalcModalCalendarViewPlan', 'stationCalcModalCalendar','stationCalcModalResources','stationCalcModalEvents','stationCalcModalEventsView']
    },
    'acceptPlan': {
        name: 'Утверждение планов',
        description: 'Утверждение планов',
        list: ['acceptPlanState']
    }
}