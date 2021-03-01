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
 * @type {string} req.body.id - идентификатор фотографии в галерее
 * @type {string} req.body.file - путь к файлу в папке сканирования пользователя
 */
router.post('/cloud', async (req, res) => {

    if (req.account['access_cloud']) {

        let user;

        if (req.body.username === req.account.username) user = req.account;
        else {

            if (req.account['access_user_cloud']) {

                let sql = 'SELECT * FROM "user" WHERE username = $1;';

                user = await db.gallery.query(sql, [
                    req.body.username
                ]).rows[0];

            }

        }

        if (user) {

            let sql = 'SELECT date_create FROM photo WHERE id = $1;';

            db.gallery.query(sql, [
                req.body.id
            ]).then(result => {

                if (result.rows[0]) {

                    let dateCreate = result.rows[0].date_create;

                    let year = dateCreate.getFullYear();
                    let month = format.number2String(dateCreate.getMonth() + 1, 2);
                    let date = format.number2String(dateCreate.getDate(), 2);
                    let hours = format.number2String(dateCreate.getHours(), 2);
                    let minutes = format.number2String(dateCreate.getMinutes(), 2);
                    let seconds = format.number2String(dateCreate.getSeconds(), 2);

                    let fileName = year + '-' + month + '-' + date + ' ' + hours + '-' + minutes + '-' + seconds + ' ' + req.body.id + '.jpg';

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
            message: 'Отказано в доступе к переносу в папку синхронизации для других пользователей'
        });

    } else res.send({
        success: false,
        message: 'Отказано в доступе к переносу в папку синхронизации'
    });

});

/**
 * Удаление из папки синхронизации
 * @type {string} req.body.id - идентификатор фотографии в галерее
 */
router.delete('/cloud', (req, res) => {

    if (req.account['access_photo_delete']) {

        let sql = 'SELECT date_create FROM photo WHERE id = $1;';

        db.gallery.query(sql, [
            req.body.id
        ]).then(result => {

            if (result.rows[0]) {

                let dateCreate = result.rows[0].date_create;

                let year = dateCreate.getFullYear();
                let month = format.number2String(dateCreate.getMonth() + 1, 2);
                let date = format.number2String(dateCreate.getDate(), 2);
                let hours = format.number2String(dateCreate.getHours(), 2);
                let minutes = format.number2String(dateCreate.getMinutes(), 2);
                let seconds = format.number2String(dateCreate.getSeconds(), 2);

                let fileName = year + '-' + month + '-' + date + ' ' + hours + '-' + minutes + '-' + seconds + ' ' + req.body.id + '.jpg';

                webdav.delete({
                    webdav: config.cloud.webdav,
                    username: req.account.cloud_username,
                    password: req.account.cloud_password,
                    path: req.account.cloud_sync + '/' + year + '/' + month + '/' + fileName
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
                        message: 'Удаление не выполнено'
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
        message: 'Отказано в доступе к удалению фотографии'
    });

});

module.exports = router;