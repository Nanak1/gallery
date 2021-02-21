let express = require('express');

let db = require('../db');

let router = express.Router();

/**
 * @type {number} req.query.count
 * @type {number} req.query.page
 * @type {array} req.query.years - array of numbers
 * @type {array} req.query.months - array of numbers
 * @type {array} req.query.days - array of numbers
 */
router.get('/photo', (req, res) => {

    let limit = parseInt(req.query.count);
    let offset = limit * (parseInt(req.query.page) - 1);
    let sort_column = req.query.sort_column || 'date_create';
    let sort_direction = req.query.sort_direction || 'DESC';

    let filters = [];

    if (req.query.years) {

        let years = [];

        req.query.years.forEach(year => {
            years.push(`date_part('year', date_create) = ` + year);
        });

        filters.push('(' + years.join(' OR ') + ')');

    }

    if (req.query.months) {

        let months = [];

        req.query.months.forEach(month => {
            months.push(`date_part('month', date_create) = ` + month);
        });

        filters.push('(' + months.join(' OR ') + ')');

    }

    if (req.query.days) {

        let days = [];

        req.query.days.forEach(day => {
            days.push(`date_part('day', date_create) = ` + day);
        });

        filters.push('(' + days.join(' OR ') + ')');

    }

    let where = filters.length ? 'WHERE ' + filters.join(' AND ') : '';

    let sql = `SELECT id, date_create, date_import, censored FROM photo ${where} ORDER BY ${sort_column} ${sort_direction} LIMIT $1 OFFSET $2;`;

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
 * @type {string} req.params.id
 */
router.get('/photo/preview/:id', (req, res) => {

    let sql = `SELECT preview FROM photo WHERE id = $1;`;

    db.gallery.query(sql, [
        req.params.id
    ]).then(result => {

        if (result.rows.length === 1) {

            res.contentType('image/jpeg');
            res.send(result.rows[0].preview);

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

        let where = req.account.censored ? 'WHERE censored IS FALSE' : '';
        let sql = `SELECT DISTINCT date_part($1, date_create) AS value, count(*)::int AS count FROM photo ${where} GROUP BY date_part($1, date_create) ORDER BY value;`;

        db.gallery.query(sql, [
            req.params.part
        ]).then(result => {

            res.send({
                success: true,
                [req.params.part + 's']: result.rows
            });

        });

    } else res.send({
        success: false,
        message: 'Не корректный запрос: ' + req.params.part
    });

});

module.exports = router;