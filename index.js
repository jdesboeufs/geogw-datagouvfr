var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var request = require('superagent');
var _ = require('lodash');

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
app.use(bodyParser.json());

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

app.use('/api', function (req, res, next) {
    if (!req.user) return res.sendStatus(401);
    next();
});

app.get('/api/me', function (req, res) {
    res.send(req.user);
});

app.get('/api/catalogs', function (req, res, next) {
    request
        .get(process.env.GEOGW_URL + '/api/catalogs')
        .end(function (err, resp) {
            if (err) return next(err);
            if (resp.error) return next(new Error('Server returned status %d', resp.status));
            res.send(resp.body);
        });
});

app.get('/api/catalogs/:catalogId/facets/:facetName', function (req, res, next) {
    request
        .get(process.env.GEOGW_URL + '/api/services/' + req.params.catalogId + '/datasets')
        .query({
            limit: 1,
            opendata: 'yes',
            availability: 'true'
        })
        .end(function (err, resp) {
            if (err) return next(err);
            if (resp.error) return next(new Error('Server returned status ' + resp.status));
            res.send(resp.body.facets[req.params.facetName] || []);
        });
});

/* UI */

app.get('*', function (req, res) {
    if (!req.user) return res.redirect('/login');
    res.sendFile(__dirname + '/app/views/layout.html');
    console.log(req.user);
});

module.exports = app;


