let express = require('express');
let db = require('../db');
let config = require('../../../config.json');

let router = express.Router();

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

                    req.user = result.rows[0];
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

router.get('/account/identification', async (req, res) => {

    let user = Object.assign({}, req.user);

    delete user.password;

    res.send({
        success: true,
        user: user
    });

});

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

router.post('/account/password', (req, res) => {

    if (req.body.password1 === req.body.password2) {

        let sql = `SELECT * FROM "user" WHERE id = $1 AND password = encode(digest($2, 'sha512'), 'hex');`;

        db.gallery.query(sql, [
            req.user.id,
            req.body.password
        ]).then(result => {

            if (result.rows.length === 1) {

                let sql = `UPDATE "user" SET password = encode(digest($2, 'sha512'), 'hex') WHERE id = $1;`;

                db.gallery.query(sql, [
                    req.user.id,
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

router.post('/account', async (req, res) => {

    if (req.body.username) {

        let f = () => {

            let sql = `UPDATE "user" SET username = $2, admin = $3, filter = $4 WHERE id = $1;`;

            db.gallery.query(sql, [
                req.body.id,
                req.body.username,
                req.body.admin,
                req.body.filter
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

        if (req.user.username !== req.body.username) {

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

router.get('/account/session', (req, res) => {

    let sql = `SELECT id, CASE WHEN key = $2 THEN TRUE ELSE FALSE END AS current FROM session WHERE "user" = $1;`;

    db.gallery.query(sql, [
        req.user.id,
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

router.delete('/account/session/:id', (req, res) => {

    let sql = `DELETE FROM session WHERE id = $1 AND "user" = $2`;

    db.query('mpe', sql, [
        req.body.id,
        req.user.id
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