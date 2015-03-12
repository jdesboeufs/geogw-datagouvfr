var kue = require('kue');

module.exports = kue.createQueue({
    disableSearch: true,
    redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST
    }
});
