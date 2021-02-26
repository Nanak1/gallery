app.scene.gallery = {

    id: 'gallery',

    sortDirection: 'DESC',
    sortColumn: 'date_create',

    px: 256,
    page: 0,
    lastDate: null,

    columns: null,
    rows: null,

    orientation: null,

    loading: false,
    finish: false,

    photos: [],
    selected: [],

    years: [],
    months: [],
    days: [],

    _years: [],
    _months: [],
    _days: [],

    // methods

    show: () => new Promise((resolve, reject) => {

        app.scene.gallery.loadDateCreate('year').then(() => {
            app.scene.gallery.loadDateCreate('month').then(() => {
                app.scene.gallery.loadDateCreate('day').then(() => {

                    // html

                    let html = '<div id="app-grid"></div>';

                    html += app.scene.gallery.getPreviewModalHTML();

                    html += app.scene.gallery.getMenuButtonHTML();

                    html += app.tool.toolbar.getHTML('toolbar-view', [
                        app.scene.gallery.getViewButtonHTML(),
                        app.scene.gallery.getCalendarButtonHTML(),
                        app.scene.gallery.getSearchButtonHTML(),
                        app.scene.gallery.getSelectButtonHTML()
                    ]);

                    let buttons = [];

                    if (app.account['access_photo_delete']) buttons.push(app.scene.gallery.getDeleteButtonHTML());
                    if (app.account['access_photo_edit']) buttons.push(app.scene.gallery.getEditButtonHTML());

                    html += app.tool.toolbar.getHTML('toolbar-edit', [
                        ... buttons,
                        app.scene.gallery.getDownloadButtonHTML(),
                        app.scene.gallery.getBackButtonHTML()
                    ], 'none');

                    html += app.scene.gallery.getAllButtonHTML();

                    html += app.scene.gallery.getLeftButtonHTML();
                    html += app.scene.gallery.getRightButtonHTML();

                    document.getElementById('app').innerHTML = html;
                    document.body.classList.add('gallery-scrollbar-overlay');

                    app.scene.gallery.initPreview();

                    app.scene.gallery.initMenu();

                    app.scene.gallery.initView();
                    app.scene.gallery.initCalendar();
                    app.scene.gallery.initSearch();
                    app.scene.gallery.initSelect();

                    app.scene.gallery.initDelete();
                    app.scene.gallery.initEdit();
                    app.scene.gallery.initDownload();
                    app.scene.gallery.initBack();

                    app.scene.gallery.initAll();

                    app.scene.gallery.initLeft();
                    app.scene.gallery.initRight();

                    // orientation

                    window.addEventListener('orientationchange', app.scene.gallery.onOrientationChange);
                    app.scene.gallery.orientation = window.screen.orientation.type;

                    // reload

                    app.scene.gallery.reload().then(() => {

                        // show ui

                        [
                            'menu-button',

                            'view-button',
                            'calendar-button',
                            'search-button',
                            'select-button'
                        ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                        // end

                        app.activeScene = app.scene.gallery;
                        resolve();

                    });

                });
            });
        });

    }),

    close: () => new Promise((resolve, reject) => {

        // before clear

        window.removeEventListener('orientationchange', app.scene.gallery.onOrientationChange);
        window.removeEventListener('scroll', app.scene.gallery.onScroll);

        // clear

        document.getElementById('app').innerHTML = '';

        // after clear

        document.body.classList.remove('gallery-scrollbar-overlay');

        // end

        app.activeScene = null;
        resolve();

    }),

    loadDateCreate: part => new Promise((resolve, reject) => {

        axios.get('/photo/date_create/' + part).then(res => {

            app.scene.gallery['_' + part + 's'] = res.data[part + 's'];
            resolve();

        });

    }),

    reload: () => new Promise((resolve, reject) => {

        if (!app.scene.gallery.columns) {
            app.scene.gallery.columns = Math.ceil(
                window.innerWidth / app.scene.gallery.px
            );
        }

        if (!app.scene.gallery.rows) {
            app.scene.gallery.rows = Math.ceil(
                app.scene.gallery.columns * window.innerHeight / window.innerWidth
            );
        }

        app.scene.gallery.page = 0;
        app.scene.gallery.lastDate = null;
        app.scene.gallery.photos = [];
        app.scene.gallery.selected = [];
        app.scene.gallery.finish = false;
        document.getElementById('app-grid').innerHTML = '';
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

            let count = app.scene.gallery.columns * app.scene.gallery.rows;

            axios.get('/photo', {
                params: {
                    count: count,
                    page: app.scene.gallery.page,
                    sort_direction: app.scene.gallery.sortDirection,
                    sort_column: app.scene.gallery.sortColumn,
                    years: app.scene.gallery.years,
                    months: app.scene.gallery.months,
                    days: app.scene.gallery.days
                }
            }).then(res => {

                if (res.data.photos.length > 0) {

                    app.scene.gallery.photos.push(... res.data.photos);

                    let width = 100 / app.scene.gallery.columns;
                    let el = document.getElementById('app-grid');

                    res.data.photos.forEach(photo => {

                        // проверка на разделитель

                        let isDivider = false;
                        let currentDate = photo[app.scene.gallery.sortColumn];
                        let curr = new Date(currentDate);

                        if (app.scene.gallery.lastDate) {

                            let last = new Date(app.scene.gallery.lastDate);

                            isDivider =
                                last.getFullYear() !== curr.getFullYear() ||
                                last.getMonth() !== curr.getMonth() ||
                                last.getDate() !== curr.getDate();

                        } else isDivider = true;

                        if (isDivider) {

                            el.insertAdjacentHTML('beforeend', '' +
                                '<h4 class="gallery-divider">' +
                                    app.tool.format.number2String(curr.getDate(), 2) +
                                    '.' +
                                    app.tool.format.number2String(curr.getMonth() + 1, 2) +
                                    '.' +
                                    curr.getFullYear() +
                                '</h4>'
                            );

                        }

                        // currentDate > lastDate

                        app.scene.gallery.lastDate = currentDate;

                        // thumbnail

                        let url = '/photo/thumbnail/' + photo.id;

                        el.insertAdjacentHTML('beforeend', '' +
                            '<div ' +
                                'data-id="' + photo.id + '" ' +
                                'class="thumbnail" ' +
                                'style="width: ' + width + '%; background-image: url(' + url + ');"' +
                            '></div>'
                        );

                        el.querySelector(
                            '[data-id="' + photo.id + '"]'
                        ).addEventListener('click', event => {

                            let id = event.target.dataset.id;

                            if (document.getElementById('all-button').classList.contains('scale-out')) {

                                // photo:preview

                                app.scene.gallery.selected = [id];
                                document.body.style.overflow = 'hidden';

                                [
                                    'view-button',
                                    'calendar-button',
                                    'search-button',
                                    'select-button'
                                ].forEach(button => document.getElementById(button).classList.add('scale-out'));

                                setTimeout(() => {

                                    let el = document.getElementById('preview-modal');

                                    el.style.backgroundImage = 'url(/photo/preview/' + id + ')';
                                    el.style.display = 'block';
                                    document.getElementById('toolbar-view').style.display = 'none';
                                    document.getElementById('toolbar-edit').style.display = 'block';

                                    setTimeout(() => {

                                        let buttons = [];

                                        if (app.account['access_photo_delete']) buttons.push('delete-button');
                                        if (app.account['access_photo_edit']) buttons.push('edit-button');

                                        [
                                            ... buttons,
                                            'download-button',
                                            'back-button',

                                            'left-button',
                                            'right-button'
                                        ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                                    }, 50);

                                }, 200);

                            } else {

                                // photo:select

                                if (app.scene.gallery.selected.includes(id)) {

                                    app.scene.gallery.selected.splice(app.scene.gallery.selected.indexOf(id), 1);
                                    event.target.classList.remove('select');

                                } else {

                                    app.scene.gallery.selected.push(id);
                                    event.target.classList.add('select');

                                }

                                console.log(app.scene.gallery.selected);

                            }

                        });

                    });

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

    // events

    onScroll: () => {

        if (window.scrollY + window.innerHeight > document.documentElement.offsetHeight - window.innerHeight) {
            app.scene.gallery.loadPage();
        }

    },

    onOrientationChange: () => {

        if (
            app.scene.gallery.orientation.includes('portrait') &&
            window.screen.orientation.type.includes('landscape') ||
            app.scene.gallery.orientation.includes('landscape') &&
            window.screen.orientation.type.includes('portrait')
        ) {

            // столбцы и строки меняются местами

            let columns = app.scene.gallery.columns;

            app.scene.gallery.columns = app.scene.gallery.rows;
            app.scene.gallery.rows = columns;

            // проверка на наличие фотографий

            if (app.scene.gallery.photos.length) {

                // поиск узла для выравнивания после смены ориентации

                let node = null;
                let nodes = document.getElementById('app-grid').childNodes;

                for (let i = 0; !node && i < nodes.length; i++) {

                    if (nodes[i].offsetTop >= window.scrollY) node = nodes[i];

                }

                // обновление ширины и высоты миниатюры в сетке

                let percent = 100 / app.scene.gallery.columns;

                nodes.forEach(thumbnail => {

                    if (thumbnail.classList.contains('thumbnail')) {

                        thumbnail.style.width = percent + '%';
                        thumbnail.style.height = percent + '%';

                    }

                });

                // выравнивание по фотографии

                setTimeout(() => {
                    node.scrollIntoView();
                }, 100);

            }

        }

        app.scene.gallery.orientation = window.screen.orientation.type;

    },

    // preview

    getPreviewModalHTML: () => {

        return '' +
            '<div ' +
                'id="preview-modal" ' +
                'class="gallery-preview" ' +
                'style="' +
                    'background-image: url(/src/client/image/favicon.png);' +
                '"' +
            '></div>';

    },

    initPreview: () => {

        document.getElementById('preview-modal').addEventListener('click', () => {

            let f = document.getElementById('menu-button').classList.contains('scale-out') ? 'remove' : 'add';

            let buttons = [];

            if (app.account['access_photo_delete']) buttons.push('delete-button');
            if (app.account['access_photo_edit']) buttons.push('edit-button');

            [
                'menu-button',

                ... buttons,
                'download-button',
                'back-button',

                'left-button',
                'right-button'
            ].forEach(button => document.getElementById(button).classList[f]('scale-out'));

        });

    },

    // menu

    getMenuButtonHTML: () => {

        return '' +
            '<button ' +
                'id="menu-button" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out red" ' +
                'style="position: fixed; left: 8px; top: 8px;"' +
            '>' +
                '<i class="mdi mdi-menu white-text"></i>' +
            '</button>';

    },

    initMenu: () => {

        document.getElementById('menu-button').addEventListener('click', () => {

            let buttons = [];

            if (app.account['access_photo_delete']) buttons.push('delete-button');
            if (app.account['access_photo_edit']) buttons.push('edit-button');

            [
                'menu-button',

                'view-button',
                'calendar-button',
                'search-button',
                'select-button',

                ... buttons,
                'download-button',
                'back-button',

                'all-button',

                'left-button',
                'right-button'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                app.scene.gallery.close();
                app.scene.menu.show();

            }, 250);

        });

    },

    // view

    getViewButtonHTML: () => {

        return '' +
            '<button ' +
                'id="view-button" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-view-grid"></i>' +
            '</button>';

    },

    getViewModalHTML: () => {

        return '' +
            '<div id="view-modal" class="gallery-modal">' +

                '<div class="gallery-modal-content">' +

                    '<h4>Вид</h4>' +

                    '<div>' +
                        '<p style="display: inline-block;">Столбцы</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="view-columns-increase" class="btn-small btn-floating waves-effect waves-light">' +
                                '<i class="mdi mdi-plus-thick"></i>' +
                            '</button>' +
                            ' ' +
                            '<button id="view-columns-decrease" class="btn-small btn-floating waves-effect waves-light">' +
                                '<i class="mdi mdi-minus-thick"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="row">' +
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

                    '<div style="height: 56px;"></div>' +

                '</div>' +

                app.tool.toolbar.getHTML('toolbar-calendar', [

                    '<button ' +
                        'id="view-cancel" ' +
                        'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
                    '>' +
                        '<i class="mdi mdi-close-thick"></i>' +
                    '</button>',

                    '<button ' +
                        'id="view-apply" ' +
                        'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out red"' +
                    '>' +
                        '<i class="mdi mdi-check-bold white-text"></i>' +
                    '</button>'

                ]) +

            '</div>';

    },

    initView: () => {

        document.getElementById('view-button').addEventListener('click', () => {

            [
                'menu-button',

                'view-button',
                'calendar-button',
                'search-button',
                'select-button'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            document.body.insertAdjacentHTML('afterbegin', app.scene.gallery.getViewModalHTML());

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
                    '[name=sort-direction][value=' + app.scene.gallery.sortDirection + ']'
                ).checked = true;

                // sort column

                document.querySelector(
                    '[name=sort-column][value=' + app.scene.gallery.sortColumn + ']'
                ).checked = true;

                // cancel

                document.getElementById('view-cancel').addEventListener('click', () => {

                    [
                        'view-cancel',
                        'view-apply'
                    ].forEach(button => document.getElementById(button).classList.add('scale-out'));

                    setTimeout(() => {

                        document.getElementById('view-modal').remove();
                        document.body.style.overflow = '';

                        [
                            'menu-button',

                            'view-button',
                            'calendar-button',
                            'search-button',
                            'select-button'
                        ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                    }, 250);

                });

                // apply

                document.getElementById('view-apply').addEventListener('click', () => {

                    // columns

                    app.scene.gallery.columns = parseInt(document.getElementById('view-columns').innerText);
                    app.scene.gallery.rows = null;

                    // sort direction

                    app.scene.gallery.sortDirection = document.querySelector('[name=sort-direction]:checked').value

                    // sort column

                    app.scene.gallery.sortColumn = document.querySelector('[name=sort-column]:checked').value

                    // apply

                    app.scene.gallery.reload().then(() => {
                        document.getElementById('view-cancel').click();
                    });

                });

            })();

            document.body.style.overflow = 'hidden';

            setTimeout(() => {

                document.getElementById('view-modal').style.display = 'block';

                setTimeout(() => {

                    [
                        'view-cancel',
                        'view-apply'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                }, 100);

            }, 250);

        });

    },

    // calendar

    getCalendarButtonHTML: () => {

        return '' +
            '<button ' +
                'id="calendar-button" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-calendar"></i>' +
            '</button>';

    },

    getCalendarModalHTML: () => {

        return '' +
            '<div id="calendar-modal" class="gallery-modal">' +

                '<div class="gallery-modal-content">' +

                    '<h4>Календарь</h4>' +

                    '<div>' +
                        '<p style="display: inline-block;">Год</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="calendar-year-check" class="btn-small btn-floating waves-effect waves-light">' +
                                '<i class="mdi mdi-check-all"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="calendar-year" class="row"></div>' +

                    '<div>' +
                        '<p style="display: inline-block;">Месяц</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="calendar-month-check" class="btn-small btn-floating waves-effect waves-light">' +
                                '<i class="mdi mdi-check-all"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="calendar-month" class="row"></div>' +

                    '<div>' +
                        '<p style="display: inline-block;">День</p>' +
                        '<div class="right" style="margin-top: 8px;">' +
                            '<button id="calendar-day-check" class="btn-small btn-floating waves-effect waves-light">' +
                                '<i class="mdi mdi-check-all"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div id="calendar-day" class="row"></div>' +

                    '<div style="height: 56px;"></div>' +

                '</div>' +

                app.tool.toolbar.getHTML('toolbar-calendar', [

                    '<button ' +
                        'id="calendar-cancel" ' +
                        'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
                    '>' +
                        '<i class="mdi mdi-close-thick"></i>' +
                    '</button>',

                    '<button ' +
                        'id="calendar-apply" ' +
                        'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out red"' +
                    '>' +
                        '<i class="mdi mdi-check-bold white-text"></i>' +
                    '</button>'

                ]) +

            '</div>';

    },

    initCalendar: () => {

        document.getElementById('calendar-button').addEventListener('click', () => {

            [
                'menu-button',

                'view-button',
                'calendar-button',
                'search-button',
                'select-button'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            document.body.insertAdjacentHTML('afterbegin', app.scene.gallery.getCalendarModalHTML());

            (() => {

                // year

                document.getElementById('calendar-year-check').addEventListener('click', () => {

                    let el = document.getElementById('calendar-year');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');
                    let checked = nodeList[0].checked;

                    nodeList.forEach(checkbox => checkbox.checked = !checked);

                });

                app.scene.gallery._years.forEach(year => {

                    let checked = app.scene.gallery.years.includes(year.value) ? ' checked' : '';

                    document.getElementById('calendar-year').innerHTML += '' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input type="checkbox" value="' + year.value + '"' + checked + '>' +
                            '<span style="width: 100%;">' +
                                year.value +
                                ' ' +
                                '<span class="right grey-text text-darken-1">' +
                                    '(' + year.count + ')' +
                                '</span>' +
                            '</span>' +
                        '</label>';

                });

                // month

                document.getElementById('calendar-month-check').addEventListener('click', () => {

                    let el = document.getElementById('calendar-month');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');
                    let checked = nodeList[0].checked;

                    nodeList.forEach(checkbox => checkbox.checked = !checked);

                });

                app.scene.gallery._months.forEach(month => {

                    let checked = app.scene.gallery.months.includes(month.value) ? ' checked' : '';

                    document.getElementById('calendar-month').innerHTML += '' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input type="checkbox" value="' + month.value + '"' + checked + '>' +
                            '<span style="width: 100%;">' +
                                app.tool.format.MONTH_SHORT[month.value - 1].toUpperCase() +
                                ' ' +
                                '<span class="right grey-text text-darken-1">' +
                                    '(' + month.count + ')' +
                                '</span>' +
                            '</span>' +
                        '</label>';

                });

                // day

                document.getElementById('calendar-day-check').addEventListener('click', () => {

                    let el = document.getElementById('calendar-day');
                    let nodeList = el.querySelectorAll('input[type=checkbox]');
                    let checked = nodeList[0].checked;

                    nodeList.forEach(checkbox => checkbox.checked = !checked);

                });

                app.scene.gallery._days.forEach(day => {

                    let checked = app.scene.gallery.days.includes(day.value) ? ' checked' : '';

                    document.getElementById('calendar-day').innerHTML += '' +
                        '<label class="col s6 m4 l3 xl2">' +
                            '<input type="checkbox" value="' + day.value + '"' + checked + '>' +
                            '<span style="width: 100%;">' +
                                day.value +
                                ' ' +
                                '<span class="right grey-text text-darken-1">' +
                                    '(' + day.count + ')' +
                                '</span>' +
                            '</span>' +
                        '</label>';

                });

                // cancel

                document.getElementById('calendar-cancel').addEventListener('click', () => {

                    [
                        'calendar-cancel',
                        'calendar-apply'
                    ].forEach(button => document.getElementById(button).classList.add('scale-out'));

                    setTimeout(() => {

                        document.getElementById('calendar-modal').remove();
                        document.body.style.overflow = '';

                        [
                            'menu-button',

                            'view-button',
                            'calendar-button',
                            'search-button',
                            'select-button'
                        ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                    }, 250);

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

                setTimeout(() => {

                    [
                        'calendar-cancel',
                        'calendar-apply'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                }, 100);

            }, 250);

        });

    },

    // search

    getSearchButtonHTML: () => {

        return '' +
            '<button ' +
                'id="search-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-magnify"></i>' +
            '</button>';

    },

    initSearch: () => {

        console.log('init search');

    },

    // select

    getSelectButtonHTML: () => {

        return '' +
            '<button ' +
                'id="select-button" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-selection"></i>' +
            '</button>';

    },

    initSelect: () => {

        document.getElementById('select-button').addEventListener('click', () => {

            [
                'view-button',
                'calendar-button',
                'search-button',
                'select-button'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                document.getElementById('app-grid').style.cursor = 'pointer';
                document.getElementById('toolbar-view').style.display = 'none';
                document.getElementById('toolbar-edit').style.display = 'block';

                setTimeout(() => {

                    let buttons = [];

                    if (app.account['access_photo_delete']) buttons.push('delete-button');
                    if (app.account['access_photo_edit']) buttons.push('edit-button');

                    [
                        ... buttons,
                        'download-button',
                        'back-button',

                        'all-button'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                }, 50);

            }, 200);

        });

    },

    // delete

    getDeleteButtonHTML: () => {

        return '' +
            '<button ' +
                'id="delete-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-delete"></i>' +
            '</button>';

    },

    initDelete: () => {

        console.log('init delete');

    },

    // edit

    getEditButtonHTML: () => {

        return '' +
            '<button ' +
                'id="edit-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-pencil"></i>' +
            '</button>';

    },

    initEdit: () => {

        console.log('init edit');

    },

    // download

    getDownloadButtonHTML: () => {

        return '' +
            '<button ' +
                'id="download-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-download"></i>' +
            '</button>';

    },

    initDownload: () => {

        console.log('init download');

    },

    // back

    getBackButtonHTML: () => {

        return '' +
            '<button ' +
                'id="back-button" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out red"' +
            '>' +
                '<i class="mdi mdi-close-thick white-text"></i>' +
            '</button>';

    },

    initBack: () => {

        document.getElementById('back-button').addEventListener('click', () => {

            app.scene.gallery.selected.forEach(id => document.querySelector('[data-id="' + id + '"]').classList.remove('select'));

            let buttons = [];

            if (app.account['access_photo_delete']) buttons.push('delete-button');
            if (app.account['access_photo_edit']) buttons.push('edit-button');

            [
                ... buttons,
                'download-button',
                'back-button',

                'all-button',

                'left-button',
                'right-button'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                document.getElementById('preview-modal').style.display = '';
                document.getElementById('app-grid').style.cursor = '';
                document.getElementById('toolbar-edit').style.display = 'none';
                document.getElementById('toolbar-view').style.display = 'block';
                document.body.style.overflow = '';
                app.scene.gallery.selected = [];

                setTimeout(() => {

                    [
                        'view-button',
                        'calendar-button',
                        'search-button',
                        'select-button'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                }, 50);

            }, 200);

        });

    },

    // all

    getAllButtonHTML: () => {

        return '' +
            '<button ' +
                'id="all-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light scale-transition scale-out" ' +
                'style="position: fixed; top: 8px; right: 8px; z-index: 2;"' +
            '>' +
                '<i class="mdi mdi-check-all"></i>' +
            '</button>';

    },

    initAll: () => {

        console.log('init all');

    },

    // left

    getLeftButtonHTML: () => {

        return '' +
            '<button ' +
                'id="left-button" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out" ' +
                'style="position: fixed; top: 50%; left: 8px; z-index: 2;"' +
            '>' +
                '<i class="mdi mdi-arrow-left-thick"></i>' +
            '</button>';

    },

    initLeft: () => {

        document.getElementById('left-button').addEventListener('click', () => {

            let id = app.scene.gallery.selected[0];
            let photo = app.scene.gallery.photos.find(photo => photo.id === id);
            let index = app.scene.gallery.photos.indexOf(photo);

            if (index > 0) {

                id = app.scene.gallery.photos[index - 1].id;
                document.getElementById('preview-modal').style.backgroundImage = 'url(/photo/preview/' + id + ')';
                app.scene.gallery.selected = [id];

            }

        });

    },

    // right

    getRightButtonHTML: () => {

        return '' +
            '<button ' +
                'id="right-button" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out" ' +
                'style="position: fixed; top: 50%; right: 8px; z-index: 2;"' +
            '>' +
                '<i class="mdi mdi-arrow-right-thick"></i>' +
            '</button>';

    },

    initRight: () => {

        document.getElementById('right-button').addEventListener('click', () => {

            let id = app.scene.gallery.selected[0];
            let photo = app.scene.gallery.photos.find(photo => photo.id === id);
            let index = app.scene.gallery.photos.indexOf(photo);

            if (index < app.scene.gallery.photos.length - 1) {

                id = app.scene.gallery.photos[index + 1].id;
                document.getElementById('preview-modal').style.backgroundImage = 'url(/photo/preview/' + id + ')';
                app.scene.gallery.selected = [id];

            }

        });

    }

};