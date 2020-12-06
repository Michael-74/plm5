module.exports = {
    get: {
        // ----------- ОПЕРАЦИИ
        '/standartizer/structure': 'viewGroupsStructure',
        '/standartizer/structure/add_group': 'addGroup',
        '/standartizer/structure/edit_group/:id': 'editGroup',
        '/standartizer/structure/edit_ap/:id': 'editAP',
        '/standartizer/structure/copy_group/:id': 'copyGroup',
        '/standartizer/structure/delete_group/:id': 'deleteGroup',


        '/standartizer/structure/list/:id': 'viewstructure',
        '/standartizer/structure/add/:id': 'addsection',
        '/standartizer/structure/edit/:id': 'editsection',
        '/standartizer/structure/delete/:id': 'deletesection',
        '/standartizer/structure/changeparent/:id/:parent': 'changeParent',
        '/standartizer/structure/changeorder/:order': 'changeOrder',


        // ----------- СТАНЦИИ
        '/standartizer': 'viewlist',
        '/standartizer/list/add': 'addlist',
        '/standartizer/list/view/:id': 'viewCurList',
        '/standartizer/list/edit/:id': 'editlist',
        '/standartizer/list/copy/:id': 'copylist',
        '/standartizer/list/delete/:id': 'deletelist',
        '/standartizer/list/delete_plan/:id': 'deleteplan',
        '/standartizer/list/uniq': 'checkUnique',
        '/standartizer/list/state/:id/:state': 'changeStationState',
        '/standartizer/list/accept_plan/:id': 'acceptPlanState',


        '/standartizer/list/calc_modal/:id': 'stationCalcModal',
        '/standartizer/list/calc_modal_calendar_view/:plan_id': 'stationCalcModalCalendarViewPlan',
        '/standartizer/list/calc_modal_calendar/:id/:date': 'stationCalcModalCalendar',
        '/standartizer/list/calc_modal_resources/:plan_id': 'stationCalcModalResources',
        '/standartizer/list/calc_modal_events_view/:plan_id': 'stationCalcModalEventsView',
        '/standartizer/list/calc_modal_event_change/:plan_id/:station_id/:operation_id/:date': 'stationCalcModalEventChange',

        '/standartizer/list/calc_modal_calendar_edit/:plan_id': 'stationCalcModalCalendarEditPlan',
        '/standartizer/list/calc_modal_events/:plan_id': 'stationCalcModalEvents',

        
    },
    post: {
        // ----------- ОПЕРАЦИИ
        '/standartizer/structure/add_group': 'addGroupPost',
        '/standartizer/structure/edit_group/:id': 'editGroupPost',
        '/standartizer/structure/add/:id': 'addsectionPost',
        '/standartizer/structure/edit/:id': 'editsectionPost',
        '/standartizer/structure/edit_ap/:id': 'editAPPost',
        '/standartizer/structure/color/:id': 'editSectionColorPost',

        // ----------- СТАНЦИИ
        '/standartizer/list/add': 'addlistPost',
        '/standartizer/list/edit/:id': 'editlistPost',
        '/standartizer/list/calc_modal_event_change/:plan_id/:station_id/:operation_id/:date': 'stationCalcModalEventChangePost',
        '/standartizer/list/calc_modal_event_change_drop/:plan_id': 'stationCalcModalEventChangeDropPost'
        
    }
}