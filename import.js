let fs = require('fs');
let crypto = require('crypto');
let sharp = require('sharp');
let pg = require('pg');

let config = require('./config.json');

let input = 'D:/cloud/input';
let output = 'D:/cloud/output';

let pool = new pg.Pool(config.db.gallery);

let digest = (x, length) => {

    x = x.toString();

    while (x.length < length) x = '0' + x;

    return x;

};
let getDateCreate = fileName => {

    let dateCreate = fs.statSync(input + '/' + fileName).mtime;

    // 00000000_000000.jpg

    if ((/^[0-9]{8}_[0-9]{6}.jpg/i).test(fileName)) {

        dateCreate.setFullYear(parseInt(fileName.substr(0, 4)));
        dateCreate.setMonth(parseInt(fileName.substr(4, 2)) - 1);
        dateCreate.setDate(parseInt(fileName.substr(6, 2)));
        dateCreate.setHours(parseInt(fileName.substr(9, 2)));
        dateCreate.setMinutes(parseInt(fileName.substr(11, 2)));
        dateCreate.setSeconds(parseInt(fileName.substr(13, 2)));
        dateCreate.setMilliseconds(0);

    }

    // 00000000-000000.jpg

    if ((/^[0-9]{8}-[0-9]{6}.jpg/i).test(fileName)) {

        dateCreate.setFullYear(parseInt(fileName.substr(0, 4)));
        dateCreate.setMonth(parseInt(fileName.substr(4, 2)) - 1);
        dateCreate.setDate(parseInt(fileName.substr(6, 2)));
        dateCreate.setHours(parseInt(fileName.substr(9, 2)));
        dateCreate.setMinutes(parseInt(fileName.substr(11, 2)));
        dateCreate.setSeconds(parseInt(fileName.substr(13, 2)));
        dateCreate.setMilliseconds(0);

    }

    // XXX_00000000_000000.jpg

    if ((/^[a-z]{3}_[0-9]{8}_[0-9]{6}.jpg/i).test(fileName)) {

        dateCreate.setFullYear(parseInt(fileName.substr(4, 4)));
        dateCreate.setMonth(parseInt(fileName.substr(8, 2)) - 1);
        dateCreate.setDate(parseInt(fileName.substr(10, 2)));
        dateCreate.setHours(parseInt(fileName.substr(13, 2)));
        dateCreate.setMinutes(parseInt(fileName.substr(15, 2)));
        dateCreate.setSeconds(parseInt(fileName.substr(17, 2)));
        dateCreate.setMilliseconds(0);

    }

    // XXX_00000000_000000_0.jpg

    if ((/^[a-z]{3}_[0-9]{8}_[0-9]{6}_[0-9]{1}.jpg/i).test(fileName)) {

        dateCreate.setFullYear(parseInt(fileName.substr(4, 4)));
        dateCreate.setMonth(parseInt(fileName.substr(8, 2)) - 1);
        dateCreate.setDate(parseInt(fileName.substr(10, 2)));
        dateCreate.setHours(parseInt(fileName.substr(13, 2)));
        dateCreate.setMinutes(parseInt(fileName.substr(15, 2)));
        dateCreate.setSeconds(parseInt(fileName.substr(17, 2)));
        dateCreate.setMilliseconds(0);

    }

    // XXXXX_0000-00-00_00-00-00.jpg

    if ((/^[a-z]{5}_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.jpg/i).test(fileName)) {

        dateCreate.setFullYear(parseInt(fileName.substr(6, 4)));
        dateCreate.setMonth(parseInt(fileName.substr(11, 2)) - 1);
        dateCreate.setDate(parseInt(fileName.substr(14, 2)));
        dateCreate.setHours(parseInt(fileName.substr(17, 2)));
        dateCreate.setMinutes(parseInt(fileName.substr(20, 2)));
        dateCreate.setSeconds(parseInt(fileName.substr(23, 2)));
        dateCreate.setMilliseconds(0);

    }

    return dateCreate;

};

let fileNames = fs.readdirSync(input, {
    encoding: 'utf8',
    withFileTypes: false
});

(async () => {

    // await pool.query('TRUNCATE TABLE photo CASCADE;');

    for (let i = 0; i < fileNames.length; i++) {

        let index = digest(i + 1, fileNames.length.toString().length);
        let fileName = fileNames[i];

        try {

            // date_create

            let dateCreate = getDateCreate(fileName);

            // thumbnail

            let fileData = fs.readFileSync(input + '/' + fileName);

            let thumbnail = await sharp(fileData).resize({
                width: 256,
                height: 256,
                fit: 'cover'
            }).toBuffer();

            // preview

            let preview = await sharp(fileData).resize({
                width: 1024,
                height: 1024,
                fit: 'inside'
            }).toBuffer();

            // hash

            let hash = crypto.createHash('sha512');

            hash.update(fileData);

            // insert

            let result = await pool.query('INSERT INTO photo (hash, date_create, censored, thumbnail, preview) VALUES ($1, $2, $3, $4, $5) RETURNING id;', [
                hash.digest('hex'),
                dateCreate,
                false,
                thumbnail,
                preview
            ]);

            // output

            let year = dateCreate.getFullYear();
            let month = digest(dateCreate.getMonth() + 1, 2);
            let day = digest(dateCreate.getDate(), 2);

            let hours = digest(dateCreate.getHours(), 2);
            let minutes = digest(dateCreate.getMinutes(), 2);
            let seconds = digest(dateCreate.getSeconds(), 2);

            if (!fs.existsSync(output + '/' + year)) fs.mkdirSync(output + '/' + year);
            if (!fs.existsSync(output + '/' + year + '/' + month)) fs.mkdirSync(output + '/' + year + '/' + month);

            let fileNameNew = year + '-' + month + '-' + day + ' ' + hours + '-' + minutes + '-' + seconds + ' ' + result.rows[0].id + '.jpg';
            let dest = output + '/' + year + '/' + month + '/' + fileNameNew;

            fs.copyFileSync(input + '/' + fileName, dest);
            fs.rmSync(input + '/' + fileName);

            console.log(`[${index}/${fileNames.length}]`, fileName, '>', year + '/' + month + '/' + fileNameNew);

        } catch (error) {

            console.log(`[${index}/${fileNames.length}]`, fileName, error);

        }

    }

})();