module.exports = {
    name: 'Опросные листы',
    icon: 'fal fa-layer-group',
    list: [
        {
            name: 'Просмотр списка опросных листов',
            title: 'Опросные листы',
            link: '/ol',
            access: 'ol:viewLists'
        },
        {
            name: 'Конструктор шаблонов опросных листов',
            title: 'Шаблоны опросных листов',
            link: '/ol/templates',
            access: 'ol:viewTemplates'
        },
    ]
}