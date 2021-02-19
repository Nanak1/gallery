app.scene.cloud = {

    id: 'cloud',

    show: () => new Promise((resolve, reject) => {

        let html = '';

        html += app.scene.cloud.getMenuHTML();
        html += app.scene.cloud.getBackButtonHTML();

        document.getElementById('app').innerHTML = html;

        app.scene.cloud.initBack();

        setTimeout(() => {

            document.getElementById('back-button').classList.remove('scale-out');

            app.activeScene = app.scene.cloud;
            resolve();

        }, 100);

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

    getMenuHTML: () => {

        return '' +
            '<div class="container">' +
                '<div class="row">' +
                    '<div class="col s12 offset-m2 m8 offset-l3 l6 offset-xl4 xl4">' +

                        '<h3>Облако</h3>' +

                    '</div>' +
                '</div>' +
            '</div>';

    },

    // back

    getBackButtonHTML: () => {

        let padding = 8;
        let diameter = 56;
        let left = 0 - Math.round(diameter / 2);

        return '' +
            '<button ' +
                'id="back-button" ' +
                'class="btn-floating btn-large waves-effect waves-light blue-grey scale-transition scale-out" ' +
                'style="position: fixed; left: 50%; bottom: ' + padding + 'px; margin-left: ' + left + 'px; z-index: 2;"' +
            '>' +
                '<i class="mdi mdi-close"></i>' +
            '</button>';

    },

    initBack: () => {

        document.getElementById('back-button').addEventListener('click', () => {

            document.getElementById('back-button').classList.add('scale-out');

            setTimeout(() => {

                app.scene.cloud.close();
                app.scene.menu.show();

            }, 250);

        });

    }

};