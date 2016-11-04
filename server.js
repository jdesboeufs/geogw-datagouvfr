const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer({});
const port = process.env.PORT || 3000;
const geogwRootUrl = process.env.GEOGW_ROOT_URL || 'http://localhost:5000';

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', true);
}

app.use(express.static(__dirname + '/app'));


app.use('/api', function (req, res) {
    proxy.web(req, res, { changeOrigin: true, target: geogwRootUrl + '/api' });
});

app.use('/dgv', function (req, res) {
    proxy.web(req, res, { changeOrigin: true, target: geogwRootUrl + '/dgv' });
});

function buildRedirect(req) {
    return 'redirect=' + encodeURIComponent(req.headers.referer);
}

app.get('/login', function (req, res) {
    res.redirect(geogwRootUrl + '/dgv/login?' + buildRedirect(req));
});

app.get('/logout', function (req, res) {
    res.redirect(geogwRootUrl + '/dgv/logout?' + buildRedirect(req));
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/app/views/layout.html');
});

app.listen(port, function () {
    console.log('Now listing on port %d', port);
});
