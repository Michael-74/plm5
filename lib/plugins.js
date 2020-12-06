// Description: Файл загрузки плагинов
// -----------------------------

// Структура плагинов (/plugins)
// --------------------
// Файлы:
//   route.js - маршрутизация внутри плагина
//   {plugin_name}.js - Controller контроллер плагина
//   helper.js - хэлпер для работы с БД
//   menu.js - пункты для меню
//   permissions.js - настройка групп допуска
// Папки:
//   views - ejs шаблоны

const fs = require('fs');

module.exports = class {

    constructor(that, plugin) {
        this.auth_exclusions = ['auth']; // Плагины, для которых не нужна авторизация
        this.plugin_name = plugin;
        let plugin_folder = that.options.dir.base+that.options.dir.plugins+'/'+this.plugin_name+'/';
        this.file = {};
        this.file.route = plugin_folder+'route.js';
        this.file.helper = plugin_folder+'helper.js';
        this.file.journal_helper = plugin_folder+'journal_helper.js';
        this.file.menu = plugin_folder+'menu.js';
        this.file.welcome = plugin_folder+'welcome.js';
        this.file.permissions = plugin_folder+'permissions.js';
        this.file.controller = plugin_folder+this.plugin_name+'.js';
        if (fs.existsSync(this.file.controller)) {
            let Controller = require(this.file.controller);
            this.controller = new Controller(that, (fs.existsSync(this.file.helper) == true ? require(this.file.helper) : false), (fs.existsSync(this.file.route) == true ? require(this.file.route) : false), (fs.existsSync(this.file.permissions) == true ? require(this.file.permissions) : false), (fs.existsSync(this.file.menu) == true ? require(this.file.menu) : false), (fs.existsSync(this.file.welcome) == true ? require(this.file.welcome) : false), (fs.existsSync(this.file.journal_helper) == true ? require(this.file.journal_helper) : false));
        } else {
            this.controller = false;
        }
        this.init_routes(that);
        return this.controller;
    }

    //обработка маршрутов
    init_routes(that) {
        if (typeof this.controller.route != 'undefined') {
            for (let type in this.controller.route) {
                if (type === 'use') {
                    for (let func in this.controller.route[type]) {
                        that.app[type]((req, res, next) => {
                            this.controller[this.controller.route[type][func]](req, res, next);
                        });
                    }
                }
            }
            for (let type in this.controller.route) {
                if (type !== 'use') {
                    for (let path in this.controller.route[type]) {
                        let funcName = this.controller.route[type][path];
                        that.app[type](path, (req, res, next) => {
                            if (this.auth_exclusions.includes(this.plugin_name) === true) {
                                this.controller[funcName](req, res, next);
                            } else {
                                that.plugins['auth']['checkPermissions']({func: funcName, plugin:this.plugin_name}, req, res, next);
                            }
                        }, (req, res, next) => {
                            this.controller[funcName](req, res, next);
                        });
                    }
                }
            }
        }
    }

}