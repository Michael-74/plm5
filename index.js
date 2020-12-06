const fs = require('fs')
const EventEmitter = require('events').EventEmitter

new class {
    options = require(__dirname+'/options')
    plugins = {}
    errors_list = require(this.options.dir.base+this.options.dir.lib+'/errors')
    express = require('express')
    static = this.express.static
    app = this.express()
    events = new EventEmitter()

    constructor() {
        this.init_webserver(this.options.webserver, () => {
            require(this.options.dir.base+this.options.dir.lib+'/express')(this, (cb) => {
                this.check_installed(() => cb());
            });
        });
    }

    /** Проверка на устнановленность
     * 
     * @cb Статус установки 
     */
    check_installed(cb) {
        if (fs.existsSync(this.options.dir.base+this.options.db_config) === true) {
            this.db = new (require(this.options.dir.base+this.options.dir.lib+'/db'))(require(this.options.dir.base+this.options.db_config), this.options, this.events);
            this.db.check_credential()
                .then(() => {
                    this.db.check_db_installed()
                        .then(status => {
                            if (status === false) {
                                this.db.syncdb(result => {
                                    if (result === false) {
                                        this._d(this._errors(3));
                                        cb(false);
                                    } else {
                                        this._d(this._errors(4));
                                        cb(true);
                                    }
                                });
                            } else {
                                cb(true);
                            }
                        })
                })
                .catch(errors => {
                    this._d(this._errors(errors));
                    cb(false);
                    // process.exit()
                })
        } else {
            // Нет файла конфигурации БД
            this._d(this._errors(1));
            cb(false);
        }
    }

    /** Инициализация веб-вервера
     * 
     * @param {object} options Параметры веб-сервера
     * @param {function} cb Колбэк 
     */
    init_webserver(options, cb) {
        this.app.listen(options.port, options.addr, () => {    
            this._d(`Веб-сервер запущен! Адрес: http://${options.addr}:${options.port}/`);
            cb();
        });
    }

    /** Вывод ошибок из списка по номеру
     * 
     * @param {(number|Array)} obj Номер ошибки или массив с номерами ошибок
     * @returns Описание ошибки
     */
    _errors(obj) {
        if (typeof obj === 'number') {
            return (typeof this.errors_list[parseInt(obj)] != 'undefined'?this.errors_list[parseInt(obj)]:this.errors_list[0]);
        } else if (typeof obj === 'object') {
            let errors = [];
            for (let i in obj) {
                errors.push((typeof this.errors_list[parseInt(obj[i])] != 'undefined'?this.errors_list[parseInt(obj[i])]:this.errors_list[0]));
            }
            return errors;
        }
    }
    
    /** Вывод дебага
     * 
     * @param {object} msg Объект для вывода
     */
    _d(msg) {
        if (process.argv.includes('--debug') === true) console.dir(msg, {showHidden:false, depth:5, colors:true});
    }
}