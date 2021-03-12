app.scene.menu = {

    show: () => new Promise((resolve, reject) => {

        let html = '';

        html += app.scene.menu.getMenuHTML();
        html += app.scene.menu.getBackButtonHTML();

        document.getElementById('app').innerHTML = html;

        app.scene.menu.initTag();
        app.scene.menu.initCloud();
        app.scene.menu.initBack();

        setTimeout(() => {

            document.getElementById('button-back').classList.remove('scale-out');

            resolve();

        }, 100);

    }),

    close: () => new Promise((resolve, reject) => {

        // before clear

        // clear

        document.getElementById('app').innerHTML = '';

        // after clear

        // end

        resolve();

    }),

    getMenuHTML: () => {

        return '' +
            '<div class="container">' +
                '<div class="row">' +
                    '<div class="col s12 offset-m2 m8 offset-l3 l6 offset-xl4 xl4">' +

                        '<h3 class="app-h3">Меню</h3>' +

                        '<div class="collection app-collection">' +
                            '<div id="button-account" class="collection-item app-icon app-button app-disabled">' +
                                '<i class="mdi mdi-account"></i>' +
                                '<div>Аккаунт</div>' +
                            '</div>' +
                            '<div id="button-tag" class="collection-item app-icon app-button">' +
                                '<i class="mdi mdi-tag"></i>' +
                                '<div>Теги</div>' +
                            '</div>' +
                            '<div id="button-cloud" class="collection-item app-icon app-button">' +
                                '<i class="mdi mdi-cloud"></i>' +
                                '<div>Облако</div>' +
                            '</div>' +
                            '<div id="button-stat" class="collection-item app-icon app-button app-disabled">' +
                                '<i class="mdi mdi-chart-line"></i>' +
                                '<div>Статистика</div>' +
                            '</div>' +
                            '<div id="button-user" class="collection-item app-icon app-button app-disabled">' +
                                '<i class="mdi mdi-account-multiple"></i>' +
                                '<div>Пользователи</div>' +
                            '</div>' +
                            '<div id="button-system" class="collection-item app-icon app-button app-disabled">' +
                                '<i class="mdi mdi-cog"></i>' +
                                '<div>Система</div>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="app-toolbar-space"></div>';

    },

    // tag

    initTag: () => {

        document.getElementById('button-tag').addEventListener('click', () => {

            document.getElementById('button-back').classList.add('scale-out');

            setTimeout(() => {

                app.scene.menu.close();
                app.scene.tag.show();

            }, 250);

        });

    },

    // cloud

    initCloud: () => {

        document.getElementById('button-cloud').addEventListener('click', () => {

            document.getElementById('button-back').classList.add('scale-out');

            setTimeout(() => {

                app.scene.menu.close();
                app.scene.cloud.show();

            }, 250);

        });

    },

    // back

    getBackButtonHTML: () => {

        let padding = 8;
        let diameter = 56;
        let left = 0 - Math.round(diameter / 2);

        return '' +
            '<button ' +
                'id="button-back" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out app-primary" ' +
                'style="position: fixed; left: 50%; bottom: ' + padding + 'px; margin-left: ' + left + 'px; z-index: 2;"' +
            '>' +
                '<i class="mdi mdi-undo"></i>' +
            '</button>';

    },

    initBack: () => {

        document.getElementById('button-back').addEventListener('click', () => {

            document.getElementById('button-back').classList.add('scale-out');

            setTimeout(() => {

                app.scene.menu.close();
                app.scene.gallery.show();

            }, 250);

        });

    }

};