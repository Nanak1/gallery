let db = require('./src/server/db');

/**
 * Подключение к БД
 */
db.gallery.connect().then(client => {

    client.release();
    console.log('Успешное подключение к БД: gallery');

    /**
     * HTTP сервер
     */
    require('./src/server');

});