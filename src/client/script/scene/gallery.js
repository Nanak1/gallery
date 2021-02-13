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

    // methods

    show: () => new Promise((resolve, reject) => {

        app.scene.gallery.loadDateCreate('year').then(() => {
            app.scene.gallery.loadDateCreate('month').then(() => {
                app.scene.gallery.loadDateCreate('day').then(() => {

                    window.addEventListener('resize', app.scene.gallery.onResize);
                    document.body.classList.add('gallery-scrollbar-overlay');
                    document.getElementById('app').innerHTML = app.scene.gallery.getHTML();

                    app.scene.gallery.reload().then(() => {

                        app.scene.gallery.initView();
                        app.scene.gallery.initCalendar();

                        app.scene.gallery.showButtons();

                        app.activeScene = app.scene.gallery;
                        resolve();

                    });

                });
            });
        });

    }),

    close: () => new Promise((resolve, reject) => {

        // before clear

        window.removeEventListener('resize', app.scene.gallery.onResize);
        window.removeEventListener('scroll', app.scene.gallery.onScroll);

        // clear

        document.getElementById('app').innerHTML = '';

        // after clear

        document.body.classList.remove('gallery-scrollbar-overlay');
        app.scene.gallery.resizeTimeoutId = null;

        // end

        app.activeScene = null;
        resolve();

    }),

    // events

    onScroll: () => {

        if (window.scrollY + window.innerHeight > document.documentElement.offsetHeight - window.innerHeight) {
            app.scene.gallery.loadPage();
        }

    },

    onResize: () => {

        clearTimeout(app.scene.gallery.resizeTimeoutId);
        app.scene.gallery.resizeTimeoutId = setTimeout(() => {

            app.scene.gallery.reload();

        }, 250);

    },

    // grid

    loadDateCreate: part => new Promise((resolve, reject) => {

        axios.get('/photo/date_create/' + part).then(res => {

            app.scene.gallery.available[part + 's'] = res.data[part + 's'];
            resolve();

        });

    }),

    reload: () => new Promise((resolve, reject) => {

        if (!app.scene.gallery.columns) {

            let dpr = app.scene.gallery.devicePixelRatio ? window.devicePixelRatio : 1;
            let width = Math.ceil(window.innerWidth * dpr);

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

            let dpr = app.scene.gallery.devicePixelRatio ? window.devicePixelRatio : 1;
            let width = Math.ceil(window.innerWidth * dpr);
            let height = Math.ceil(window.innerHeight * dpr);
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

    // tools

    showButtons: () => {

        document.getElementById('menu-button').classList.remove('scale-out');
        document.getElementById('view-button').classList.remove('scale-out');
        document.getElementById('edit-button').classList.remove('scale-out');
        document.getElementById('calendar-button').classList.remove('scale-out');
        document.getElementById('search-button').classList.remove('scale-out');

    },

    hideButtons: () => {

        document.getElementById('menu-button').classList.add('scale-out');
        document.getElementById('view-button').classList.add('scale-out');
        document.getElementById('edit-button').classList.add('scale-out');
        document.getElementById('calendar-button').classList.add('scale-out');
        document.getElementById('search-button').classList.add('scale-out');

    },

    getHTML: () => {

        let html = '';

        html += '<div id="photos" style="font-size: 0;"></div>';

        html += app.scene.gallery.getEditButton();
        html += app.scene.gallery.getViewButton();
        html += app.scene.gallery.getSearchButton();
        html += app.scene.gallery.getCalendarButton();
        html += app.scene.gallery.getMenuButton();

        return html;

    },

    // edit

    getEditButton: () => {

        let padding = 8;
        let diameter = 56;
        let left = 0 - Math.round(diameter / 2) - padding - diameter - padding - diameter;

        return '' +
            '<button ' +
                'id="edit-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out" ' +
                'style="position: fixed; left: 50%; bottom: ' + padding + 'px; margin-left: ' + left + 'px;"' +
            '>' +
                '<i class="mdi mdi-pencil"></i>' +
            '</button>';

    },

    // view

    getViewButton: () => {

        let padding = 8;
        let diameter = 56;
        let left = 0 - Math.round(diameter / 2) - padding - diameter;

        return '' +
            '<button ' +
                'id="view-button" ' +
                'class="btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out" ' +
                'style="position: fixed; left: 50%; bottom: ' + padding + 'px; margin-left: ' + left + 'px;"' +
            '>' +
                '<i class="mdi mdi-view-grid"></i>' +
            '</button>';

    },

    getViewModal: () => {

        return '' +
            '<div id="view-modal" class="gallery-modal">' +

                '<div class="gallery-modal-content">' +

                    '<h4>Вид</h4>' +

                    '<div>' +
                        '<p style="display: inline-block;">Столбцы</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="view-columns-decrease" class="btn-small btn-floating waves-effect waves-red white">' +
                                '<i class="mdi mdi-arrow-left grey-text"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="view-columns-increase" class="btn-small btn-floating waves-effect waves-green white">' +
                                '<i class="mdi mdi-arrow-right grey-text"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row grey-text">' +
                        '<div class="col s12">' +
                            '<span id="view-columns"></span>' +
                            ' ' +
                            '<span id="view-columns-unit"></span>' +
                        '</div>' +
                    '</div>' +

                    '<p>Направление сортировки</p>' +

                    '<div class="row">' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input name="sort-direction" type="radio" value="ASC">' +
                            ' ' +
                            '<span>Возрастание</span>' +
                        '</label>' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input name="sort-direction" type="radio" value="DESC">' +
                            ' ' +
                            '<span>Убывание</span>' +
                        '</label>' +
                    '</div>' +

                    '<p>Параметр сортировки</p>' +

                    '<div class="row">' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input name="sort-column" type="radio" value="date_create">' +
                            ' ' +
                            '<span>Создание</span>' +
                        '</label>' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input name="sort-column" type="radio" value="date_import">' +
                            ' ' +
                            '<span>Добавление</span>' +
                        '</label>' +
                    '</div>' +

                '</div>' +

                '<div class="gallery-modal-footer">' +
                    '<button id="view-cancel" class="btn-flat waves-effect waves-red">Отмена</button>' +
                    ' ' +
                    '<button id="view-apply" class="btn-flat waves-effect waves-green">Применить</button>' +
                '</div>' +

            '</div>';

    },

    initView: () => {

        document.getElementById('view-button').addEventListener('click', () => {

            app.scene.gallery.hideButtons();
            document.body.insertAdjacentHTML('afterbegin', app.scene.gallery.getViewModal());

            (() => {

                // columns

                document.getElementById('view-columns').innerText = app.scene.gallery.columns;
                document.getElementById('view-columns-unit').innerText = app.tool.format.getUnitEnding(
                    app.scene.gallery.columns, 'столбец', 'столбца', 'столбцов'
                );

                document.getElementById('view-columns-decrease').addEventListener('click', () => {

                    let el = document.getElementById('view-columns');
                    let columns = parseInt(el.innerText);

                    if (columns > 1) {

                        columns--;
                        el.innerText = columns.toString();
                        document.getElementById('view-columns-unit').innerText = app.tool.format.getUnitEnding(
                            columns, 'столбец', 'столбца', 'столбцов'
                        );

                    }

                });

                document.getElementById('view-columns-increase').addEventListener('click', () => {

                    let el = document.getElementById('view-columns');
                    let columns = parseInt(el.innerText);

                    columns++;
                    el.innerText = columns.toString();
                    document.getElementById('view-columns-unit').innerText = app.tool.format.getUnitEnding(
                        columns, 'столбец', 'столбца', 'столбцов'
                    );

                });

                // sort direction

                document.querySelector(
                    '[name=sort-direction][value=' + app.scene.gallery.sort.direction + ']'
                ).checked = true;

                // sort column

                document.querySelector(
                    '[name=sort-column][value=' + app.scene.gallery.sort.column + ']'
                ).checked = true;

                // cancel

                document.getElementById('view-cancel').addEventListener('click', () => {

                    document.getElementById('view-modal').remove();
                    document.body.style.overflow = '';

                    app.scene.gallery.showButtons();

                });

                // apply

                document.getElementById('view-apply').addEventListener('click', () => {

                    // columns

                    app.scene.gallery.columns = parseInt(document.getElementById('view-columns').innerText);

                    // sort direction

                    app.scene.gallery.sort.direction = document.querySelector('[name=sort-direction]:checked').value

                    // sort column

                    app.scene.gallery.sort.column = document.querySelector('[name=sort-column]:checked').value

                    // apply

                    app.scene.gallery.reload().then(() => {
                        document.getElementById('view-cancel').click();
                    });

                });

            })();

            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                document.getElementById('view-modal').style.display = 'block';
            }, 200);

        });

    },

    // search

    getSearchButton: () => {

        let padding = 8;
        let diameter = 56;
        let left = 0 - Math.round(diameter / 2);

        return '' +
            '<button ' +
                'id="search-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out" ' +
                'style="position: fixed; left: 50%; bottom: ' + padding + 'px; margin-left: ' + left + 'px;"' +
            '>' +
                '<i class="mdi mdi-magnify"></i>' +
            '</button>';

    },

    // calendar

    getCalendarButton: () => {

        let padding = 8;
        let diameter = 56;
        let left = Math.round(diameter / 2) + padding;

        return '' +
            '<button ' +
                'id="calendar-button" ' +
                'class="btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out" ' +
                'style="position: fixed; left: 50%; bottom: ' + padding + 'px; margin-left: ' + left + 'px;"' +
            '>' +
                '<i class="mdi mdi-calendar"></i>' +
            '</button>';

    },

    getCalendarModal: () => {

        return '' +
            '<div id="calendar-modal" class="gallery-modal">' +

                '<div class="gallery-modal-content">' +

                    '<h4>Календарь</h4>' +

                    '<div>' +
                        '<p style="display: inline-block;">Год</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="calendar-year-check-all" class="btn-small btn-floating waves-effect waves-green white">' +
                                '<i class="mdi mdi-check-all grey-text"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="calendar-year-uncheck-all" class="btn-small btn-floating waves-effect waves-red white">' +
                                '<i class="mdi mdi-close grey-text"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="calendar-year" class="row"></div>' +

                    '<div>' +
                        '<p style="display: inline-block;">Месяц</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="calendar-month-check-all" class="btn-small btn-floating waves-effect waves-green white">' +
                                '<i class="mdi mdi-check-all grey-text"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="calendar-month-uncheck-all" class="btn-small btn-floating waves-effect waves-red white">' +
                                '<i class="mdi mdi-close grey-text"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="calendar-month" class="row"></div>' +

                    '<div>' +
                        '<p style="display: inline-block;">День</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="calendar-day-check-all" class="btn-small btn-floating waves-effect waves-green white">' +
                                '<i class="mdi mdi-check-all grey-text"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="calendar-day-uncheck-all" class="btn-small btn-floating waves-effect waves-red white">' +
                                '<i class="mdi mdi-close grey-text"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="calendar-day" class="row"></div>' +

                '</div>' +

                '<div class="gallery-modal-footer">' +
                    '<button id="calendar-cancel" class="btn-flat waves-effect waves-red">Отмена</button>' +
                    ' ' +
                    '<button id="calendar-apply" class="btn-flat waves-effect waves-green">Применить</button>' +
                '</div>' +

            '</div>';

    },

    initCalendar: () => {

        document.getElementById('calendar-button').addEventListener('click', () => {

            app.scene.gallery.hideButtons();
            document.body.insertAdjacentHTML('afterbegin', app.scene.gallery.getCalendarModal());

            (() => {

                // year

                document.getElementById('calendar-year-check-all').addEventListener('click', () => {

                    let el = document.getElementById('calendar-year');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');

                    nodeList.forEach(checkbox => checkbox.checked = true);

                });

                document.getElementById('calendar-year-uncheck-all').addEventListener('click', () => {

                    let el = document.getElementById('calendar-year');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');

                    nodeList.forEach(checkbox => checkbox.checked = false);

                });

                app.scene.gallery.available.years.forEach(year => {

                    let checked = app.scene.gallery.years.includes(year.value) ? ' checked' : '';

                    document.getElementById('calendar-year').innerHTML += '' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input type="checkbox" value="' + year.value + '"' + checked + '>' +
                            '<span style="width: 100%;">' +
                                year.value +
                                ' ' +
                                '<span class="right grey-text text-lighten-1">' +
                                    '(' + year.count + ')' +
                                '</span>' +
                            '</span>' +
                        '</label>';

                });

                // month

                document.getElementById('calendar-month-check-all').addEventListener('click', () => {

                    let el = document.getElementById('calendar-month');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');

                    nodeList.forEach(checkbox => checkbox.checked = true);

                });

                document.getElementById('calendar-month-uncheck-all').addEventListener('click', () => {

                    let el = document.getElementById('calendar-month');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');

                    nodeList.forEach(checkbox => checkbox.checked = false);

                });

                app.scene.gallery.available.months.forEach(month => {

                    let checked = app.scene.gallery.months.includes(month.value) ? ' checked' : '';

                    document.getElementById('calendar-month').innerHTML += '' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input type="checkbox" value="' + month.value + '"' + checked + '>' +
                            '<span style="width: 100%;">' +
                                app.tool.format.MONTH_SHORT[month.value - 1].toUpperCase() +
                                ' ' +
                                '<span class="right grey-text text-lighten-1">' +
                                    '(' + month.count + ')' +
                                '</span>' +
                            '</span>' +
                        '</label>';

                });

                // day

                document.getElementById('calendar-day-check-all').addEventListener('click', () => {

                    let el = document.getElementById('calendar-day');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');

                    nodeList.forEach(checkbox => checkbox.checked = true);

                });

                document.getElementById('calendar-day-uncheck-all').addEventListener('click', () => {

                    let el = document.getElementById('calendar-day');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');

                    nodeList.forEach(checkbox => checkbox.checked = false);

                });

                app.scene.gallery.available.days.forEach(day => {

                    let checked = app.scene.gallery.days.includes(day.value) ? ' checked' : '';

                    document.getElementById('calendar-day').innerHTML += '' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input type="checkbox" value="' + day.value + '"' + checked + '>' +
                            '<span style="width: 100%;">' +
                                day.value +
                                ' ' +
                                '<span class="right grey-text text-lighten-1">' +
                                    '(' + day.count + ')' +
                                '</span>' +
                            '</span>' +
                        '</label>';

                });

                // cancel

                document.getElementById('calendar-cancel').addEventListener('click', () => {

                    document.getElementById('calendar-modal').remove();
                    document.body.style.overflow = '';

                    app.scene.gallery.showButtons();

                });

                // apply

                document.getElementById('calendar-apply').addEventListener('click', () => {

                    // year

                    let elYear = document.getElementById('calendar-year');
                    let chYear = elYear.querySelectorAll('input[type=checkbox]:checked');

                    app.scene.gallery.years = [];
                    chYear.forEach(checkbox => app.scene.gallery.years.push(parseInt(checkbox.value)));

                    // month

                    let elMonth = document.getElementById('calendar-month');
                    let chMonth = elMonth.querySelectorAll('input[type=checkbox]:checked');

                    app.scene.gallery.months = [];
                    chMonth.forEach(checkbox => app.scene.gallery.months.push(parseInt(checkbox.value)));

                    // day

                    let elDay = document.getElementById('calendar-day');
                    let chDay = elDay.querySelectorAll('input[type=checkbox]:checked');

                    app.scene.gallery.days = [];
                    chDay.forEach(checkbox => app.scene.gallery.days.push(parseInt(checkbox.value)));

                    // apply

                    app.scene.gallery.reload().then(() => {
                        document.getElementById('calendar-cancel').click();
                    });

                });

            })();

            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                document.getElementById('calendar-modal').style.display = 'block';
            }, 200);

        });

    },

    // menu

    getMenuButton: () => {

        let padding = 8;
        let diameter = 56;
        let left = Math.round(diameter / 2) + padding + diameter + padding;

        return '' +
            '<button ' +
                'id="menu-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out" ' +
                'style="position: fixed; left: 50%; bottom: ' + padding + 'px; margin-left: ' + left + 'px;"' +
            '>' +
                '<i class="mdi mdi-cog"></i>' +
            '</button>';

    },

};