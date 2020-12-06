module.exports = {
    project_name: 'PLM5.0',
    key: 'testkey',
    dir: {
        base: __dirname+'/',
        lib: 'lib',
        public: 'public',
        views: 'views',
        plugins: 'plugins'
    },
    db_config: 'db_config.js',
    webserver: {
        port: 777,
        addr: '0.0.0.0'
    },
    redis: { // auth && cache
        // host: "127.0.0.1", // Redis host
        family: 4, // 4 (IPv4) or 6 (IPv6)
        // password: "auth",
        port: 6379,
        db: 7
    },
    redis_cache: { // auth && cache
        // host: "127.0.0.1", // Redis host
        family: 4, // 4 (IPv4) or 6 (IPv6)
        // password: "auth",
        port: 6379,
        db: 7
    },
    auth: {                     // Свойства авторизации
        default_group_id: 2,    // Дефолтный ID группы (роли)
        login_attempts: 5,      // Кол-во попыток входа
        blocked_time: 30,       // Время блокировки в минутах
        session_salt: '78092o989uJH&^GHH98765%%Yhnkla',      // Соль для сессии
        user_salt: '098iu(*&^TRDRyfghnj2h89uijmdu92',  // Соль для пользователя
        session_ttl: 86400,   // Длительность сессии в секундах
        cookie_name: 'connect.plm4sid'  // COOKIE SESSION KEY NAME
    },
    ad: {                       // Свойства Active Directory
        url: 'ldap://192.168.2.200',
        baseDN: 'dc=NNNNN,dc=NN',
        username: 'username',
        password: 'password',
        attributes: {
            user: [ 'dn', 'userPrincipalName', 'sAMAccountName', 'mail', 'lockoutTime', 'whenCreated', 'pwdLastSet', 'userAccountControl', 'givenName', 'initials', 'cn', 'displayName', 'comment', 'telephoneNumber', 'otherTelephone' ]
        },
        ad_domain: 'NNNNN',
        refresh_interval: 12*60*60*1000 // 12H
        
    }
}