let express = require('express');
let db = require('../db');
let config = require('../../../config.json');

let router = express.Router();

/**
 * Вход
 * @type {string} req.body.username - имя пользователя
 * @type {string} req.body.password - пароль
 */
router.post('/account/login', (req, res) => {

    let sql = `SELECT * FROM "user" WHERE username = $1 AND password = encode(digest($2, 'sha512'), 'hex');`;

    db.gallery.query(sql, [
        req.body.username,
        req.body.password
    ]).then(result => {

        if (result.rows.length === 1) {

            let user = result.rows[0];
            let sql = `INSERT INTO session ("user", key) VALUES ($1, encode(digest($2, 'sha512'), 'hex')) RETURNING key;`;

            db.gallery.query(sql, [
                user.id,
                Date.now().toString()
            ]).then(result => {

                let session = result.rows[0];
                let maxAge = config.session.maxAge;

                if (typeof maxAge === 'string') maxAge = eval(maxAge);

                res.cookie(config.session.key, session.key, {
                    httpOnly: true,
                    maxAge: maxAge
                });

                res.send({
                    success: true,
                    message: 'Успешное создании сессии'
                });

            });

        } else res.send({
            success: false,
            message: 'Пользователь не найден'
        });

    }).catch(error => {

        console.log(error);

        res.send({
            success: false,
            message: 'Что-то пошло не так при авторизации'
        });

    });

});

/**
 * Проверка доступа
 * @type {string} req.cookies[config.session.key] - ключ сессии
 */
router.use((req, res, next) => {

    let key = req.cookies[config.session.key];

    if (typeof key === 'string') {

        let sql = `SELECT * FROM session WHERE key = $1;`;

        db.gallery.query(sql, [
            key
        ]).then(result => {

            if (result.rows.length === 1) {

                req.session = result.rows[0];

                let sql = `SELECT * FROM "user" WHERE id = $1;`;

                db.gallery.query(sql, [
                    req.session.user
                ]).then(result => {

                    req.account = result.rows[0];
                    next();

                }).catch(error => {

                    console.log(error);

                    res.send({
                        success: false,
                        message: 'Что-то пошло не так при запросе пользователя'
                    });

                });

            } else res.send({
                success: false,
                message: 'Сессия не найдена'
            });

        }).catch(error => {

            console.log(error);

            res.send({
                success: false,
                message: 'Что-то пошло не так при проверке сессии'
            });

        });

    } else {

        let message = req._parsedUrl.pathname === '/account/identification' ? 'Сессия не найдена' : 'Доступ запрещён'

        res.send({
            success: false,
            message: message
        });

    }

});

/**
 * Выход
 */
router.get('/account/logout', (req, res) => {

    let sql = `DELETE FROM session WHERE id = $1;`;

    db.gallery.query(sql, [
        req.session.id
    ]).then(() => {

        res.clearCookie(config.session.key);

        res.send({
            success: true,
            message: 'Успешное удаление сессии'
        });

    }).catch(error => {

        console.log(error);

        res.send({
            success: false,
            message: 'Что-то пошло не так при удалении сессии'
        });

    });

});

/**
 * Запрос данных
 */
router.get('/account', async (req, res) => {

    let account = Object.assign({}, req.account);

    delete account.id;
    delete account.password;
    delete account.cloud_username;
    delete account.cloud_password;
    delete account.cloud_scan;
    delete account.cloud_sync;

    res.send({
        success: true,
        account: account
    });

});

/**
 * Изменение данных
 * @type {string} req.body.username - имя пользователя
 */
router.post('/account', async (req, res) => {

    if (req.body.username) {

        let f = () => {

            let sql = `UPDATE "user" SET username = $2 WHERE id = $1;`;

            db.gallery.query(sql, [
                req.account.id,
                req.body.username
            ]).then(result => {

                res.send({
                    success: true,
                    message: 'Пользователь успешно изменён'
                });

            }).catch(error => {

                console.log(error);

                res.send({
                    success: false,
                    message: 'Что-то пошло не так при изменении пользователя'
                })

            });

        };

        if (req.account.username !== req.body.username) {

            let sql = `SELECT * FROM "user" WHERE username = $1;`;

            db.gallery.query(sql, [
                req.body.username
            ]).then(result => {

                if (result.rows[0]) res.send({
                    success: false,
                    message: 'Имя пользователя уже занято'
                });
                else f();

            }).catch(error => {

                console.log(error);

                res.send({
                    success: false,
                    message: 'Что-то пошло не так при проверке имени пользователя'
                })

            });

        } else f();

    } else res.send({
        success: false,
        message: 'Имя пользователя не может быть пустым'
    });

});

/**
 * Изменение пароля
 * @type {string} req.body.password - старый пароль
 * @type {string} req.body.password1 - новый пароль
 * @type {string} req.body.password2 - новый пароль ещё раз
 */
router.post('/account/password', (req, res) => {

    if (req.body.password1 === req.body.password2) {

        let sql = `SELECT * FROM "user" WHERE id = $1 AND password = encode(digest($2, 'sha512'), 'hex');`;

        db.gallery.query(sql, [
            req.account.id,
            req.body.password
        ]).then(result => {

            if (result.rows.length === 1) {

                let sql = `UPDATE "user" SET password = encode(digest($2, 'sha512'), 'hex') WHERE id = $1;`;

                db.gallery.query(sql, [
                    req.account.id,
                    req.body.password1
                ]).then(() => {

                    res.send({
                        success: true,
                        message: 'Успешная смена пароля'
                    });

                }).catch(error => {

                    console.log(error);

                    res.send({
                        success: false,
                        message: 'Что-то пошло не так при смене пароля'
                    });

                });

            } else res.send({
                success: false,
                message: 'Не верный пароль'
            });

        }).catch(error => {

            console.log(error);
            res.send({
                success: false,
                message: 'Что-то пошло не так при поиске пользователя'
            });

        });

    } else res.send({
        success: false,
        message: 'Пароли не совпадают'
    });

});

/**
 * Запрос сессий
 */
router.get('/account/session', (req, res) => {

    let sql = `SELECT id, CASE WHEN key = $2 THEN TRUE ELSE FALSE END AS current FROM session WHERE "user" = $1;`;

    db.gallery.query(sql, [
        req.account.id,
        req.session.key
    ]).then(result => {

        res.send({
            success: true,
            data: result.rows
        });

    }).catch(error => {

        console.log(error);

        res.send({
            success: false,
            message: 'Что-то пошло не так при запросе сессий пользователя'
        });

    });

});

/**
 * Удаление сессии
 * @type {string} req.body.id - идентификатор сессии
 */
router.delete('/account/session/:id', (req, res) => {

    let sql = `DELETE FROM session WHERE id = $1 AND "user" = $2`;

    db.query('mpe', sql, [
        req.body.id,
        req.account.id
    ]).then(result => {

        res.send({
            success: true,
            message: 'Успешное удаление сессии пользователя'
        });

    }).catch(error => {

        console.log(error);

        res.send({
            success: false,
            message: 'Что-то пошло не так при удалении сессии пользователя'
        });

    });

});

module.exports = router;