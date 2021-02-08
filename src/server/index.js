let http = require('http');

let app = require('./app');
let config = require('../../config.json');

let server = http.createServer(app);

/**
 * Успешный запуск прослушивания порта HTTP сервером
 */
server.on('listening', () => {

    console.log('Успешный запуск HTTP сервера: http://localhost:' + config.http.port);

});

/**
 * Ошибка при запуске прослушивания порта HTTP сервером
 */
server.on('error', error => {

    console.log(error);

    /**
     * Закрытие соединения с БД
     */
    require('./db').gallery.end().then(() => {

        console.log('Успешное отключение от БД: gallery');

    });

});

/**
 * Запуск прослушивания порта HTTP сервером
 */
server.listen(config.http.port);