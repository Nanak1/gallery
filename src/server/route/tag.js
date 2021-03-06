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

module.exports = router;