const   passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        moment = require('moment');

module.exports = class {

    constructor(that, Helper, route, permissions, menu, welcome, JornalHelper) {
        that._d('- plugin "auth" loaded');
        this.name = 'Авторизация';
        this._d = (msg) => that._d(msg);
        this.events = that.events;
        this.plugins = that.plugins;
        this.options = that.options;
        this.app = that.app;
        this.db = that.db;
        this.helper = new Helper(that.db);
        this.jornal_helper = new JornalHelper(this.helper);
        this.route = route;
        this.route_list = [];
        for (let i in this.route) {
            for (let j in this.route[i]) {
                if (this.route_list.includes(j) == false && j != 0) {
                    this.route_list.push(j);
                }
            }
        }
        this.permissions = permissions;
        this.menu = menu;
        this.initPassport();
        this.welcome = welcome;
    }

    /** Local passport auth startegy */
    initPassport() {
        this._d('-- passport initialized');
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        }, (req, username, password, done) => {
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            let time = moment().subtract(this.options.auth.blocked_time, 'm').format('YYYY-MM-DD HH:mm:ss');
            this.helper.checkLoginAttempts(username, ip, this.options.auth.login_attempts, time, (blocked) => {
                if (blocked === true) {
                    this.events.emit('log', {
                        uid: 0,
                        plugin: 'auth',
                        action: 'blocked',
                        data: {
                            username: username,
                            ip: ip
                        }
                    });
                    return done(null, false);
                } else {
                    let at_split = username.split('@');
                    if (at_split.length === 1 || (at_split.length === 2 && at_split[1] === this.options.ad.ad_domain)) {
                        let user_email = (at_split.length === 1 ? username+'@'+this.options.ad.ad_domain : username);
                        this.helper.checkUserADLogin(user_email, password, this.options.ad, (data) => {
                            if (data === false) {
                                this.helper.insertLoginAttempts(username, ip);
                                this.events.emit('log', {
                                    uid: data.id,
                                    plugin: 'auth',
                                    action: 'login_attepmt',
                                    data: {
                                        username: username,
                                        ip: ip
                                    }
                                });
                                return done(null, false);
                            } else {
                                this.events.emit('log', {
                                    uid: data.id,
                                    plugin: 'auth',
                                    action: 'login',
                                    data: {
                                        type: 'ad'
                                    }
                                });
                                return done(null, data);
                            }
                        });
                    } else {
                        this.helper.checkUserLogin(username, password, this.options.auth.user_salt, (data) => {
                            if (data === false) {
                                this.helper.insertLoginAttempts(username, ip);
                                this.events.emit('log', {
                                    uid: 0,
                                    plugin: 'auth',
                                    action: 'login_attepmt',
                                    data: {
                                        username: username,
                                        ip: ip
                                    }
                                });
                                return done(null, false);
                            } else {
                                this.events.emit('log', {
                                    uid: data.id,
                                    plugin: 'auth',
                                    action: 'login',
                                    data: {
                                        type: 'local'
                                    }
                                });
                                return done(null, data);
                            }
                        });
                    }
                }
            });
        }));
        passport.serializeUser(function (user, done) {
            done(null, JSON.stringify(user));
        });
        passport.deserializeUser(function (data, done) {
            let user = JSON.parse(data);
            try {
                done(null, user);
            } catch (e) {
                done(err)
            }
        });
    }

    /** Авторизация */
    async login(req, res, next) {
        let can_register = await this.db.getKeyValue('param_state_1');
        res.render('../plugins/auth/views/index', {
            layout: 'login', 
            title: 'Авторизация',
            data: { 
                repath: (typeof req.query.repath != 'undefined' ? req.query.repath : ''),
                en_repath: (typeof req.query.repath != 'undefined' ? encodeURIComponent(req.query.repath) : ''),
                error: (typeof req.query.error != 'undefined' ? true : false)
            },
            can_register: (can_register == 'true' ? true : false)
        });
    }

    /** Обработка POST-запроса авторизации */
    loginPost(req, res, next) {
        let repath = (req.body.repath != '' ? req.body.repath : false );
        passport.authenticate('local', (err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/auth?error=true'+(repath === false ? '' : '&repath='+encodeURIComponent(repath)));
            } else {
                req.logIn(user, function(err) {
                    if (err) { 
                        return next(err);
                    }
                    return res.redirect((repath === false ? '/' : decodeURIComponent(repath)));
                });
            }
        })(req, res, next);
    }

    /** Регистрация */
    async register(req, res, next) {
        let can_register = await this.db.getKeyValue('param_state_1');
        if (can_register == 'true') {
            res.render('../plugins/auth/views/index', {
                layout: 'register', 
                title: 'Регистрация',
                data: { 
                    repath: (typeof req.query.repath != 'undefined' ? req.query.repath : ''),
                    en_repath: (typeof req.query.repath != 'undefined' ? encodeURIComponent(req.query.repath) : ''),
                    error: (typeof req.query.error != 'undefined' ? true : false)
                }
            });
        } else {
            res.json({ok: false});
        }
    }

    /** Обработка POST-запроса регистрации */
    async registerPost(req, res, next) {
        let can_register = await this.db.getKeyValue('param_state_1');
        if (can_register == 'true') {
            let repath = (req.body.repath != '' ? req.body.repath : false );
            this.helper.newUser(req.body.email, req.body.username, this.options.auth.default_group_id, req.body.password, this.options.auth.user_salt, (data) => {
                this.events.emit('log', {
                    uid: (data === false ? 0 : data.id),
                    plugin: 'auth',
                    action: 'register',
                    data: {
                        id: (data === false ? 0 : data.id),
                        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                        email: req.body.email,
                        username: req.body.username
                    }
                });
                if (data === false) {
                    res.redirect('/auth/register?error=true'+(repath === false ? '' : '&repath='+encodeURIComponent(repath)));
                } else {
                    res.redirect('/auth'+(repath === false ? '' : '?repath='+encodeURIComponent(repath)));
                }
            });
        } else {
            res.json({ok: false});
        }
    }

    /** Логаут */
    logout(req, res, next) {
        if (typeof req.user != 'undefined') {
            this.events.emit('log', {
                uid: req.user.id,
                plugin: 'auth',
                action: 'logout'
            });
        }
        req.logout();
        res.redirect('/');
    }

    /** Переадрессация */
    redirectUnauth(req, res, next) {
        let eurl = encodeURIComponent(req.url);
        if (req.isAuthenticated() === true || this.route_list.includes(req.path) === true) {
            next();
        } else {
            res.redirect('/auth'+(req.url != '/'?'?repath='+eurl:''));
        }
    }

    /** Проверка прав доступа */
    checkPermissions(data, req, res, next) {
        if (req.isAuthenticated() === true && data.plugin != 'auth') {
            this.checkPermissionsRaw(req.user.id, data.plugin, data.func, (status) => {
                if (status === false) {
                    if (res != false) {
                        this.app.show404(res);
                    }
                } else {
                    next();
                }
            });
        } else {
            next();
        }
    }

    /** Проверка прав доступа RAW */
    checkPermissionsRaw(user_id, plugin, func, callback) {
        this.helper.getAllowedPlugins(user_id, (user_allowed) => {
            this.helper.getUserGroups(user_id, (groups) => {
                let access = false;
                if (groups.includes(1)) {
                    access = true;
                }
                let access_list = {
                    main:['main','showMenu']
                };
                for (let i in user_allowed) {
                    if (typeof access_list[user_allowed[i].plugin] === 'undefined') {
                        access_list[user_allowed[i].plugin] = [];
                    }
                    if (typeof this.plugins[user_allowed[i].plugin] != 'undefined') {
                        if (typeof this.plugins[user_allowed[i].plugin].permissions[user_allowed[i].function] != 'undefined') {
                            access_list[user_allowed[i].plugin] = access_list[user_allowed[i].plugin].concat(this.plugins[user_allowed[i].plugin].permissions[user_allowed[i].function].list);
                        }
                    }
                }
                if (typeof access_list[plugin] != 'undefined') {
                    if (access_list[plugin].includes(func) === true) {
                        access = true;
                    }
                }
                if (access === true) {
                    callback(true);
                } else {
                    callback(false);
                }
            });
        });
    }

    /** Проверка прав доступа RAW Async */
    checkPermissionsRawAsync(user_id, plugin, func) {
        return new Promise((resolve) => {
            this.checkPermissionsRaw(user_id, plugin, func, (response) => {
                resolve(response);
            });
        });
    }

}