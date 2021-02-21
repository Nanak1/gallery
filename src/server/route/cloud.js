let express = require('express');
let readdirp = require('readdirp');

let db = require('../db');

let config = require('../../../config.json');

let router = express.Router();

/**
 * Сканирование
 * @type {string} req.body.username - имя пользователя
 */
router.post('/cloud/scan', async (req, res) => {

    let user = req.body.username === req.account.username ? req.account : (
        await db.gallery.query(
            `SELECT * FROM "user" WHERE username = $1;`,
            [
                req.body.username
            ]
        )
    ).rows[0];

    if (user) {

        let dir = config.cloud.dir + '/' + user.cloud_username + '/files/' + user.cloud_scan;

        // TODO: debug dir
        if (process.platform === 'win32') dir = 'D:/nextcloud/' + req.account.cloud_scan;

        let entries = await readdirp.promise(dir);
        let files = entries.map(entry => entry.path.split('\\').join('/'));

        // TODO: debug files
        if (process.platform === 'win32') files = [files[0]];

        res.send({
            success: true,
            files: files
        });

    } else res.send({
        success: false,
        message: 'Пользователь не найден'
    });

});

router.post('/cloud', (req, res) => {

    res.send({
        success: true
    });

});

module.exports = router;