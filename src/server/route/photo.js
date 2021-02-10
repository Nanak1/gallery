let express = require('express');
let db = require('../db');

let router = express.Router();

/**
 * @type {number} req.query.count
 * @type {number} req.query.page
 */
router.get('/photo', (req, res) => {

    let limit = parseInt(req.query.count);
    let offset = limit * (parseInt(req.query.page) - 1);
    let columns = req.user.censored ? 'id' : 'id, censored';
    let sql = `SELECT ${columns} FROM photo ORDER BY date_create DESC LIMIT $1 OFFSET $2;`;

    db.gallery.query(sql, [
        limit,
        offset
    ]).then(result => {

        res.send({
            success: true,
            photos: result.rows
        });

    });

});

/**
 * @type {string} req.params.id
 */
router.get('/photo/thumbnail/:id', (req, res) => {

    let sql = `SELECT thumbnail FROM photo WHERE id = $1;`;

    db.gallery.query(sql, [
        req.params.id
    ]).then(result => {

        if (result.rows.length === 1) {

            res.contentType('image/jpeg');
            res.send(result.rows[0].thumbnail);

        } else res.send({
            success: false,
            message: 'Фотография не найдена'
        });

    });

});

/**
 * @type {string} req.params.part
 */
router.get('/photo/date_create/:part', (req, res) => {

    if ([
        'year',
        'month',
        'day'
    ].includes(req.params.part)) {

        let where = req.user.censored ? 'WHERE censor IS FALSE' : '';
        let sql = `SELECT DISTINCT date_part($1, date_create) AS p FROM photo ${where} ORDER BY p;`;

        db.gallery.query(sql, [
            req.params.part
        ]).then(result => {

            let data = {success: true};

            data[req.params.part + 's'] = result.rows.map(row => row.p);
            res.send(data);

        });

    } else res.send({
        success: false,
        message: 'Не корректный запрос: ' + req.params.part
    });

});

router.get('/photo/year', (req, res) => {

    let where = req.user.censored ? 'WHERE censor IS FALSE' : '';

    let sql = `SELECT DISTINCT date_part('year', date_create) AS year FROM photo ${where} ORDER BY year;`;

    db.gallery.query(sql).then(result => {

        res.send({
            success: true,
            years: result.rows.map(row => row.year)
        });

    });

});

router.get('/photo/month', (req, res) => {

    let where = req.user.censored ? 'WHERE censor IS FALSE' : '';

    let sql = `SELECT DISTINCT date_part('month', date_create) AS month FROM photo ${where} ORDER BY month;`;

    db.gallery.query(sql).then(result => {

        res.send({
            success: true,
            months: result.rows.map(row => row.month)
        });

    });

});

router.get('/photo/day', (req, res) => {

    let where = req.user.censored ? 'WHERE censor IS FALSE' : '';

    let sql = `SELECT DISTINCT date_part('day', date_create) AS day FROM photo ${where} ORDER BY day;`;

    db.gallery.query(sql).then(result => {

        res.send({
            success: true,
            days: result.rows.map(row => row.day)
        });

    });

});

module.exports = router;