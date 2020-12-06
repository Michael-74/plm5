module.exports = {
    'viewSettings': {
        name: 'Просмотр настроек пользователей',
        description: 'Разрешение на просмотр списка пользователей и их ролей',
        list: ['settings','groups']
    },
    'editSettings': {
        name: 'Редактирование настроек пользователей',
        description: 'Разрешение на добавление и редактирование списка пользователей и их ролей',
        list: ['changeUserState','usersAddForm','usersAddPost','usersAddADPost','usersDelete','usersEdit','usersEditPost','usersEditAd', 'usersEditAdPost', 'groupAddForm', 'groupAddFormPost', 'groupDelete','groupEditForm','groupEditFormPost','groupEditPermissions']
    }
}