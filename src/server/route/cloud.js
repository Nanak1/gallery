let express = require('express');
let readdirp = require('readdirp');
let axios = require('axios');

let db = require('../db');
let cloud = require('../tool/cloud');

let config = require('../../../config.json');

let router = express.Router();

/**
 * Сканирование
 * @type {string} req.body.username - имя пользователя
 */
router.get('/cloud', async (req, res) => {

    let user = req.query.username === req.account.username ? req.account : (
        await db.gallery.query(
            `SELECT * FROM "user" WHERE username = $1;`,
            [
                req.query.username
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

router.all('/cloud', async (req, res, next) => {

    if (req.method === 'MOVE') {

        let user = req.body.username === req.account.username ? req.account : (
            await db.gallery.query(
                `SELECT * FROM "user" WHERE username = $1;`,
                [
                    req.body.username
                ]
            )
        ).rows[0];

        if (user) {

            let from = user.cloud_scan + '/' + req.body.file;
            let to = 'п1/п2/п3/IMG_20210213_101322.jpg';

            cloud.moveFile(user, from, to).then(() => {

                res.send({
                    success: true
                });

            }).catch(() => {

                res.send({
                    success: false
                });

            });

        } else res.send({
            success: false,
            message: 'Пользователь не найден'
        });

    } else next();

});

module.exports = router;