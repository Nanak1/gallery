let pg = require('pg');

let config = require('../../config.json');

module.exports = {
    gallery: new pg.Pool(config.db.gallery)
};