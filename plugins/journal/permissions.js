module.exports = {
    'view': {
        name: 'Просмотр записей',
        description: 'Разрешение на просмотр записей журнала событий',
        list: ['view', 'json']
    },
    'edit': {
        name: 'Удаление записей',
        description: 'Разрешение на удаление выбранных записей и очистку журнала целиком',
        list: ['delete','clear']
    }
}