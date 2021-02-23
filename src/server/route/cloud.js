let express = require('express');
let readdirp = require('readdirp');

let db = require('../db');
let format = require('../tool/format');
let webdav = require('../tool/webdav');

let config = require('../../../config.json');

let router = express.Router();

/**
 * Сканирование папки пользователя
 * @type {string} req.query.username
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

        let fullPath = config.cloud.dir + '/' + user.cloud_username + '/files/' + user.cloud_scan;

        // TODO: отладка под Windows
        if (process.platform === 'win32') fullPath = 'D:/nextcloud/' + req.account.cloud_scan;

        let entries = await readdirp.promise(fullPath);
        let files = entries.map(entry => entry.path.split('\\').join('/'));

        res.send({
            success: true,
            files: files
        });

    } else res.send({
        success: false,
        message: 'Пользователь не найден'
    });

});

/**
 * Перенос в папку синхронизации
 * @type {string} req.body.username
 * @type {string} req.body.file
 * @type {string} req.body.id - Идентификатор фотографии в галерее
 */
router.post('/cloud', async (req, res) => {

    let user = req.body.username === req.account.username ? req.account : (
        await db.gallery.query(
            'SELECT * FROM "user" WHERE username = $1;',
            [
                req.body.username
            ]
        )
    ).rows[0];

    if (user) {

        let sql = 'SELECT id, date_create FROM photo WHERE id = $1;';

        db.gallery.query(sql, [
            req.body.id
        ]).then(result => {

            let photo = result.rows[0];

            if (photo) {

                let dateCreate = photo.date_create;

                let year = dateCreate.getFullYear();
                let month = format.number2String(dateCreate.getMonth() + 1, 2);
                let date = format.number2String(dateCreate.getDate(), 2);
                let hours = format.number2String(dateCreate.getHours(), 2);
                let minutes = format.number2String(dateCreate.getMinutes(), 2);
                let seconds = format.number2String(dateCreate.getSeconds(), 2);

                let fileName = year + '-' + month + '-' + date + ' ' + hours + '-' + minutes + '-' + seconds + ' ' + photo.id + '.jpg';

                webdav.move({
                    webdav: config.cloud.webdav,
                    username: user.cloud_username,
                    password: user.cloud_password,
                    from: user.cloud_scan + '/' + req.body.file,
                    to: user.cloud_sync + '/' + year + '/' + month + '/' + fileName
                }).then(result => {

                    if (result.error) {
                        console.log(result.error);
                        delete result.error;
                    }

                    res.send(result);

                }).catch(error => {

                    console.log(error);

                    res.send({
                        success: false,
                        message: 'Перенос не выполнен'
                    });

                });

            } else res.send({
                success: false,
                message: 'Фотография не найдена'
            });

        }).catch(error => {

            console.log(error);

            res.send({
                success: false,
                message: 'Не удалось выполнить запрос поиска фотографии'
            });

        });

    } else res.send({
        success: false,
        message: 'Пользователь не найден'
    });

});

module.exports = router;