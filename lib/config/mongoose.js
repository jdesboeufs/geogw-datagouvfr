/*
** Module dependencies
*/
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');

// recursively walk modules path and callback for each file
function walk(modulesPath, excludeDir, callback) {
    fs.readdirSync(modulesPath).forEach(function(file) {
        var newPath = path.join(modulesPath, file);
        var stat = fs.statSync(newPath);
        if (stat.isFile() && /(.*)\.(js|coffee)$/.test(file)) {
            callback(newPath);
        } else if (stat.isDirectory() && file !== excludeDir) {
            walk(newPath, excludeDir, callback);
        }
    });
}

mongoose.connect(process.env.MONGODB_URL);

walk(path.join(__dirname, '..', '/models'), null, function(path) {
    require(path);
});
