var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');

var dgv = require('../dgv');
var geogw = require('../geogw');
var map = require('../mapping').map;

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var DatasetSchema = new Schema({

    _created: { type: Date },
    _updated: { type: Date, required: true }, // For synchronization purpose

    udataId: { type: ObjectId, required: true, unique: true },
    organization: { type: ObjectId, ref: 'Organization', required: true }

    //user: { type: ObjectId, ref: 'User', required: true } // Last user used to synchronize the dataset

});

DatasetSchema.methods = {

    fetchAndConvert: function (done) {
        var datasetRef = this;

        geogw.getRecord(datasetRef._id, function (err, sourceDataset) {
            if (err) return done(err);
            var uDataset;

            try {
                uDataset = map(sourceDataset);
                uDataset.organization = datasetRef.organization;
            } catch (e) {
                return done(e);
            }
            
            done(null, uDataset);
        });
    },

    fetchWorkingAccessToken: function (done) {
        var Organization = mongoose.model('Organization');
        var organization = new Organization({ _id: this.organization });
        organization.fetchWorkingAccessToken(done);
    },

    processSynchronization: function (type, done) {
        var datasetRef = this;

        async.parallel({
            uDataset: _.bind(datasetRef.fetchAndConvert, datasetRef),
            accessToken: _.bind(datasetRef.fetchWorkingAccessToken, datasetRef)
        }, function (err, context) {
            if (err) return done(err);
            if (!context.accessToken) return done(new Error('No working accessToken found'));

            function requestSyncCallback(err, publishedDataset) {
                if (err) return done(err);

                var now = new Date();

                if (type === 'create') {
                    datasetRef
                        .set('_created', now)
                        .set('udataId', publishedDataset.id);
                }

                datasetRef
                    .set('_updated', now)
                    .save(done);
            }

            if (type === 'create') {
                dgv.createDataset(context.uDataset, context.accessToken, requestSyncCallback);
            } else if (type === 'update') {
                dgv.updateDataset(datasetRef.udataId, context.uDataset, context.accessToken, requestSyncCallback);
            } else {
                throw new Exception('Unknown type for processSynchronization');
            }
        });
    },

    synchronize: function (done) {
        this.processSynchronization('update', done);
    },

    publish: function (done) {
        this.processSynchronization('create', done);
    }

};

mongoose.model('Dataset', DatasetSchema);
