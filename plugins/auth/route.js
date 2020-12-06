module.exports = {
    get: {
        '/auth': 'login',
        '/auth/register': 'register',
        '/auth/logout': 'logout'
    },
    post: {
        '/auth': 'loginPost',
        '/auth/register': 'registerPost'
    },
    use: ['redirectUnauth']
}