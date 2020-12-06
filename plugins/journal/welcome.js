module.exports = {
    name: 'Журнал событий',
    icon: 'fal fa-history',
    list: [
        {
            name: 'Просмотр событий',
            title: 'Журнал событий',
            link: '/journal',
            access: 'journal:view'
        },
        {
            name: 'Удаление и очистка событий',
            title: 'Журнал событий',
            link: '/journal',
            access: 'journal:edit'
        }
    ]
}