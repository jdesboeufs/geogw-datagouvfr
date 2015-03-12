var request = require('superagent');

var rootUrl = process.env.GEOGW_URL + '/api';

exports.getRecord = function (id, done) {
    request
        .get(rootUrl + '/datasets/' + id)
        .end(function (err, resp) {
            if (err) return done(err);
            if (resp.error || !resp.body._id) return done(new Error('geogw: Unexpected result'));
            done(null, resp.body);
        });
};

exports.fetchRecordsFromCatalog = function (catalogId, query, done) {
    request
        .get(rootUrl + '/services/' + catalogId + '/datasets')
        .query(query)
        .end(function (err, resp) {
            if (err) return done(err);
            if (resp.error) return done(new Error('geogw: Server has responded with error ' + resp.status));
            done(null, resp.body);
        });
};
