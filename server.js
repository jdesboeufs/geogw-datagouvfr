const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer({});
const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true);
}

app.use(express.static(__dirname + '/app'));


app.use('/api', function (req, res) {
    proxy.web(req, res, { target: process.env.GEOGW_ROOT_URL || 'http://localhost:5000/api' });
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/app/views/layout.html');
});

app.listen(port, function () {
    console.log('Now listing on port %d', port);
});
