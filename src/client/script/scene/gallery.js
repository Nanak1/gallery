app.scene.gallery = {

    id: 'gallery',

    show: () => new Promise((resolve, reject) => {

        let x = Math.ceil(window.innerWidth / 256);
        let y = Math.ceil(window.innerHeight / 256);

        axios.get('/photo', {
            params: {
                count: x * (y + 1),
                page: 1
            }
        }).then(res => {

            let percent = 100 / x;
            let html = '';

            for (let i = 0; i < res.data.photos.length; i++) {

                let id = res.data.photos[i].id;

                html += '<img src="/photo/thumbnail/' + id + '" width="256" height="256" style="width: ' + percent + '%; height: ' + percent + '%;">';

            }

            document.getElementById('app').style.fontSize = '0';
            document.getElementById('app').innerHTML = html;

            app.activeScene = app.scene.gallery;
            resolve();

        });

    }),

    close: () => new Promise((resolve, reject) => {

        app.activeScene = null;
        resolve();

    })

};