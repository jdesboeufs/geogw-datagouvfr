var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cookieParser = require('cookie-parser');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({ changeOrigin: true });

// Configure mongoose
require('./lib/config/mongoose');

// Configure passport
require('./lib/config/passport');

// Configure express
var app = express();

// Proxy to geogw (TEMP)
app.use('/api/geogw', function (req, res) {
    proxy.web(req, res, { target: process.env.GEOGW_URL + '/api' });
});

/* Assets */

app.use(express.static(__dirname + '/app'));

/* Common middlewares */

app.use(cookieParser());

app.use(session({
    secret: process.env.COOKIE_SECRET,
    name: 'sid',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

app.use(passport.initialize());
app.use(passport.session());

/* Passport */

app.get('/login', passport.authenticate('data.gouv.fr', { scope: 'default' }));

app.get('/dgv/oauth/callback', function (req, res) {
    passport.authenticate('data.gouv.fr', {
        successRedirect: '/account/organizations',
        failureRedirect: '/'
    })(req, res);
});

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});

/* API */

require('./lib/api')(app);


/* UI */

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/app/views/layout.html');
});

module.exports = app;


