let express = require('express');
let sharp = require('sharp');
let fs = require('fs/promises');
let crypto = require('crypto');

let db = require('../db');
let format = require('../tool/format');

let config = require('../../../config.json');

let router = express.Router();

/**
 * Выборка фильтрованного списка фотографий по страницам
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
 * Выборка файла миниатюры
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
 * Выборка файла предпросмотра
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
 * Выборка всех найденных частей даты создания
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

/**
 * Добавление фотографии из облака
 * @type {string} req.body.username
 * @type {string} req.body.file
 */
router.post('/photo/cloud', async (req, res) => {

    let user = req.body.username === req.account.username ? req.account : (
        await db.gallery.query(
            `SELECT * FROM "user" WHERE username = $1;`,
            [
                req.body.username
            ]
        )
    ).rows[0];

    if (user) {

        let fullPath = config.cloud.dir + '/' + user.cloud_username + '/files/' + user.cloud_scan + '/' + req.body.file;

        // TODO: отладка под Windows
        if (process.platform === 'win32') fullPath = 'D:/nextcloud/' + user.cloud_scan + '/' + req.body.file;

        let hash = crypto.createHash('sha512');
        let file = await fs.readFile(fullPath);

        hash.update(file);

        let sql = 'INSERT INTO photo (hash, date_create, censored, thumbnail, preview) VALUES ($1, $2, $3, $4, $5) RETURNING id;';

        db.gallery.query(sql, [
            hash.digest('hex'),
            await format.getDateCreate(fullPath),
            false,
            await sharp(file).rotate().resize(config.photo.thumbnail).toBuffer(),
            await sharp(file).rotate().resize(config.photo.preview).toBuffer()
        ]).then(result => {

            res.send({
                success: true,
                id: result.rows[0].id
            });

        }).catch(error => {

            if (error.code === '23505') res.send({
                success: true,
                status: 'HASH_ALREADY_EXIST'
            });
            else {

                console.log(error);

                res.send({
                    success: false,
                    message: 'Что-то пошло не так'
                });

            }

        });

    } else res.send({
        success: false,
        message: 'Пользователь не найден'
    });

});

module.exports = router;