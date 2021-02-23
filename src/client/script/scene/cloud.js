app.scene.cloud = {

    id: 'cloud',

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

                document.getElementById('scan-count').innerText = app.scene.cloud.files.length.toString();
                document.getElementById('scan-count-unit').innerText = app.tool.format.getUnitEnding(
                    app.scene.cloud.files.length,
                    'фотографии',
                    'фотографий',
                    'фотографий'
                );

                // files

                let el = document.getElementById('cloud-info');

                if (app.scene.cloud.files.length > 0) {

                    el.insertAdjacentHTML('beforeend', '<h3>Фотографии</h3>');
                    el.insertAdjacentHTML('beforeend', app.scene.cloud.getFilesHTML());

                }

                // buttons

                let buttons = [];

                if (app.account['access_cloud']) buttons.push(app.scene.cloud.getSyncButtonHTML());

                let toolbar = app.tool.toolbar.getHTML('toolbar-cloud', [
                    ... buttons,
                    app.scene.cloud.getBackButtonHTML()
                ]);

                document.getElementById('app').insertAdjacentHTML('beforeend', toolbar);

                // init

                if (app.account['access_cloud']) app.scene.cloud.initSync();
                app.scene.cloud.initBack();

                setTimeout(() => {

                    let buttons = [];

                    if (app.account['access_cloud']) buttons.push('sync-button');

                    [
                        ... buttons,
                        'back-button'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
                        html: 'Ожидает синхронизации',
                        position: 'left'
                    });

                    app.activeScene = app.scene.cloud;
                    resolve();

                }, 100);

            } else M.toast({
                html: res.data.message
            });

        });

    }),

    close: () => new Promise((resolve, reject) => {

        // before clear

        // clear

        document.getElementById('app').innerHTML = '';

        // after clear

        // end

        app.activeScene = null;
        resolve();

    }),

    // cloud

    getCloudHTML: () => {

        let slash = '<span style="margin: 0 5px;">/</span>';

        return '' +
            '<div class="container">' +
                '<div class="row">' +
                    '<div id="cloud-info" class="col s12 offset-m1 m10 offset-l2 l8 offset-xl3 xl6">' +

                        '<h3>Облако</h3>' +

                        '<div class="collection">' +
                            '<div class="collection-item">' +
                                '<div class="grey-text">Имя пользователя</div>' +
                                '<div>' + app.scene.cloud.user.username + '</div>' +
                            '</div>' +
                            '<div class="collection-item">' +
                                '<div class="grey-text">Директория поиска</div>' +
                                '<div>' + app.scene.cloud.user.cloud_scan.split('/').join(slash) + '</div>' +
                            '</div>' +
                            '<div class="collection-item">' +
                                '<div class="grey-text">Директория результата</div>' +
                                '<div>' + app.scene.cloud.user.cloud_sync.split('/').join(slash) + '</div>' +
                            '</div>' +
                            '<div class="collection-item">' +
                                '<div class="grey-text">Синхронизировано</div>' +
                                '<div>' +
                                    '<snan id="sync-count">0</snan>' +
                                    ' из ' +
                                    '<span id="scan-count">?</span>' +
                                    ' ' +
                                    '<span id="scan-count-unit">...</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>' +
            '</div>';

    },

    // files

    getFilesHTML: () => {

        let html = '';
        let slash = ' <span class="grey-text">/</span> ';

        app.scene.cloud.files.forEach(file => {

            html += '' +
                '<tr>' +
                    '<td>' + file.split('/').join(slash) + '</td>' +
                    '<td ' +
                        'data-file="' + file + '" ' +
                        'class="grey-text gallery-table-mdi center-align" ' +
                        'style="cursor: help;" ' +
                        'data-color="grey-text"' +
                    '>' +
                        '<i class="mdi mdi-timer-outline tooltipped" data-icon="mdi-timer-outline"></i>' +
                    '</td>' +
                '</tr>';

        });

        return '' +
            '<table class="highlight gallery-table">' +
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
                'id="sync-button" ' +
                'class="btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-sync"></i>' +
            '</button>';

    },

    initSync: () => {

        document.getElementById('sync-button').addEventListener('click', () => {

            [
                'sync-button',
                'back-button'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                let i = 0;

                let status = (el, color, icon, html) => {

                    el.classList.remove(el.dataset.color);
                    el.classList.add(color);
                    el.dataset.color = color;

                    el = el.querySelector('i');

                    el.classList.remove(el.dataset.icon);
                    el.classList.add(icon);
                    el.dataset.icon = icon;

                    M.Tooltip.getInstance(el).options.html = html;

                };

                let end = () => {

                    i++;

                    document.getElementById('sync-count').innerText = i.toString();

                    if (i < app.scene.cloud.files.length) sync();
                    else {

                        let el = document.getElementById('toolbar-cloud');

                        let left = parseInt(el.style.marginLeft);
                        let diameter = Math.round(el.clientHeight / 2);
                        let padding = Math.round(parseInt(el.style.bottom) / 2);

                        el.style.marginLeft = (left - diameter - padding).toString() + 'px';

                        document.getElementById('back-button').classList.remove('scale-out');

                    }

                };

                let sync = () => {

                    let file = app.scene.cloud.files[i];
                    let el = document.querySelector('[data-file="' + file + '"]');

                    status(el, 'blue-text', 'mdi-image-plus', 'Добавление в БД');

                    axios.post('/photo/cloud', {
                        username: app.scene.cloud.user.username,
                        file: file
                    }).then(res => {

                        if (res.data.success) {

                            if (res.data.id) {

                                status(el, 'cyan-text', 'mdi-image-move', 'Перенос в папку');

                                axios.post('/cloud', {
                                    username: app.scene.cloud.user.username,
                                    file: file,
                                    id: res.data.id
                                }).then(res => {

                                    if (res.data.success) {

                                        status(el, 'green-text', 'mdi-checkbox-marked-circle-outline', 'Завершено');
                                        end();

                                    } else {

                                        status(el, 'red-text', 'mdi-image-off', res.data.message);
                                        console.log(res.data);
                                        end();

                                    }

                                }).catch(error => {

                                    console.log(error);
                                    status(el, 'red-text', 'mdi-image-off', 'Ошибка при запросе на перенос');
                                    end();

                                });

                            } else if (res.data.status === 'HASH_ALREADY_EXIST') {

                                status(el, 'orange-text', 'mdi-image-remove', 'Пропуск дубликата');
                                end();

                            }

                        } else {

                            console.log(res);
                            status(el, 'red-text', 'mdi-image-off', 'Ошибка создания');
                            end();

                        }

                    }).catch(error => {

                        console.log(error);
                        status(el, 'red-text', 'mdi-image-off', 'Ошибка при запросе на создание');
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
                'id="back-button" ' +
                'class="btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-close"></i>' +
            '</button>';

    },

    initBack: () => {

        document.getElementById('back-button').addEventListener('click', () => {

            let buttons = [];

            if (app.account['access_cloud']) buttons.push('sync-button');

            [
                ... buttons,
                'back-button'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                app.scene.cloud.close();
                app.scene.menu.show();

            }, 250);

        });

    }

};