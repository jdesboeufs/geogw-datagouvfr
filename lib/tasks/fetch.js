var mongoose = require('mongoose');
var async = require('async');
var debug = require('debug')('dgv:fetch');

var q = require('../config/kue');
var geogw = require('../geogw');

var Organization = mongoose.model('Organization');
var Producer = mongoose.model('Producer');

module.exports = function (job, jobDone) {
    var organizationId = job.data.organizationId;

    var organization, producers;

    function fetchOrganization(done) {
        Organization.findById(organizationId, function (err, organizationFound) {
            if (err) return done(err);
            if (!organizationFound) return done(new Error('Organization not found'));
            organization = organizationFound;
            done();
        });
    }

    function fetchProducers(done) {
        Producer.find({ associatedTo: organizationId }).exec(function (err, producersFound) {
            if (err) return done(err);
            if (producersFound.length === 0) debug('No associated producers');
            producers = producersFound;
            done();
        });
    }

    function fetchAndProcessDatasets(done) {
        var datasetsProcessed = {};

        function fetchAndProcessByProducer(producer, producerDone) {
            var query = {
                limit: 100,
                opendata: 'yes',
                availability: 'true',
                organization: producer._id
            };

            geogw.fetchRecordsFromCatalog(organization.sourceCatalog, query, function (err, resp) {
                if (err) return producerDone(err);
                debug('%d datasets found for producer `%s`', resp.count, producer._id);

                async.eachLimit(resp.results, 20, function (dataset, datasetDone) {
                    if (dataset._id in datasetsProcessed) {
                        debug('Dataset %s already processed', dataset._id);
                        datasetDone();
                    } else {
                        datasetsProcessed[dataset._id] = true;
                        q.create('dgv:publish', { datasetId: dataset._id, organizationId: organizationId })
                            .attempts(5)
                            .removeOnComplete(true)
                            .save(function () {
                                debug('Dataset %s added to queue', dataset._id);
                                datasetDone();
                            });
                    }
                }, producerDone);
            });
        }

        async.eachLimit(producers, 5, fetchAndProcessByProducer, done);
    }

    async.series([fetchOrganization, fetchProducers, fetchAndProcessDatasets], jobDone);

};
