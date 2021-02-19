let express = require('express');

let db = require('../db');

let router = express.Router();

router.get('/user', (req, res) => {

    let sql = `SELECT * FROM "user" ORDER BY username;`;

    db.gallery.query(sql).then(result => {

        res.send({
            success: true,
            users: result.rows.map(user => {

                delete user.password;
                delete user.cloud_password;

                return user;

            })
        });

    });

});

module.exports = router;