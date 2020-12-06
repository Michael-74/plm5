module.exports = {
    name: 'Управление пользователями',
    icon: 'fal fa-user-cog',
    list: [
        {
            name: 'Просмотр списка пользователей',
            title: 'Управление пользователями',
            link: '/users',
            access: 'users:viewSettings'
        },
        {
            name: 'Добавить / Редактировать пользователя',
            title: 'Управление пользователями',
            link: '/users',
            access: 'users:editSettings'
        },
        {
            name: 'Настройка пользовательских ролей',
            title: 'Настройка ролей пользователей',
            link: '/users/groups',
            access: 'users:editSettings'
        }
    ]
}