let fs = require('fs/promises');
let path = require('path');
let express = require('express');
let cookieParser = require('cookie-parser');
let fileUpload = require('express-fileupload');

let config = require('../../config.json');

let app = express();

/**
 * Настройка
 */

let uploadFileSize = config.http.uploadFileSize;

if (typeof uploadFileSize === 'string') uploadFileSize = eval(uploadFileSize);

app.use(express.json({
    limit: config.http.jsonLimit
}));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(fileUpload({
    limits: {
        fileSize: uploadFileSize
    }
}));

/**
 * Статика
 */

app.use('/node_modules', express.static(path.join(__dirname, '../../node_modules')));
app.use('/src/client/image', express.static(path.join(__dirname, '../client/image')));
app.use('/src/client/script', express.static(path.join(__dirname, '../client/script')));
app.use('/src/client/style', express.static(path.join(__dirname, '../client/style')));
app.get('/', (req, res) => {

    fs.readFile(path.join(__dirname, '../client/index.html'), {
        encoding: 'utf8'
    }).then(html => {

        res.set('Content-Type', 'text/html');
        res.send(html);

    }).catch(error => {

        console.log(error);

        res.send({
            success: false,
            message: 'Что-то пошло не так'
        });

    });

});

/**
 * Маршруты
 */

app.use('/', require('./route/account'));
app.use('/', require('./route/cloud'));
app.use('/', require('./route/photo'));
app.use('/', require('./route/user'));

module.exports = app;