var q = require('./config/kue');

require('./config/mongoose');

q.process('dgv:publish', 5, require('./tasks/publish'));
q.process('dgv:fetch', 1, require('./tasks/fetch'));

require('kue').app.listen(process.env.PORT || 3000);
