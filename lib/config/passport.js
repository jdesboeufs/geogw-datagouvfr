/*
** Module dependencies
*/
var OAuth2Strategy = require('passport-oauth2').Strategy;
var request = require('superagent');
var passport = require('passport');
var mongoose = require('mongoose');
// var User = mongoose.model('User');

/*
** data.gouv.fr Strategy
*/
passport.use('data.gouv.fr', new OAuth2Strategy({
    authorizationURL: process.env.DATAGOUV_URL + '/oauth/authorize',
    tokenURL: process.env.DATAGOUV_URL + '/oauth/token',
    clientID: process.env.DATAGOUV_CLIENT_ID,
    clientSecret: process.env.DATAGOUV_CLIENT_SECRET,
    callbackURL: process.env.DATAGOUV_CB_URL
}, function(accessToken, refreshToken, profile, done) {
    request.get(process.env.DATAGOUV_URL + '/api/1/me')
        .set('authorization', 'Bearer ' + accessToken)
        .end(function(err, resp) {
            if (err) return done(err);
            if (resp.error) return done(new Error('DataGouv identity retrieving failed!'));
            if (!resp.body || !resp.body.slug) return done(new Error('DataGouv has returned unattended content!'));
            done(null, resp.body);
        });
}));

/*
** Session
*/
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});
