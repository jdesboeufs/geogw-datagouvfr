var mongoose = require('mongoose');
var async = require('async');
var debug = require('debug')('dgv:publish');

var Dataset = mongoose.model('Dataset');

module.exports = function (job, jobDone) {
    var datasetId = job.data.datasetId;
    var organizationId = job.data.organizationId;

    var dataset;

    function fetchAssoc(done) {
        Dataset.findById(datasetId, function (err, datasetFound) {
            if (err) return done(err);
            if (datasetFound) dataset = datasetFound;
            done();
        });
    }

    function createOrUpdate(done) {
        if (dataset && dataset.organization.equals(organizationId)) {
            debug('Going to update an existing dataset : %s', dataset.udataId);
            dataset.synchronize(done);
        } else if (dataset) {
            debug('OrganizationId mismatch: ignored');
            done();
        } else {
            debug('Going to create a new dataset');
            dataset = new Dataset({ _id: datasetId, organization: organizationId });
            dataset.publish(done);
        }
    }

    async.series([fetchAssoc, createOrUpdate], jobDone);
};

        
        