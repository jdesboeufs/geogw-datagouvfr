/*
** Module dependencies
*/
var OAuth2Strategy = require('passport-oauth2').Strategy;
var request = require('superagent');
var passport = require('passport');
var mongoose = require('mongoose');
var _ = require('lodash');
var User = mongoose.model('User');

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
        .set('Authorization', 'Bearer ' + accessToken)
        .end(function(err, resp) {
            if (err) return done(err);
            if (resp.error) return done(new Error('DataGouv identity retrieving failed!'));
            if (!resp.body || !resp.body.slug) return done(new Error('DataGouv has returned unattended content!'));

            var fieldsToSet = _.pick(resp.body, 'first_name', 'last_name', 'email', 'slug');

            var now = new Date();
            fieldsToSet._updated = now;

            fieldsToSet.organizations = resp.body.organizations.map(function (organization) {
                return { _id: organization.id, name: organization.name };
            });

            fieldsToSet.accessToken = {
                value: accessToken,
                _created: now,
                _updated: now
            };

            var changes = {
                $set: fieldsToSet,
                $setOnInsert: { _created: now }
            };

            User.findByIdAndUpdate(resp.body.id, changes, { upsert: true, new: true }, done);
        });
}));

/*
** Session
*/
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, done);
});
