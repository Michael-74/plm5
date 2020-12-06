module.exports = {
    name: 'Управление модулями',
    icon: 'fal fa-box-full',
    list: [
        {
            name: 'Просмотр списка доступных модулей',
            title: 'Каталог модулей',
            link: '/apps',
            access: 'apps:viewApps'
        },{
            name: 'Обновление и установка модулей из каталога',
            title: 'Каталог модулей',
            link: '/apps',
            access: 'apps:installApps'
        }
    ]
}