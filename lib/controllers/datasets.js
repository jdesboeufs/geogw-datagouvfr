var mongoose = require('mongoose');

var Dataset = mongoose.model('Dataset');

exports.list = function (req, res, next) {
    Dataset
        .find({ $or: [
            { 'publication.organization': req.organization._id },
            { matchingFor: req.organization._id }
        ]})
        .exec(function (err, datasetsFound) {
            if (err) return next(err);
            res.send(datasetsFound);
        });
};

exports.fetch = function (req, res, next, id) {
    Dataset.findById(id, function (err, datasetFound) {
        if (err) return next(err);
        if (!datasetFound) return res.sendStatus(404);
        req.dataset = datasetFound;
        next();
    });
};

exports.publish = function (req, res, next) {
    var dataset = req.dataset;

    if (req.body.status) dataset.set('publication.status', req.body.status);
    if (req.body.sourceCatalog) dataset.set('publication.sourceCatalog', req.body.sourceCatalog);

    function onSuccess(err, updatedDataset) {
        if (err) return next(err);
        res.send(updatedDataset.toObject().publication);
    }

    if (dataset.publication._id) {
        dataset.synchronize(onSuccess);
    } else {
        if (!req.body.organization || !req.body.sourceCatalog) return res.sendStatus(400);

        dataset.set('publication.organization', req.body.organization);
        dataset.publish(onSuccess);
    }
};

exports.unpublish = function (req, res, next) {
    req.dataset.unpublish(function (err) {
        if (err) return next(err);
        res.sendStatus(204);
    });
};
