module.exports = {
    get: {
        '/settings': 'view',
        '/settings/state/:id/:state': 'changeParamState'
    },
    post: {
        '/settings/update_num': 'updateNumFieldsPost'
    }
}