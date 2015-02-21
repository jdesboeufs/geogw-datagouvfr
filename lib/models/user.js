var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OrganizationSchema = new Schema({
    _id: String,
    name: String
});

var UserSchema = new Schema({
    _id: String,
    _created: Date,
    _updated: Date,
    organizations: [OrganizationSchema],


    /* Context */
    first_name: String,
    last_name: String,
    email: String,
    slug: String,

    /* OAuth */
    accessToken: {
        value: String,
        _created: Date,
        _updated: Date
    }
});

mongoose.model('User', UserSchema);
