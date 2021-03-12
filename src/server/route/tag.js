let express = require('express');

let db = require('../db');

let router = express.Router();

/**
 * Выборка тегов с количеством использований
 * и настройками сортировки
 * @type {string} req.query.sort_column
 * @type {string} req.query.sort_direction_name
 * @type {string} req.query.sort_direction_count
 */
router.get('/tag', (req, res) => {

    let sort_column = [
        'name',
        'count'
    ].includes(req.query.sort_column) ? req.query.sort_column : 'count';

    let sort_direction_name = [
        'ASC',
        'DESC'
    ].includes(req.query.sort_direction_name) ? req.query.sort_direction_name : 'ASC';

    let sort_direction_count = [
        'ASC',
        'DESC'
    ].includes(req.query.sort_direction_count) ? req.query.sort_direction_count : 'DESC';

    let order = [
        'name ' + sort_direction_name,
        'count ' + sort_direction_count
    ];

    if (sort_column === 'count') order.reverse();

    let sql = '' +
        'SELECT tag.id, tag.name, count(label.id) AS count ' +
        'FROM tag LEFT JOIN label ' +
        'ON tag.id = label.tag ' +
        'GROUP BY tag.id, tag.name ' +
        'ORDER BY ' + order.join(', ') + ';';

    db.gallery.query(sql).then(result => {

        res.send({
            success: true,
            tags: result.rows.map(tag => {

                tag.count = parseInt(tag.count);

                return tag;

            })
        });

    });

});

/**
 * Добавление
 * @type {string} req.body.name
 */
router.post('/tag', (req, res) => {

    if (req.account['access_tag_add']) {

        if (req.body.name) {

            let sql = 'INSERT INTO tag (name) VALUES ($1) RETURNING id;';

            db.gallery.query(sql, [
                req.body.name
            ]).then(result => {

                res.send({
                    success: true,
                    id: result.rows[0].id
                });

            }).catch(error => {

                console.log(error);

                res.send({
                    success: false,
                    message: error.code === '23505' ? 'Название тега уже используется' : 'Что-то пошло не так'
                });

            });

        } else res.send({
            success: false,
            message: 'Название не может быть пустым'
        });

    } else res.send({
        success: false,
        message: 'Отказано в доступе на добавление тега'
    });

});

/**
 * Изменение
 * @type {string} req.body.id
 * @type {string} req.body.name
 */
router.put('/tag', (req, res) => {

    if (req.account['access_tag_edit']) {

        if (req.body.id && req.body.name) {

            let sql = 'UPDATE tag SET name = $1 WHERE id = $2;';

            db.gallery.query(sql, [
                req.body.name,
                req.body.id
            ]).then(result => {

                res.send({
                    success: true
                });

            }).catch(error => {

                console.log(error);

                res.send({
                    success: false,
                    message: error.code === '23505' ? 'Название тега уже используется' : 'Что-то пошло не так'
                });

            });

        } else res.send({
            success: false,
            message: 'Название не может быть пустым'
        });

    } else res.send({
        success: false,
        message: 'Отказано в доступе на изменение тега'
    });

});

/**
 * Удаление
 * @type {string} req.body.id
 */
router.delete('/tag', (req, res) => {

    if (req.account['access_tag_delete']) {

        if (req.body.id) {

            let sql = 'DELETE FROM tag WHERE id = $1;';

            db.gallery.query(sql, [
                req.body.id
            ]).then(result => {

                res.send({
                    success: true
                });

            });

        } else res.send({
            success: false,
            message: 'Не указан идентификатор удаляемого тега'
        });

    } else res.send({
        success: false,
        message: 'Отказано в доступе на удаление тега'
    });

});

module.exports = router;