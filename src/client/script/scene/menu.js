app.scene.menu = {

    id: 'menu',

    show: () => new Promise((resolve, reject) => {

        let html = '';

        html += app.scene.menu.getMenuHTML();
        html += app.scene.menu.getBackButtonHTML();

        document.querySelector('.app').innerHTML = html;

        app.scene.menu.initCloud();
        app.scene.menu.initBack();

        setTimeout(() => {

            document.getElementById('back-button').classList.remove('scale-out');

            app.activeScene = app.scene.menu;
            resolve();

        }, 100);

    }),

    close: () => new Promise((resolve, reject) => {

        // before clear

        // clear

        document.querySelector('.app').innerHTML = '';

        // after clear

        // end

        app.activeScene = null;
        resolve();

    }),

    getMenuHTML: () => {

        return '' +
            '<div class="container">' +
                '<div class="row">' +
                    '<div class="col s12 offset-m2 m8 offset-l3 l6 offset-xl4 xl4">' +

                        '<h3>Меню</h3>' +

                        '<div class="collection gallery-collection">' +
                            '<div class="collection-item disabled"><i class="mdi mdi-account"></i>Аккаунт</div>' +
                            '<div class="collection-item disabled"><i class="mdi mdi-account-multiple"></i>Пользователи</div>' +
                            '<div class="collection-item disabled"><i class="mdi mdi-tag"></i>Теги</div>' +
                            '<div id="cloud-button" class="collection-item"><i class="mdi mdi-cloud"></i>Облако</div>' +
                            '<div class="collection-item disabled"><i class="mdi mdi-cog"></i>Система</div>' +
                        '</div>' +

                        '<div style="height: 56px;"></div>' +

                    '</div>' +
                '</div>' +
            '</div>';

    },

    // cloud

    initCloud: () => {

        document.getElementById('cloud-button').addEventListener('click', () => {

            document.getElementById('back-button').classList.add('scale-out');

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
                'id="back-button" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out red" ' +
                'style="position: fixed; left: 50%; bottom: ' + padding + 'px; margin-left: ' + left + 'px; z-index: 2;"' +
            '>' +
                '<i class="mdi mdi-close-thick white-text"></i>' +
            '</button>';

    },

    initBack: () => {

        document.getElementById('back-button').addEventListener('click', () => {

            document.getElementById('back-button').classList.add('scale-out');

            setTimeout(() => {

                app.scene.menu.close();
                app.scene.gallery.show();

            }, 250);

        });

    }

};