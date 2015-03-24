var request = require('superagent');
var bodyParser = require('body-parser');

var q = require('./config/kue');
var geogw = require('./geogw');

var organizations = require('./controllers/organizations');
var producers = require('./controllers/producers');
var datasets = require('./controllers/datasets');

module.exports = function (app) {

    app.use(bodyParser.json());

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

    app.get('/api/catalogs/:catalogId/producers', function (req, res, next) {
        var query = {
            limit: 1,
            opendata: 'yes',
            availability: 'true'
        };

        geogw.fetchRecordsFromCatalog(req.params.catalogId, query, function (err, resp) {
            if (err) return next(err);
            res.send(resp.facets.organization || []);
        });
    });

    /* Organizations */

    app.param('organizationId', organizations.fetch);

    app.route('/api/organizations/:organizationId')
        .get(organizations.show)
        .put(organizations.update, organizations.show);

    app.route('/api/organizations')
        .get(organizations.list)
        .post(organizations.create, organizations.show);

    /* Producers */

    app.param('producerId', producers.fetch);

    app.route('/api/producers')
        .get(producers.list);

    /* Associations */

    app.route('/api/organizations/:organizationId/producers')
        .post(producers.associate)
        .get(producers.listByOrganization);

    app.route('/api/organizations/:organizationId/producers/:producerId')
        .delete(producers.dissociate);

    app.route('/api/organizations/:organizationId/synchronize')
        .post(function (req, res, next) {
            q.create('dgv:fetch', { organizationId: req.organization._id })
                .save(function (err) {
                    if (err) return next(err);
                    res.send({ code: 200, message: 'Job started' });
                });
        });

    /* Datasets */

    app.param('datasetId', datasets.fetch);

    app.route('/api/organizations/:organizationId/datasets')
        .get(datasets.list);

    app.route('/api/datasets/:datasetId/publication')
        .put(datasets.publish)
        .delete(datasets.unpublish);

};
