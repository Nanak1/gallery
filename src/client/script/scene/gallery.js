app.scene.gallery = {

    id: 'gallery',

    px: 256,
    page: 0,

    loading: false,
    finish: false,

    years: [],
    months: [],
    days: [],

    columns: null,
    resizeTimeoutId: null,

    show: () => new Promise((resolve, reject) => {

        document.getElementById('app').style.fontSize = '0';
        window.addEventListener('resize', app.scene.gallery.onResize);

        app.scene.gallery.loadDateCreate('year').then(() => {
            app.scene.gallery.loadDateCreate('month').then(() => {
                app.scene.gallery.loadDateCreate('day').then(() => {

                    app.scene.gallery.start().then(() => {

                        app.activeScene = app.scene.gallery;
                        resolve();

                    });

                });
            });
        });

    }),

    close: () => new Promise((resolve, reject) => {

        window.removeEventListener('resize', app.scene.gallery.onResize);
        window.removeEventListener('scroll', app.scene.gallery.onScroll);

        app.scene.gallery.resizeTimeoutId = null;
        app.activeScene = null;
        resolve();

    }),

    start: () => new Promise((resolve, reject) => {

        if (!app.scene.gallery.columns) {

            let width = Math.ceil(window.innerWidth * window.devicePixelRatio);

            app.scene.gallery.columns = Math.ceil(width / app.scene.gallery.px);

        }

        app.scene.gallery.page = 0;
        app.scene.gallery.finish = false;
        document.getElementById('app').innerHTML = '';
        window.removeEventListener('scroll', app.scene.gallery.onScroll);

        app.scene.gallery.loadPage().then(() => {
            app.scene.gallery.loadPage().then(() => {

                if (!app.scene.gallery.finish) window.addEventListener('scroll', app.scene.gallery.onScroll);

                resolve();

            });
        });

    }),

    loadPage: () => new Promise((resolve, reject) => {

        if (app.scene.gallery.loading || app.scene.gallery.finish) resolve();
        else {

            app.scene.gallery.loading = true;
            app.scene.gallery.page++;

            let width = Math.ceil(window.innerWidth * window.devicePixelRatio);
            let height = Math.ceil(window.innerHeight * window.devicePixelRatio);
            let rows = Math.ceil(app.scene.gallery.columns * height / width);
            let count = app.scene.gallery.columns * rows;

            axios.get('/photo', {
                params: {
                    count: count,
                    page: app.scene.gallery.page,
                    years: app.scene.gallery.years,
                    months: app.scene.gallery.months,
                    days: app.scene.gallery.days
                }
            }).then(res => {

                if (res.data.photos.length > 0) {

                    let percent = 100 / app.scene.gallery.columns;
                    let html = '';

                    res.data.photos.forEach(photo => {

                        let params = [
                            `src="/photo/thumbnail/${photo.id}"`,
                            `width="256"`,
                            `height="256"`,
                            `style="width: ${percent}%; height: ${percent}%;"`
                        ];

                        html += `<img ${params.join(' ')}>`;

                    });


                    document.getElementById('app').innerHTML += html;

                }

                if (res.data.photos.length < count) {

                    window.removeEventListener('scroll', app.scene.gallery.onScroll);
                    app.scene.gallery.finish = true;

                }

                app.scene.gallery.loading = false;
                resolve();

            });

        }

    }),

    loadDateCreate: part => new Promise((resolve, reject) => {

        axios.get('/photo/date_create/' + part).then(res => {

            app.scene.gallery[part + 's'] = res.data[part + 's'];
            resolve();

        });

    }),

    onScroll: () => {

        if (window.scrollY + window.innerHeight > document.documentElement.offsetHeight - window.innerHeight) {
            app.scene.gallery.loadPage();
        }

    },

    onResize: () => {

        clearTimeout(app.scene.gallery.resizeTimeoutId);
        app.scene.gallery.resizeTimeoutId = setTimeout(() => {

            app.scene.gallery.start();

        }, 250);

    }

};