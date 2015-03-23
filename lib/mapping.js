var _ = require('lodash');

var bodyTemplate = _.template('<%= metadata.abstract %>');

exports.map = function (sourceDataset) {
    var out = {
        title: sourceDataset.metadata.title,
        description: bodyTemplate(sourceDataset),
        extras: {
            inspire_identifier: sourceDataset.identifier,
            geogw_id: sourceDataset._id
        },
        license: 'fr-lo',
        private: true
    };

    if (sourceDataset.metadata.keywords) {
        out.tags = sourceDataset.metadata.keywords.map(function (keyword) {
            return _.kebabCase(keyword);
        });
    }

    if (sourceDataset.relatedServices) {
        var activeFeatureTypes = _.filter(sourceDataset.relatedServices, { status: 'ok', protocol: 'wfs' });
        if (activeFeatureTypes.length > 0) {
            out.resources = [];
            activeFeatureTypes.forEach(function (featureType) {
                out.resources.push({
                    url: process.env.GEOGW_URL + '/api/datasets/' + sourceDataset._id + '/resources/' + featureType._id + '/json',
                    title: 'Télécharger ' + featureType.name + ' au format GeoJSON (WGS-84)',
                    description: 'Conversion à la volée du jeu de données d\'origine ' + featureType.name + ' au format GeoJSON (WGS-84)',
                    format: 'GeoJSON',
                    type: 'api'
                });
            });
        }
    }

    if (out.title.length === 0) throw new Error('title is a required field');
    if (out.description.length === 0) throw new Error('description is a required field');

    return out;
};