app.scene.account_login = {

    id: 'account_login',

    show: () => new Promise((resolve, reject) => {

        document.getElementById('app').innerHTML = '' +

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

            '<a id="login" class="waves-effect waves-light btn">Войти</a>' +

            '</div>' +
            '</div>' +
            '</div>';


        document.getElementById('login').addEventListener('click', app.scene.account_login.onClick);
        document.getElementById('username').addEventListener('keyup', app.scene.account_login.onKeyUp);
        document.getElementById('password').addEventListener('keyup', app.scene.account_login.onKeyUp);

        app.activeScene = app.scene.account_login;
        resolve();

    }),

    close: () => new Promise((resolve, reject) => {

        app.activeScene = null;
        resolve();

    }),

    onKeyUp: event => {

        if (event.code === 'Enter') app.scene.account_login.onClick();

    },

    onClick: () => {

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