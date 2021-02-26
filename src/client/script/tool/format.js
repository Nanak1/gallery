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

    }

};