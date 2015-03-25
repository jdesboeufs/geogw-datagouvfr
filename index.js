var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cookieParser = require('cookie-parser');

// Configure mongoose
require('./lib/config/mongoose');

// Configure passport
require('./lib/config/passport');

// Configure express
var app = express();

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

app.get('/dgv/oauth/callback', passport.authenticate('data.gouv.fr', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
});

/* API */

require('./lib/api')(app);


/* UI */

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/app/views/layout.html');
});

app.get('*', function (req, res) {
    if (!req.user) return res.redirect('/login');
    res.sendFile(__dirname + '/app/views/layout.html');
});

module.exports = app;


