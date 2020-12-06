module.exports = {
    get: {
        // USERS
        '/users': 'settings',
        '/users/users/state/:id/:state': 'changeUserState',
        '/users/users/add': 'usersAddForm',
        '/users/users/delete/:id': 'usersDelete',
        '/users/users/edit/:id': 'usersEdit',
        '/users/users/editad/:id': 'usersEditAd',

        // GROUP
        '/users/groups': 'groups',
        '/users/groups/add': 'groupAddForm',
        '/users/groups/delete/:id': 'groupDelete',
        '/users/groups/edit/:id': 'groupEditForm',
        '/users/groups/permissions/:group_id/:plugin/:func/:cstate': 'groupEditPermissions'
    },
    post: {
        // USERS
        '/users/users/add': 'usersAddPost',
        '/users/users/addAD': 'usersAddADPost',
        '/users/users/edit/:id': 'usersEditPost',
        '/users/users/editad/:id': 'usersEditAdPost',

        // GROUP
        '/users/groups/add': 'groupAddFormPost',
        '/users/groups/edit/:id': 'groupEditFormPost'

    }
}