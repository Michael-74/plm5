module.exports = {
    get: {
        '/manufacture': 'viewManufacture',
        '/manufacture/edit/:id': 'editManufactureStation',
        '/manufacture/operation_duration/:station_id/:operation_id': 'viewManufactureOpDuration',
        '/manufacture/operation_duration_json/:station_id/:operation_id': 'viewManufactureOpDurationJson',


        '/manufacture/sync_graph': 'viewManufactureSyncGraph',
        '/manufacture/sync_graph_resources': 'viewManufactureSyncGraphRes',
        '/manufacture/sync_graph_events': 'viewManufactureSyncGraphEvents',

        
       
    },
    post: {
        '/manufacture/edit/:id': 'editManufactureStationPost',

    }

}