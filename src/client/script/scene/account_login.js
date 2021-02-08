app.scene.account_login = {

    id: 'account_login',

    show: () => new Promise((resolve, reject) => {

        document.getElementById('app').innerHTML = 'account_login';

        app.activeScene = app.scene.account_login;
        resolve();

    }),

    close: () => new Promise((resolve, reject) => {

        app.activeScene = null;
        resolve();

    })

};