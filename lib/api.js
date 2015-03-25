var request = require('superagent');
var bodyParser = require('body-parser');
var _ = require('lodash');

var q = require('./config/kue');
var geogw = require('./geogw');

var organizations = require('./controllers/organizations');
var producers = require('./controllers/producers');
var datasets = require('./controllers/datasets');

function ensureLoggedIn(req, res, next) {
    if (!req.user) return res.sendStatus(401);
    next();
}

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

    function ensureUserCanCreateOrganization(req, res, next) {
        var organizations = _.pluck(req.user.toObject().organizations, '_id');
        if (organizations.indexOf(req.body._id) < 0) return res.sendStatus(401);
        next();
    }

    app.param('organizationId', organizations.fetch);

    app.route('/api/organizations/:organizationId')
        .get(organizations.show)
        .put(ensureLoggedIn, ensureUserCanEditOrganization, organizations.update, organizations.show);

    app.route('/api/organizations')
        .get(organizations.list)
        .post(ensureLoggedIn, ensureUserCanCreateOrganization, organizations.create, organizations.show);

    /* Producers */

    app.param('producerId', producers.fetch);

    app.route('/api/producers')
        .get(producers.list);

    /* Associations */

    function ensureUserCanEditOrganization(req, res, next) {
        var organizations = _.pluck(req.user.toObject().organizations, '_id');
        if (organizations.indexOf(req.organization.id) < 0) return res.sendStatus(401);
        next();
    }

    app.route('/api/organizations/:organizationId/producers')
        .post(ensureLoggedIn, ensureUserCanEditOrganization, producers.associate)
        .get(producers.listByOrganization);

    app.route('/api/organizations/:organizationId/producers/:producerId')
        .delete(ensureLoggedIn, ensureUserCanEditOrganization, producers.dissociate);

    app.route('/api/organizations/:organizationId/synchronize')
        .post(ensureLoggedIn, ensureUserCanEditOrganization, function (req, res, next) {
            q.create('dgv:fetch', { organizationId: req.organization._id })
                .save(function (err) {
                    if (err) return next(err);
                    res.send({ code: 200, message: 'Job started' });
                });
        });

    /* Datasets */

    function ensureUserCanUnpublishDataset(req, res, next) {
        var organizations = _.pluck(req.user.toObject().organizations, '_id');
        if (!req.dataset.publication || !req.dataset.publication.organization) return res.sendStatus(500);
        if (organizations.indexOf(req.dataset.publication.organization.toString()) < 0) return res.sendStatus(401);
        next();
    }

    function ensureUserCanPublishDataset(req, res, next) {
        var organizations = _.pluck(req.user.toObject().organizations, '_id');
        // Existing publication
        if (req.dataset.publication && req.dataset.publication._id) {
            if (!req.dataset.publication.organization) return res.sendStatus(500);
            if (organizations.indexOf(req.dataset.publication.organization.toString()) < 0) res.sendStatus(401);
        } else {
            if (req.body.organization && organizations.indexOf(req.body.organization) < 0) return res.sendStatus(401);
        }
        next();
    }

    app.param('datasetId', datasets.fetch);

    app.route('/api/organizations/:organizationId/datasets')
        .get(datasets.list);

    app.route('/api/datasets/:datasetId/publication')
        .all(ensureLoggedIn)
        .put(ensureUserCanPublishDataset, datasets.publish)
        .delete(ensureUserCanUnpublishDataset, datasets.unpublish);

};
