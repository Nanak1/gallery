app.scene.gallery = {

    id: 'gallery',

    show: () => new Promise((resolve, reject) => {

        document.getElementById('app').innerHTML = 'gallery';

        app.activeScene = app.scene.gallery;
        resolve();

    }),

    close: () => new Promise((resolve, reject) => {

        app.activeScene = null;
        resolve();

    })

};