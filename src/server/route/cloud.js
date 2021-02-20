let express = require('express');
let readdirp = require('readdirp');

let config = require('../../../config.json');

let router = express.Router();

router.get('/cloud', (req, res) => {

    let dir = config.cloud.dir + '/' + req.account.cloud_username + '/files/' + req.account.cloud_scan;

    // TODO: debug
    if (process.platform === 'win32') dir = 'D:/nextcloud/' + req.account.cloud_scan;

    readdirp.promise(dir).then(entries => {

        res.send({
            success: true,
            files: entries.map(entry => entry.path.split('\\').join('/'))
        });

    });

});

module.exports = router;