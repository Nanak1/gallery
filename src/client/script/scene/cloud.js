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

                app.scene.cloud.initSync();
                app.scene.cloud.initBack();

                setTimeout(() => {

                    let buttons = [];

                    if (app.account['access_cloud']) buttons.push('sync-button');

                    [
                        ... buttons,
                        'back-button'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

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
                    '<div id="cloud-info" class="col s12 offset-m2 m8 offset-l3 l6 offset-xl4 xl4">' +

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
        let slash = '<span style="margin: 0 5px;">/</span>';

        app.scene.cloud.files.forEach(file => {

            html += '<div data-file="' + file + '" class="collection-item">' + file.split('/').join(slash) + '</div>';

        });

        return '<div class="collection">' + html + '</div>';

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

                for (let i = 0; i < app.scene.cloud.files.length; i++) {

                    let file = app.scene.cloud.files[i];
                    let el = document.querySelector(`[data-file="${file}"]`);

                    el.classList.add('yellow');

                    axios({
                        method: 'MOVE',
                        url: '/cloud',
                        data: {
                            username: app.scene.cloud.user.username,
                            file: file
                        }
                    }).then(res => {
                        console.log('then', res.data);
                    }).catch(error => {
                        console.log('error', error);
                    });

                    // cloud::read



                    // cloud::move

                }

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