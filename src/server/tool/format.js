let fs = require('fs/promises');

module.exports = {

    getBaseName: path => {

        let nodes = path.split('/');

        return nodes[path.length - 1];

    },

    /**
     * Получить дату создания, учитывая не только параметр даты, но и название файла
     * @param {string} fullPath
     * @returns {Promise<Date>}
     */
    getDateCreate: function (fullPath) {

        return new Promise((resolve, reject) => {

            fs.stat(fullPath).then(stats => {

                let baseName = this.getBaseName(fullPath);

                let dateCreate = stats.mtime;

                let year = dateCreate.getFullYear();
                let month = dateCreate.getMonth();
                let date = dateCreate.getDate();
                let hours = dateCreate.getHours();
                let minutes = dateCreate.getMinutes();
                let seconds = dateCreate.getSeconds();

                // 00000000_000000.jpg || 00000000-000000.jpg

                if ((/^[0-9]{8}[_|-][0-9]{6}.jpg$/i).test(baseName)) {

                    year = parseInt(baseName.substr(0, 4));
                    month = parseInt(baseName.substr(4, 2)) - 1;
                    date = parseInt(baseName.substr(6, 2));
                    hours = parseInt(baseName.substr(9, 2));
                    minutes = parseInt(baseName.substr(11, 2));
                    seconds = parseInt(baseName.substr(13, 2));

                }

                // XXX_00000000_000000.jpg || XXX_00000000_000000_0.jpg

                if ((/^[a-z]{3}_[0-9]{8}_[0-9]{6}.jpg$|^[a-z]{3}_[0-9]{8}_[0-9]{6}_[0-9].jpg$/i).test(baseName)) {

                    year = parseInt(baseName.substr(4, 4));
                    month = parseInt(baseName.substr(8, 2)) - 1;
                    date = parseInt(baseName.substr(10, 2));
                    hours = parseInt(baseName.substr(13, 2));
                    minutes = parseInt(baseName.substr(15, 2));
                    seconds = parseInt(baseName.substr(17, 2));

                }

                // XXXXX_0000-00-00_00-00-00.jpg

                if ((/^[a-z]{5}_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.jpg$/i).test(baseName)) {

                    year = parseInt(baseName.substr(6, 4));
                    month = parseInt(baseName.substr(11, 2)) - 1;
                    date = parseInt(baseName.substr(14, 2));
                    hours = parseInt(baseName.substr(17, 2));
                    minutes = parseInt(baseName.substr(20, 2));
                    seconds = parseInt(baseName.substr(23, 2));

                }

                dateCreate.setFullYear(year);
                dateCreate.setMonth(month);
                dateCreate.setDate(date);
                dateCreate.setHours(hours);
                dateCreate.setMinutes(minutes);
                dateCreate.setSeconds(seconds);
                dateCreate.setMilliseconds(0);

                resolve(dateCreate);

            });

        });

    },

    number2String: (number, size, char) => {

        char = char || '0';
        number = number.toString();

        while (number.length < size) number = char + number;

        return number;

    }

};