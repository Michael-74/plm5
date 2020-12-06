const session = require('express-session'),
    bodyParser = require('body-parser'),
    RedisStore = require('connect-redis')(session),
    fileUpload = require('express-fileupload'),
    cookieParser = require('cookie-parser');

module.exports = (that, callback) => {
    const PluginsClass = require(that.options.dir.base+that.options.dir.lib+'/plugins');
    that.app.set('view engine', 'ejs');
    that.app.set('views', that.options.dir.base+that.options.dir.views);
    that.app.use(that.static(that.options.dir.base+that.options.dir.public));
    that.app.use(session({
        store: new RedisStore(that.options.redis),
        secret: that.options.auth.session_salt,
        resave: true,
        saveUninitialized: true,
        name: that.options.auth.cookie_name
    }));
    that.app.use(cookieParser());
    that.app.use(fileUpload());
    that.app.use(bodyParser.urlencoded({extended: false}));
    that.app.show404 = (res) => {
        res.status(404).render('errors/404');
    };
    callback(() => {
        function loadErrors() {
            that.app.use((req, res) => {
                that.app.show404(res);
            });
            that.app.use((err, req, res) => {
                res.status(500).render('errors/500');
            });
        }
        that.db.getPlugins((plugins) => {
            for (let i in plugins) {
                that.plugins[plugins[i].name] = new PluginsClass(that, plugins[i].name);
            }
            
            loadErrors();
        });
        that.db.onMessage(that)
        
    })
}