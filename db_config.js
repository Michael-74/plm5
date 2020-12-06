module.exports = {
    "database": "plm4_tmp",
    "username": "username",
    "password": "password",
    "opt": {
        "host": "192.168.2.197",
        "port": 1433,
        "dialect": "mssql",  // 'mssql', 'mysql', 'sqlite', 'postgres', 'mariadb'
        "dialectOptions": {
            "options": {
                "instanceName": "SQL17"
            }
            // "useUTC": false
        },
        "pool": {
            "max": 5,
            "min": 0,
            "idle": 10000,
            "acquire": 30000
        },
        // "logging": console.log
        "logging": false
    },
    "pagination_limit": 20
}