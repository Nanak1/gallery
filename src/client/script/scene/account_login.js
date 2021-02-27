app.scene.account_login = {

    show: () => new Promise((resolve, reject) => {

        document.getElementById('app').innerHTML = app.scene.account_login.getHTML();

        app.scene.account_login.init();

        resolve();

    }),

    close: () => new Promise((resolve, reject) => {

        // before clear

        // clear

        document.getElementById('app').innerHTML = '';

        // after clear

        // end

        resolve();

    }),

    getHTML: () => {

        return '' +
            '<div class="container">' +
                '<div class="row">' +
                    '<div class="col s12 offset-m2 m8 offset-l3 l6 offset-xl4 xl4">' +

                        '<h3>Вход</h3>' +

                        '<div class="input-field">' +
                            '<input id="username" type="text">' +
                            '<label for="username">Имя пользователя</label>' +
                        '</div>' +

                        '<div class="input-field">' +
                            '<input id="password" type="password">' +
                            '<label for="password">Пароль</label>' +
                        '</div>' +

                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="app-toolbar-space"></div>' +
            app.tool.toolbar([

                '<button ' +
                    'id="button-mask" ' +
                    'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
                '>' +
                    '<i class="mdi mdi-form-textbox-password"></i>' +
                '</button>',

                '<button ' +
                    'id="button-login" ' +
                    'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out app-btn-primary"' +
                '>' +
                    '<i class="mdi mdi-login-variant"></i>' +
                '</button>'

            ]);

    },

    init: () => {

        [
            'username',
            'password'
        ].forEach(id => {

            document.getElementById(id).addEventListener('keyup', event => {

                if (event.code === 'Enter') app.scene.account_login.login();

            });

        })

        document.getElementById('button-mask').addEventListener('click', () => {

            let el = document.getElementById('password');

            el.type = el.type === 'password' ? 'text' : 'password';

        });

        document.getElementById('button-login').addEventListener('click', app.scene.account_login.login);

        setTimeout(() => {

            [
                'button-mask',
                'button-login'
            ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

        }, 100);

    },

    login: () => {

        axios.post('/account/login', {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        }).then(res => {

            if (res.data.success) {

                app.scene.account_login.close();
                app.init();

            } else M.toast({
                html: res.data.message
            });

        });

    }

};