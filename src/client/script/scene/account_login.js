app.scene.account_login = {

    id: 'account_login',

    show: () => new Promise((resolve, reject) => {

        document.getElementById('app').innerHTML = app.scene.account_login.getHTML();

        app.scene.account_login.init();

        app.activeScene = app.scene.account_login;
        resolve();

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

                        '<button id="login" class="waves-effect waves-light btn">Войти</button>' +

                    '</div>' +
                '</div>' +
            '</div>';

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

        document.getElementById('login').addEventListener('click', app.scene.account_login.login);

    },

    login: () => {

        axios.post('/account/login', {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        }).then(res => {

            if (res.data.success) {

                app.scene.account_login.close();
                app.scene.gallery.show();

            } else M.toast({
                html: res.data.message
            });

        });

    }

};