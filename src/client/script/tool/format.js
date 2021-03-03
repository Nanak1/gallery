app.tool.format = {

    MONTH_FULL: [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь'
    ],

    MONTH_SHORT: [
        'Янв',
        'Фев',
        'Мар',
        'Апр',
        'Май',
        'Июн',
        'Июл',
        'Авг',
        'Сен',
        'Окт',
        'Ноя',
        'Дек'
    ],

    getUnitEnding: (number, first, second, third) => {

        let unit;

        if (10 < number && number < 15) unit = third;
        else {

            let mod = number % 10;

            unit = mod === 1 ? first : 1 < mod && mod < 5 ? second : third;

        }

        return unit;

    },

    number2String: (number, size, char) => {

        char = char || '0';
        number = number.toString();

        while (number.length < size) number = char + number;

        return number;

    },

    date: function (date, format) {

        format = format.split('Y').join(date.getFullYear());
        format = format.split('m').join(this.number2String(date.getMonth() + 1, 2));
        format = format.split('d').join(this.number2String(date.getDate(), 2));

        format = format.split('H').join(this.number2String(date.getHours(), 2));
        format = format.split('i').join(this.number2String(date.getMinutes(), 2));
        format = format.split('s').join(this.number2String(date.getSeconds(), 2));

        format = format.split('u').join(this.number2String(date.getMilliseconds(), 3));

        return format;

    },

    msToString: function (ms) {

        let s = 1000;
        let m = s * 60;
        let h = m * 60;
        let d = h * 24;

        let lines = [];

        if (ms >= d) {

            let x = Math.floor(ms / d);

            if (x) lines.push(x + ' ' + this.getUnitEnding(x, 'день', 'дня', 'дней'));

        }

        if (ms >= h) {

            let x = Math.floor(ms / h) % 24;

            if (x) lines.push(x + ' ' + this.getUnitEnding(x, 'час', 'часа', 'часов'));

        }

        if (ms >= m) {

            let x = Math.floor(ms / m) % 60;

            if (x) lines.push(x + ' ' + this.getUnitEnding(x, 'минута', 'минуты', 'минут'));

        }

        if (ms >= s) {

            let x = Math.floor(ms / s) % 60;

            if (x) lines.push(x + ' ' + this.getUnitEnding(x, 'секунда', 'секунды', 'секунд'));

        }

        if (ms < 1000) {

            let x = ms % 1000;

            lines.push(x + ' ' + this.getUnitEnding(x, 'миллисекунда', 'миллисекунды', 'миллисекунд'));

        }

        return lines.join(' ');

    }

};