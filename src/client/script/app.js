window.addEventListener('load', () => {

    app.init().then(() => {

        console.log('app is running');

    });

});

window.app = {

    tools: [
        'format',
        'toolbar'
    ],

    scenes: [
        'account_login',
        'cloud',
        'gallery',
        'menu',
        'tag'
    ],

    tool: {},
    scene: {},

    init: () => new Promise(async (resolve, reject) => {

        // Инструменты

        if (app.tools) {

            for (let i = 0; i < app.tools.length; i++) {

                let tool = app.tools[i];

                if (!app.tool[tool]) await app.loadScript('/src/client/script/tool/' + tool + '.js');

            }

            delete app.tools;

        }

        // Сцены

        if (app.scenes) {

            for (let i = 0; i < app.scenes.length; i++) {

                let scene = app.scenes[i];

                if (!app.scene[scene]) await app.loadScript('/src/client/script/scene/' + scene + '.js');

            }

            delete app.scenes;

        }

        // аккаунт

        axios.get('/account').then(res => {

            if (res.data.success) {

                app.account = res.data.account;

                // пользователи

                axios.get('/user').then(res => {

                    if (res.data.success) {

                        app.users = res.data.users;
                        app.scene.gallery.show().then(resolve);

                    } else app.scene.account_login.show().then(() => {

                        M.toast({html: 'Что-то пошло не так о_О'});
                        resolve();

                    });

                });

            } else app.scene.account_login.show().then(resolve);

        });

    }),

    loadScript: url => new Promise((resolve, reject) => {

        let script = document.createElement('script');

        script.onload = () => resolve(script);
        script.src = url;

        document.body.appendChild(script);

    })

};