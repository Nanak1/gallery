window.addEventListener('load', () => {

    app.init().then(() => {

        axios.get('/account').then(res => {

            if (res.data.success) {

                app.account = res.data.account;
                app.scene.gallery.show();

            } else app.scene.account_login.show();

        });

    });

});

window.app = {

    tools: [
        'format',
        'toolbar'
    ],

    scenes: [
        'account_login',
        'gallery',
        'menu'
    ],

    tool: {},
    scene: {},

    activeScene: null,

    init: () => new Promise(async (resolve, reject) => {

        /**
         * Инструменты
         */

        for (let i = 0; i < app.tools.length; i++) {

            let tool = app.tools[i];

            if (!app.tool[tool]) await app.loadScript('/src/client/script/tool/' + tool + '.js');

        }

        delete app.tools;

        /**
         * Сцены
         */

        for (let i = 0; i < app.scenes.length; i++) {

            let scene = app.scenes[i];

            if (!app.scene[scene]) await app.loadScript('/src/client/script/scene/' + scene + '.js');

        }

        delete app.scenes;

        resolve();

    }),

    loadScript: url => new Promise((resolve, reject) => {

        let script = document.createElement('script');

        script.onload = () => resolve(script);
        script.src = url;

        document.body.appendChild(script);

    })

};