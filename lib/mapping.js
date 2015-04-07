var fs = require('fs');
var path = require('path');

var moment = require('moment');
var Handlebars = require('handlebars');
var _ = require('lodash');

moment.locale('fr');

var bodyTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, 'mapping.hbs'), 'utf-8'));

exports.map = function (sourceDataset) {
    sourceDataset.alternateResources = _.filter(sourceDataset.metadata.onlineResources || [], 'name');
    sourceDataset.inlineOrganizations = (sourceDataset.organizations || []).join(', ');

    sourceDataset.history = _(sourceDataset.metadata.history || [])
        .filter(function (ev) {
            return ev.date && moment(ev.date).isValid() && ev.type && _.includes(['creation', 'revision', 'publication'], ev.type);
        })
        .map(function (ev) {
            var labels = {
                creation: 'Création',
                revision: 'Mise à jour',
                publication: 'Publication'
            };
            return { date: moment(ev.date).format('L'), description: labels[ev.type] };
        })
        .value();

    var out = {
        title: sourceDataset.metadata.title,
        description: bodyTemplate(sourceDataset),
        extras: {
            inspire_identifier: sourceDataset.identifier,
            geogw_id: sourceDataset._id
        },
        license: 'fr-lo',
        supplier: {}
    };

    if (sourceDataset.metadata.keywords) {
        out.tags = sourceDataset.metadata.keywords.map(function (keyword) {
            return _.kebabCase(keyword).substring(0, 120);
        });
    }

    if (sourceDataset.relatedServices) {
        var activeFeatureTypes = _.filter(sourceDataset.relatedServices, { status: 'ok', protocol: 'wfs' });
        if (activeFeatureTypes.length > 0) {
            out.resources = [];
            activeFeatureTypes.forEach(function (featureType) {
                var rootUrl = process.env.GEOGW_URL + '/api/datasets/' + sourceDataset._id + '/resources/' + featureType._id + '/download';
                out.resources.push({
                    url: rootUrl + '?format=GeoJSON&projection=WGS84',
                    title: featureType.name + ' (GeoJSON / WGS-84)',
                    description: 'Conversion à la volée du jeu de données d\'origine ' + featureType.name + ' au format GeoJSON (WGS-84)',
                    format: 'JSON',
                    type: 'api'
                });
                out.resources.push({
                    url: rootUrl + '?format=KML&projection=WGS84',
                    title: featureType.name + ' (KML / WGS-84)',
                    description: 'Conversion à la volée du jeu de données d\'origine ' + featureType.name + ' au format KML (WGS-84)',
                    format: 'KML',
                    type: 'api'
                });
                out.resources.push({
                    url: rootUrl + '?format=SHP&projection=Lambert93',
                    title: featureType.name + ' (Shapefile / Lambert-93)',
                    description: 'Conversion à la volée du jeu de données d\'origine ' + featureType.name + ' au format Shapefile (Lambert-93)',
                    format: 'SHP',
                    type: 'api'
                });
            });
        }
    }

    if (out.title.length === 0) throw new Error('title is a required field');
    if (out.description.length === 0) throw new Error('description is a required field');

    return out;
};
