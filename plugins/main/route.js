module.exports = {
    get: {
        '/': 'main',
        '/main/menu': 'showMenu'
    },
    use: ['defineTemplate']
}