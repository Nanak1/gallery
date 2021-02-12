let fs = require('fs');
let crypto = require('crypto');

let readdirp = require('readdirp');
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

let getDateCreate = entry => {

    let dateCreate = entry.stats.mtime;

    // 00000000_000000.jpg

    if ((/^[0-9]{8}_[0-9]{6}.jpg/i).test(entry.basename)) {

        dateCreate.setFullYear(parseInt(entry.basename.substr(0, 4)));
        dateCreate.setMonth(parseInt(entry.basename.substr(4, 2)) - 1);
        dateCreate.setDate(parseInt(entry.basename.substr(6, 2)));
        dateCreate.setHours(parseInt(entry.basename.substr(9, 2)));
        dateCreate.setMinutes(parseInt(entry.basename.substr(11, 2)));
        dateCreate.setSeconds(parseInt(entry.basename.substr(13, 2)));
        dateCreate.setMilliseconds(0);

    }

    // 00000000-000000.jpg

    if ((/^[0-9]{8}-[0-9]{6}.jpg/i).test(entry.basename)) {

        dateCreate.setFullYear(parseInt(entry.basename.substr(0, 4)));
        dateCreate.setMonth(parseInt(entry.basename.substr(4, 2)) - 1);
        dateCreate.setDate(parseInt(entry.basename.substr(6, 2)));
        dateCreate.setHours(parseInt(entry.basename.substr(9, 2)));
        dateCreate.setMinutes(parseInt(entry.basename.substr(11, 2)));
        dateCreate.setSeconds(parseInt(entry.basename.substr(13, 2)));
        dateCreate.setMilliseconds(0);

    }

    // XXX_00000000_000000.jpg

    if ((/^[a-z]{3}_[0-9]{8}_[0-9]{6}.jpg/i).test(entry.basename)) {

        dateCreate.setFullYear(parseInt(entry.basename.substr(4, 4)));
        dateCreate.setMonth(parseInt(entry.basename.substr(8, 2)) - 1);
        dateCreate.setDate(parseInt(entry.basename.substr(10, 2)));
        dateCreate.setHours(parseInt(entry.basename.substr(13, 2)));
        dateCreate.setMinutes(parseInt(entry.basename.substr(15, 2)));
        dateCreate.setSeconds(parseInt(entry.basename.substr(17, 2)));
        dateCreate.setMilliseconds(0);

    }

    // XXX_00000000_000000_0.jpg

    if ((/^[a-z]{3}_[0-9]{8}_[0-9]{6}_[0-9]{1}.jpg/i).test(entry.basename)) {

        dateCreate.setFullYear(parseInt(entry.basename.substr(4, 4)));
        dateCreate.setMonth(parseInt(entry.basename.substr(8, 2)) - 1);
        dateCreate.setDate(parseInt(entry.basename.substr(10, 2)));
        dateCreate.setHours(parseInt(entry.basename.substr(13, 2)));
        dateCreate.setMinutes(parseInt(entry.basename.substr(15, 2)));
        dateCreate.setSeconds(parseInt(entry.basename.substr(17, 2)));
        dateCreate.setMilliseconds(0);

    }

    // XXXXX_0000-00-00_00-00-00.jpg

    if ((/^[a-z]{5}_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.jpg/i).test(entry.basename)) {

        dateCreate.setFullYear(parseInt(entry.basename.substr(6, 4)));
        dateCreate.setMonth(parseInt(entry.basename.substr(11, 2)) - 1);
        dateCreate.setDate(parseInt(entry.basename.substr(14, 2)));
        dateCreate.setHours(parseInt(entry.basename.substr(17, 2)));
        dateCreate.setMinutes(parseInt(entry.basename.substr(20, 2)));
        dateCreate.setSeconds(parseInt(entry.basename.substr(23, 2)));
        dateCreate.setMilliseconds(0);

    }

    return dateCreate;

};

readdirp.promise(input, {
    alwaysStat: true
}).then(async entries => {

    // await pool.query('TRUNCATE TABLE photo CASCADE;');

    for (let i = 0; i < entries.length; i++) {

        let entry = entries[i];
        let index = digest(i + 1, entries.length.toString().length);

        try {

            // date_create

            let dateCreate = getDateCreate(entry);

            // thumbnail

            let file = fs.readFileSync(entry.fullPath);

            let thumbnail = await sharp(file).rotate().resize({
                width: 256,
                height: 256,
                fit: 'cover'
            }).toBuffer();

            // preview

            let preview = await sharp(file).rotate().resize({
                width: 1024,
                height: 1024,
                fit: 'inside'
            }).toBuffer();

            // hash

            let hash = crypto.createHash('sha512');

            hash.update(file);

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

            fs.copyFileSync(entry.fullPath, dest);
            fs.rmSync(entry.fullPath);

            console.log(`[${index}/${entries.length}]`, entry.basename, '>', year + '/' + month + '/' + fileNameNew);

        } catch (error) {

            console.log(`[${index}/${entries.length}]`, entry.basename, error);

        }

    }

    console.log(new Date());

});