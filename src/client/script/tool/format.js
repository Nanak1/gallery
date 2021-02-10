app.tool.format = {

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

    }

};