module.exports = {
    name: 'СМК',
    icon: 'fal fa-file-alt',
    list: [
        {
            name: 'Управление структурой разделов',
            title: 'Структура СМК',
            link: '/smk',
            access: 'smk:editStructrue'
        },
        {
            name: 'Управление файлами',
            title: 'Файлы СМК',
            link: '/smk/files',
            access: 'smk:editFiles'
        }
    ]
}