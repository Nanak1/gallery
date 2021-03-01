app.scene.cloud = {

    user: null,

    files: [],

    show: username => new Promise((resolve, reject) => {

        app.scene.cloud.user = username ? app.users.find(user => user.username === username) : app.account;
        app.scene.cloud.files = [];

        document.getElementById('app').innerHTML = app.scene.cloud.getCloudHTML();

        // cloud::scan

        axios.get('/cloud', {
            params: {
                username: app.scene.cloud.user.username
            }
        }).then(res => {

            if (res.data.success) {

                app.scene.cloud.files = res.data.files;

                // cloud

                document.getElementById('cloud-scan-count').innerText = app.scene.cloud.files.length.toString();
                document.getElementById('cloud-scan-count-unit').innerText = app.tool.format.getUnitEnding(
                    app.scene.cloud.files.length,
                    'фотографии',
                    'фотографий',
                    'фотографий'
                );

                // files

                let el = document.getElementById('cloud-info');

                if (app.scene.cloud.files.length > 0) {

                    el.insertAdjacentHTML('beforeend', '<h3 class="app-h3">Фотографии</h3>');
                    el.insertAdjacentHTML('beforeend', app.scene.cloud.getFilesHTML());

                }

                // buttons

                let buttons = [];

                if (app.account['access_cloud'] && app.scene.cloud.files.length) buttons.push(app.scene.cloud.getSyncButtonHTML());

                let toolbar = app.tool.toolbar({
                    id: 'toolbar-cloud',
                    buttons: [
                        ... buttons,
                        app.scene.cloud.getBackButtonHTML()
                    ]
                });

                document.getElementById('app').insertAdjacentHTML('beforeend', toolbar);

                // init

                if (app.account['access_cloud'] && app.scene.cloud.files.length) app.scene.cloud.initSync();
                app.scene.cloud.initBack();

                setTimeout(() => {

                    let buttons = [];

                    if (app.account['access_cloud'] && app.scene.cloud.files.length) buttons.push('button-sync');

                    [
                        ... buttons,
                        'button-back'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
                        html: 'Ожидает синхронизации',
                        position: 'left'
                    });

                    resolve();

                }, 100);

            } else M.toast({
                html: res.data.message
            });

        });

    }),

    close: () => new Promise((resolve, reject) => {

        // before clear

        document.querySelectorAll('.tooltipped').forEach(el => {
            M.Tooltip.getInstance(el).destroy();
        });

        // clear

        document.getElementById('app').innerHTML = '';

        // after clear

        // end

        resolve();

    }),

    // cloud

    getCloudHTML: () => {

        let slash = '<span style="margin: 0 5px;">/</span>';

        return '' +
            '<div class="container">' +
                '<div class="row">' +
                    '<div id="cloud-info" class="col s12 offset-m1 m10 offset-l2 l8 offset-xl3 xl6">' +

                        '<h3 class="app-h3">Облако</h3>' +

                        '<div class="collection app-collection">' +
                            '<div class="collection-item app-icon app-icon-mt2">' +
                                '<i class="mdi mdi-account"></i>' +
                                '<div class="app-title">Имя пользователя</div>' +
                                '<div>' + app.scene.cloud.user.username + '</div>' +
                            '</div>' +
                            '<div class="collection-item app-icon app-icon-mt2">' +
                                '<i class="mdi mdi-cloud-search"></i>' +
                                '<div class="app-title">Директория поиска</div>' +
                                '<div>' + app.scene.cloud.user.cloud_scan.split('/').join(slash) + '</div>' +
                            '</div>' +
                            '<div class="collection-item app-icon app-icon-mt2">' +
                                '<i class="mdi mdi-cloud-download"></i>' +
                                '<div class="app-title">Директория результата</div>' +
                                '<div>' + app.scene.cloud.user.cloud_sync.split('/').join(slash) + '</div>' +
                            '</div>' +
                            '<div class="collection-item app-icon app-icon-mt2">' +
                                '<i class="mdi mdi-cloud-refresh"></i>' +
                                '<div class="app-title">Синхронизировано</div>' +
                                '<div>' +
                                    '<snan id="cloud-sync-count">0</snan>' +
                                    ' из ' +
                                    '<span id="cloud-scan-count">?</span>' +
                                    ' ' +
                                    '<span id="cloud-scan-count-unit">...</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="app-toolbar-space"></div>';

    },

    // files

    getFilesHTML: () => {

        let html = '';
        let slash = ' <span class="grey-text text-darken-1">/</span> ';

        app.scene.cloud.files.forEach(file => {

            html += '' +
                '<tr>' +
                    '<td>' + file.split('/').join(slash) + '</td>' +
                    '<td ' +
                        'data-file="' + file + '" ' +
                        'class="app-column-icon" ' +
                        'style="cursor: help;" ' +
                    '>' +
                        '<i class="mdi mdi-timer-outline tooltipped" data-icon="mdi-timer-outline"></i>' +
                    '</td>' +
                '</tr>';

        });

        return '' +
            '<table>' +
                '<thead>' +
                    '<tr>' +
                        '<th>Расположение</th>' +
                        '<th>Статус</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' +
                    '<tr>' + html + '</tr>' +
                '</tbody>' +
            '</table>';

    },

    // sync

    getSyncButtonHTML: () => {

        return '' +
            '<button ' +
                'id="button-sync" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-sync"></i>' +
            '</button>';

    },

    initSync: () => {

        document.getElementById('button-sync').addEventListener('click', () => {

            [
                'button-sync',
                'button-back'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                let i = 0;

                let status = (el, color, icon, html) => {

                    el.style.color = color;

                    el = el.querySelector('i');

                    el.classList.remove(el.dataset.icon);
                    el.classList.add(icon);
                    el.dataset.icon = icon;

                    M.Tooltip.getInstance(el).options.html = html;

                };

                let end = () => {

                    i++;

                    document.getElementById('cloud-sync-count').innerText = i.toString();

                    if (i < app.scene.cloud.files.length) sync();
                    else document.getElementById('button-back').classList.remove('scale-out');

                };

                let sync = () => {

                    let file = app.scene.cloud.files[i];
                    let el = document.querySelector('[data-file="' + file + '"]');

                    status(el, '', 'mdi-image-plus', 'Добавление в БД');

                    axios.post('/photo/cloud', {
                        username: app.scene.cloud.user.username,
                        file: file
                    }).then(res => {

                        if (res.data.success) {

                            if (res.data.id) {

                                status(el, '', 'mdi-image-move', 'Перенос в папку');

                                axios.post('/cloud', {
                                    username: app.scene.cloud.user.username,
                                    file: file,
                                    id: res.data.id
                                }).then(res => {

                                    if (res.data.success) {

                                        status(el, '#00e5ff', 'mdi-cloud-check', 'Завершено');
                                        end();

                                    } else {

                                        status(el, '#f44336', 'mdi-image-off', res.data.message);
                                        console.log(res);
                                        end();

                                    }

                                }).catch(error => {

                                    console.log(error);
                                    status(el, '#f44336', 'mdi-image-off', 'Ошибка при запросе на перенос');
                                    end();

                                });

                            } else if (res.data.status === 'HASH_ALREADY_EXIST') {

                                status(el, '#757575', 'mdi-image-remove', 'Пропуск дубликата');
                                end();

                            } else {

                                status(el, '#f44336', 'mdi-image-remove', 'Что-то пошло не так');
                                end();

                            }

                        } else {

                            console.log(res);
                            status(el, '#f44336', 'mdi-image-off', 'Ошибка создания');
                            end();

                        }

                    }).catch(error => {

                        console.log(error);
                        status(el, '#f44336', 'mdi-image-off', 'Ошибка при запросе на создание');
                        end();

                    });

                };

                sync();

            }, 200);

        });

    },

    // back

    getBackButtonHTML: () => {

        return '' +
            '<button ' +
                'id="button-back" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out app-primary"' +
            '>' +
                '<i class="mdi mdi-close-thick"></i>' +
            '</button>';

    },

    initBack: () => {

        document.getElementById('button-back').addEventListener('click', () => {

            let buttons = [];

            if (app.account['access_cloud'] && app.scene.cloud.files.length) buttons.push('button-sync');

            [
                ... buttons,
                'button-back'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                app.scene.cloud.close();
                app.scene.menu.show();

            }, 250);

        });

    }

};