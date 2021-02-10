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
    let columns = req.user.censored ? 'id, date_create' : 'id, date_create, censored';
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

module.exports = router;