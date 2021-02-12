app.scene.gallery = {

    id: 'gallery',

    px: 256,
    page: 0,

    loading: false,
    finish: false,

    photos: [],

    years: [],
    months: [],
    days: [],

    columns: null,
    resizeTimeoutId: null,

    sort: {
        column: 'date_create',
        direction: 'DESC'
    },

    available: {
        years: [],
        months: [],
        days: []
    },

    show: () => new Promise((resolve, reject) => {

        document.body.classList.add('gallery-scrollbar-overlay');
        document.getElementById('app').innerHTML = '' +

            '<div id="photos" style="font-size: 0;"></div>' +

            '<button ' +
                'id="ctrl-button" ' +
                'class="btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out" ' +
                'style="position: fixed; left: 50%; bottom: 8px; margin-left: -28px;"' +
            '><i class="mdi mdi-image-search"></i></button>' +

            '<div id="ctrl-modal" class="gallery-modal">' +
                '<div class="gallery-modal-content">' +
                    '<h4>Управление</h4>' +

                    '<div>' +
                        '<p style="display: inline-block;">Год</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="ctrl-year-check-all" class="btn-small btn-floating waves-effect waves-green white">' +
                                '<i class="mdi mdi-check-all grey-text"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="ctrl-year-uncheck-all" class="btn-small btn-floating waves-effect waves-red white">' +
                                '<i class="mdi mdi-close grey-text"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="ctrl-year" class="row"></div>' +

                    '<div>' +
                        '<p style="display: inline-block;">Месяц</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="ctrl-month-check-all" class="btn-small btn-floating waves-effect waves-green white">' +
                                '<i class="mdi mdi-check-all grey-text"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="ctrl-month-uncheck-all" class="btn-small btn-floating waves-effect waves-red white">' +
                                '<i class="mdi mdi-close grey-text"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="ctrl-month" class="row"></div>' +

                    '<div>' +
                        '<p style="display: inline-block;">День</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="ctrl-day-check-all" class="btn-small btn-floating waves-effect waves-green white">' +
                                '<i class="mdi mdi-check-all grey-text"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="ctrl-day-uncheck-all" class="btn-small btn-floating waves-effect waves-red white">' +
                                '<i class="mdi mdi-close grey-text"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="ctrl-day" class="row"></div>' +

                    '<p>Параметр сортировки</p>' +

                    '<div class="row">' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input name="sort_column" type="radio" value="date_create">' +
                            ' ' +
                            '<span>Создание</span>' +
                        '</label>' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input name="sort_column" type="radio" value="date_import">' +
                            ' ' +
                            '<span>Добавление</span>' +
                        '</label>' +
                    '</div>' +

                    '<p>Направление сортировки</p>' +

                    '<div class="row">' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input name="sort_direction" type="radio" value="ASC">' +
                            ' ' +
                            '<span>Возрастание</span>' +
                        '</label>' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input name="sort_direction" type="radio" value="DESC">' +
                            ' ' +
                            '<span>Убывание</span>' +
                        '</label>' +
                    '</div>' +

                    '<div>' +
                        '<p style="display: inline-block;">Столбцы</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="ctrl-columns-left" class="btn-small btn-floating waves-effect waves-red white">' +
                                '<i class="mdi mdi-arrow-left grey-text"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="ctrl-columns-right" class="btn-small btn-floating waves-effect waves-green white">' +
                                '<i class="mdi mdi-arrow-right grey-text"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row grey-text">' +
                        '<div class="col s12">' +
                            '<span id="ctrl-columns"></span> <span id="ctrl-columns-unit"></span>' +
                        '</div>' +
                    '</div>' +

                '</div>' +
                '<div class="gallery-modal-footer">' +
                    '<button id="ctrl-cancel" class="btn-flat waves-effect waves-red">Отмена</button>' +
                    ' ' +
                    '<button id="ctrl-apply" class="btn-flat waves-effect waves-green">Применить</button>' +
                '</div>' +
            '</div>';

        app.scene.gallery.loadDateCreate('year').then(() => {
            app.scene.gallery.loadDateCreate('month').then(() => {
                app.scene.gallery.loadDateCreate('day').then(() => {

                    app.scene.gallery.startGallery().then(() => {

                        window.addEventListener('resize', app.scene.gallery.onResize);
                        app.scene.gallery.initCtrl();

                        app.activeScene = app.scene.gallery;
                        resolve();

                        // TODO
                        // document.getElementById('ctrl-button').click();

                    });

                });
            });
        });

    }),

    close: () => new Promise((resolve, reject) => {

        window.removeEventListener('resize', app.scene.gallery.onResize);
        window.removeEventListener('scroll', app.scene.gallery.onScroll);

        document.body.classList.remove('gallery-scrollbar-overlay');
        document.getElementById('app').innerHTML = '';

        app.scene.gallery.resizeTimeoutId = null;
        app.activeScene = null;
        resolve();

    }),

    onScroll: () => {

        if (window.scrollY + window.innerHeight > document.documentElement.offsetHeight - window.innerHeight) {
            app.scene.gallery.loadPage();
        }

    },

    onResize: () => {

        clearTimeout(app.scene.gallery.resizeTimeoutId);
        app.scene.gallery.resizeTimeoutId = setTimeout(() => {

            app.scene.gallery.startGallery();

        }, 250);

    },

    loadDateCreate: part => new Promise((resolve, reject) => {

        axios.get('/photo/date_create/' + part).then(res => {

            app.scene.gallery.available[part + 's'] = res.data[part + 's'];
            resolve();

        });

    }),

    startGallery: () => new Promise((resolve, reject) => {

        if (!app.scene.gallery.columns) {

            let width = Math.ceil(window.innerWidth);
            // let width = Math.ceil(window.innerWidth * window.devicePixelRatio);

            app.scene.gallery.columns = Math.ceil(width / app.scene.gallery.px);

        }

        app.scene.gallery.page = 0;
        app.scene.gallery.photos = [];
        app.scene.gallery.finish = false;
        document.getElementById('photos').innerHTML = '';
        window.removeEventListener('scroll', app.scene.gallery.onScroll);

        app.scene.gallery.loadPage().then(() => {
            app.scene.gallery.loadPage().then(() => {

                if (!app.scene.gallery.finish) window.addEventListener('scroll', app.scene.gallery.onScroll);

                resolve();

            });
        });

    }),

    loadPage: () => new Promise((resolve, reject) => {

        if (app.scene.gallery.loading || app.scene.gallery.finish) resolve();
        else {

            app.scene.gallery.loading = true;
            app.scene.gallery.page++;

            let width = Math.ceil(window.innerWidth);
            // let width = Math.ceil(window.innerWidth * window.devicePixelRatio);
            let height = Math.ceil(window.innerHeight);
            // let height = Math.ceil(window.innerHeight * window.devicePixelRatio);
            let rows = Math.ceil(app.scene.gallery.columns * height / width);
            let count = app.scene.gallery.columns * rows;

            axios.get('/photo', {
                params: {
                    count: count,
                    page: app.scene.gallery.page,
                    sort_column: app.scene.gallery.sort.column,
                    sort_direction: app.scene.gallery.sort.direction,
                    years: app.scene.gallery.years,
                    months: app.scene.gallery.months,
                    days: app.scene.gallery.days
                }
            }).then(res => {

                if (res.data.photos.length > 0) {

                    app.scene.gallery.photos.push(... res.data.photos);

                    let percent = 100 / app.scene.gallery.columns;
                    let html = '';

                    res.data.photos.forEach(photo => {

                        let params = [
                            `src="/photo/thumbnail/${photo.id}"`,
                            `width="256"`,
                            `height="256"`,
                            `style="width: ${percent}%; height: ${percent}%;"`
                        ];

                        html += `<img ${params.join(' ')}>`;

                    });


                    document.getElementById('photos').innerHTML += html;

                }

                if (res.data.photos.length < count) {

                    window.removeEventListener('scroll', app.scene.gallery.onScroll);
                    app.scene.gallery.finish = true;

                }

                app.scene.gallery.loading = false;
                resolve();

            });

        }

    }),

    initCtrl: () => {

        // ctrl year

        document.getElementById('ctrl-year-check-all').addEventListener('click', () => {

            let el = document.getElementById('ctrl-year');
            let nodeList = el.querySelectorAll('input[type=checkbox]');

            nodeList.forEach(checkbox => checkbox.checked = true);

        });

        document.getElementById('ctrl-year-uncheck-all').addEventListener('click', () => {

            let el = document.getElementById('ctrl-year');
            let nodeList = el.querySelectorAll('input[type=checkbox]');

            nodeList.forEach(checkbox => checkbox.checked = false);

        });

        app.scene.gallery.available.years.forEach(year => {

            let checked = app.scene.gallery.years.includes(year.value) ? ' checked' : '';

            document.getElementById('ctrl-year').innerHTML += '' +

                '<label class="col s6 m4 l3 xl2">' +
                    '<input type="checkbox" value="' + year.value + '"' + checked + '>' +
                    '<span style="width: 100%;">' + year.value + ' ' +
                        '<span class="right grey-text text-lighten-1">(' + year.count + ')</span>' +
                    '</span>' +
                '</label>';

        });

        // ctrl month

        document.getElementById('ctrl-month-check-all').addEventListener('click', () => {

            let el = document.getElementById('ctrl-month');
            let nodeList = el.querySelectorAll('input[type=checkbox]');

            nodeList.forEach(checkbox => checkbox.checked = true);

        });

        document.getElementById('ctrl-month-uncheck-all').addEventListener('click', () => {

            let el = document.getElementById('ctrl-month');
            let nodeList = el.querySelectorAll('input[type=checkbox]');

            nodeList.forEach(checkbox => checkbox.checked = false);

        });

        app.scene.gallery.available.months.forEach(month => {

            let checked = app.scene.gallery.months.includes(month.value) ? ' checked' : '';

            document.getElementById('ctrl-month').innerHTML += '' +

                '<label class="col s6 m4 l3 xl2">' +
                    '<input type="checkbox" value="' + month.value + '"' + checked + '>' +
                    '<span style="width: 100%;">' + app.tool.format.MONTH_SHORT[month.value - 1].toUpperCase() + ' ' +
                        '<span class="right grey-text text-lighten-1">(' + month.count + ')</span>' +
                    '</span>' +
                '</label>';

        });

        // ctrl day

        document.getElementById('ctrl-day-check-all').addEventListener('click', () => {

            let el = document.getElementById('ctrl-day');
            let nodeList = el.querySelectorAll('input[type=checkbox]');

            nodeList.forEach(checkbox => checkbox.checked = true);

        });

        document.getElementById('ctrl-day-uncheck-all').addEventListener('click', () => {

            let el = document.getElementById('ctrl-day');
            let nodeList = el.querySelectorAll('input[type=checkbox]');

            nodeList.forEach(checkbox => checkbox.checked = false);

        });

        app.scene.gallery.available.days.forEach(day => {

            let checked = app.scene.gallery.days.includes(day.value) ? ' checked' : '';

            document.getElementById('ctrl-day').innerHTML += '' +

                '<label class="col s6 m4 l3 xl2">' +
                    '<input type="checkbox" value="' + day.value + '"' + checked + '>' +
                    '<span style="width: 100%;">' + day.value + ' ' +
                        '<span class="right grey-text text-lighten-1">(' + day.count + ')</span>' +
                    '</span>' +
                '</label>';

        });

        // ctrl sort column

        document.querySelector(
            '[name=sort_column][value=' + app.scene.gallery.sort.column + ']'
        ).checked = true;

        // ctrl sort direction

        document.querySelector(
            '[name=sort_direction][value=' + app.scene.gallery.sort.direction + ']'
        ).checked = true;

        // ctrl columns

        document.getElementById('ctrl-columns').innerText = app.scene.gallery.columns;
        document.getElementById('ctrl-columns-unit').innerText = app.tool.format.getUnitEnding(
            app.scene.gallery.columns, 'столбец', 'столбца', 'столбцов'
        );

        document.getElementById('ctrl-columns-left').addEventListener('click', () => {

            let el = document.getElementById('ctrl-columns');
            let columns = parseInt(el.innerText);

            if (columns > 1) {

                columns--;
                el.innerText = columns.toString();
                document.getElementById('ctrl-columns-unit').innerText = app.tool.format.getUnitEnding(
                    columns, 'столбец', 'столбца', 'столбцов'
                );

            }

        });

        document.getElementById('ctrl-columns-right').addEventListener('click', () => {

            let el = document.getElementById('ctrl-columns');
            let columns = parseInt(el.innerText);

            columns++;
            el.innerText = columns.toString();
            document.getElementById('ctrl-columns-unit').innerText = app.tool.format.getUnitEnding(
                columns, 'столбец', 'столбца', 'столбцов'
            );

        });

        // ctrl cancel

        document.getElementById('ctrl-cancel').addEventListener('click', () => {
            document.body.style.overflow = '';
            document.getElementById('ctrl-modal').style.display = 'none';
        });

        // ctrl apply

        document.getElementById('ctrl-apply').addEventListener('click', () => {

            // year

            let elYear = document.getElementById('ctrl-year');
            let chYear = elYear.querySelectorAll('input[type=checkbox]:checked');

            app.scene.gallery.years = [];
            chYear.forEach(checkbox => app.scene.gallery.years.push(parseInt(checkbox.value)));

            // month

            let elMonth = document.getElementById('ctrl-month');
            let chMonth = elMonth.querySelectorAll('input[type=checkbox]:checked');

            app.scene.gallery.months = [];
            chMonth.forEach(checkbox => app.scene.gallery.months.push(parseInt(checkbox.value)));

            // day

            let elDay = document.getElementById('ctrl-day');
            let chDay = elDay.querySelectorAll('input[type=checkbox]:checked');

            app.scene.gallery.days = [];
            chDay.forEach(checkbox => app.scene.gallery.days.push(parseInt(checkbox.value)));

            // sort column

            app.scene.gallery.sort.column = document.querySelector('[name=sort_column]:checked').value

            // sort direction

            app.scene.gallery.sort.direction = document.querySelector('[name=sort_direction]:checked').value

            // columns

            app.scene.gallery.columns = parseInt(document.getElementById('ctrl-columns').innerText);

            // close

            document.body.style.overflow = '';
            document.getElementById('ctrl-modal').style.display = 'none';

            // apply

            app.scene.gallery.startGallery();

        });

        // ctrl button

        let button = document.getElementById('ctrl-button');

        button.addEventListener('click', () => {
            document.body.style.overflow = 'hidden';
            document.getElementById('ctrl-modal').style.display = 'block';
        });

        button.classList.remove('scale-out');

    }

};