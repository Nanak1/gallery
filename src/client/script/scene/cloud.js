app.scene.cloud = {

    id: 'cloud',

    show: username => new Promise((resolve, reject) => {

        app.scene.cloud.user = username ? app.users.find(user => user.username === username) : app.account;
        document.getElementById('app').innerHTML = app.scene.cloud.getCloudHTML();

        axios.get('/cloud', {
            params: {
                username: username
            }
        }).then(res => {

            if (res.data.success) {

                app.scene.cloud.files = res.data.files;

                // cloud

                document.getElementById('photo-count').innerText = app.scene.cloud.files.length;
                document.getElementById('photo-count-unit').innerText = app.tool.format.getUnitEnding(
                    app.scene.cloud.files.length,
                    'фотография',
                    'фотографии',
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

                if (app.account.access_cloud) buttons.push(app.scene.cloud.getSyncButtonHTML());

                let toolbar = app.tool.toolbar.getHTML('toolbar-cloud', [
                    ... buttons,
                    app.scene.cloud.getBackButtonHTML()
                ]);

                document.getElementById('app').insertAdjacentHTML('beforeend', toolbar);

                // init

                app.scene.cloud.initBack();

                setTimeout(() => {

                    let buttons = [];

                    if (app.account.access_cloud) buttons.push('sync-button');

                    [
                        ... buttons,
                        'back-button'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                    app.activeScene = app.scene.cloud;
                    resolve();

                }, 100);

            }

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
                                '<div class="grey-text">Сканирование</div>' +
                                '<div>' + app.scene.cloud.user.cloud_scan.split('/').join(slash) + '</div>' +
                            '</div>' +
                            '<div class="collection-item">' +
                                '<div class="grey-text">Синхронизация</div>' +
                                '<div>' + app.scene.cloud.user.cloud_sync.split('/').join(slash) + '</div>' +
                            '</div>' +
                            '<div class="collection-item">' +
                                '<div class="grey-text">Найдено</div>' +
                                '<div><span id="photo-count">...</span> <span id="photo-count-unit"></span></div>' +
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

            html += '<div class="collection-item">' + file.split('/').join(slash) + '</div>';

        });

        return '<div class="collection">' + html + '</div>';

    },

    // sync

    getSyncButtonHTML: () => {

        return '' +
            '<button ' +
                'id="sync-button" ' +
                'class="disabled btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-sync"></i>' +
            '</button>';

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

            if (app.account.access_cloud) buttons.push('sync-button');

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