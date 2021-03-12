app.scene.tag = {

    selected: null,

    tags: [],

    show: () => new Promise((resolve, reject) => {

        app.scene.tag.initHTML();
        app.scene.tag.load().then(() => {

            app.scene.tag.initAdd();
            app.scene.tag.initBack();

            setTimeout(() => {

                let buttons = [];

                if (app.account['access_tag_add']) buttons.push('button-add');

                buttons.push('button-back');

                buttons.forEach(button => document.getElementById(button).classList.remove('scale-out'));

            });

        });

    }),

    close: () => new Promise((resolve, reject) => {

        // before clear

        // clear

        document.getElementById('app').innerHTML = '';

        // after clear

        // end

        resolve();

    }),

    load: () => new Promise((resolve, reject) => {

        axios.get('/tag', {
            params: {
                sort_column: document.querySelector('[name=sort-column]:checked').value,
                sort_direction_name: document.querySelector('[name=sort-direction-name]:checked').value,
                sort_direction_count: document.querySelector('[name=sort-direction-count]:checked').value
            }
        }).then(res => {

            if (res.data.success) {

                let el = document.getElementById('tag-rows');

                el.innerHTML = '';
                app.scene.tag.tags = res.data.tags;
                app.scene.tag.tags.forEach(tag => {

                    el.insertAdjacentHTML('beforeend', '' +
                        '<tr data-id="' + tag.id + '" class="app-button">' +
                            '<td>' + tag.name + '</td>' +
                            '<td class="right-align">' + tag.count + '</td>' +
                        '</tr>'
                    );

                    el.querySelector('[data-id="' + tag.id + '"]').addEventListener('click', event => {

                        app.scene.tag.selected = event.currentTarget.dataset.id;

                        let buttons = [];

                        if (app.account['access_tag_add']) buttons.push('button-add');

                        buttons.push('button-back');
                        buttons.forEach(button => document.getElementById(button).classList.add('scale-out'));

                        document.body.insertAdjacentHTML('afterbegin', app.scene.tag.getInfoModalHTML());
                        M.updateTextFields();

                        if (app.account['access_tag_delete']) app.scene.tag.initDelete();
                        if (app.account['access_tag_edit']) app.scene.tag.initEdit();
                        app.scene.tag.initInfo();

                        document.body.style.overflow = 'hidden';

                        setTimeout(() => {

                            document.getElementById('modal-info').style.display = 'block';

                            setTimeout(() => {

                                let buttons = [];

                                if (app.account['access_tag_delete']) buttons.push('button-delete');
                                if (app.account['access_tag_edit']) buttons.push('button-edit');

                                buttons.push('button-info-back');
                                buttons.forEach(button => document.getElementById(button).classList.remove('scale-out'));

                            }, 100);

                        }, 250);

                    });

                });

                resolve();

            } else reject();

        });

    }),

    // html

    initHTML: () => {

        let buttons = [];

        if (app.account['access_tag_add']) buttons.push(app.scene.tag.getAddButtonHTML());

        buttons.push(app.scene.tag.getBackButtonHTML());

        let columnName = '' +
            '<label>' +
                '<input name="sort-column" type="radio" value="name">' +
                ' ' +
                '<span>Название</span>' +
            '</label>';

        let columnCount = '' +
            '<label>' +
                '<input name="sort-column" type="radio" value="count" checked>' +
                ' ' +
                '<span>Количество</span>' +
            '</label>';

        let nameASC = '' +
            '<label>' +
                '<input name="sort-direction-name" type="radio" value="ASC" checked>' +
                ' ' +
                '<span><i class="mdi mdi-sort-alphabetical-ascending"></i></span>' +
            '</label>';

        let nameDESC = '' +
            '<label>' +
                '<input name="sort-direction-name" type="radio" value="DESC">' +
                ' ' +
                '<span><i class="mdi mdi-sort-alphabetical-descending"></i></span>' +
            '</label>';

        let countASC = '' +
            '<label>' +
                '<input name="sort-direction-count" type="radio" value="ASC">' +
                ' ' +
                '<span><i class="mdi mdi-sort-numeric-ascending"></i></span>' +
            '</label>';

        let countDESC = '' +
            '<label>' +
                '<input name="sort-direction-count" type="radio" value="DESC" checked>' +
                ' ' +
                '<span><i class="mdi mdi-sort-numeric-descending"></i></span>' +
            '</label>';

        document.getElementById('app').innerHTML = '' +
            '<div class="container">' +
                '<div class="row">' +
                    '<div class="col s12 offset-m1 m10 offset-l2 l8 offset-xl3 xl6">' +

                        '<h3 class="app-h3">Теги</h3>' +

                        '<table>' +
                            '<thead>' +
                                '<tr>' +
                                    '<th>' + nameASC + '</th>' +
                                    '<th class="right-align">' + countASC + '</th>' +
                                '</tr>' +
                                '<tr>' +
                                    '<th>' + nameDESC + '</th>' +
                                    '<th class="right-align">' + countDESC + '</th>' +
                                '</tr>' +
                                '<tr>' +
                                    '<th>' + columnName +'</th>' +
                                    '<th class="right-align">' + columnCount + '</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody id="tag-rows"></tbody>' +
                        '</table>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            app.tool.toolbar({
                id: 'toolbar-tag',
                buttons: buttons
            });

        [
            ... document.querySelectorAll('[name=sort-column]'),
            ... document.querySelectorAll('[name=sort-direction-name]'),
            ... document.querySelectorAll('[name=sort-direction-count]')
        ].forEach(input => {

            input.addEventListener('change', () => {

                app.scene.tag.load();

            });

        });

    },

    // info

    getInfoModalHTML: () => {

        let tag = app.scene.tag.tags.find(tag => tag.id === app.scene.tag.selected);
        let buttons = [];

        if (app.account['access_tag_delete']) buttons.push(app.scene.tag.getDeleteButtonHTML());
        if (app.account['access_tag_edit']) buttons.push(app.scene.tag.getEditButtonHTML());

        buttons.push(
            '<button ' +
                'id="button-info-back" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out app-primary"' +
            '>' +
                '<i class="mdi mdi-undo"></i>' +
            '</button>'
        );

        return '' +
            '<div id="modal-info" class="app-modal">' +
                '<div class="app-modal-content">' +

                    '<h3 class="app-h3">Описание</h3>' +

                    '<div class="input-field">' +
                        '<input disabled id="name" type="text" value="' + tag.name + '">' +
                        '<label for="name">Название</label>' +
                    '</div>' +

                    '<div class="app-toolbar-space"></div>' +

                '</div>' +

                app.tool.toolbar({
                    id: 'toolbar-info',
                    buttons: buttons
                }) +

            '</div>';

    },

    initInfo: () => {

        document.getElementById('button-info-back').addEventListener('click', () => {

            let buttons = [];

            if (app.account['access_tag_delete']) buttons.push('button-delete');
            if (app.account['access_tag_edit']) buttons.push('button-edit');

            buttons.push('button-info-back');
            buttons.forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                document.getElementById('modal-info').remove();
                document.body.style.overflow = 'overlay';

                let buttons = [];

                if (app.account['access_tag_add']) buttons.push('button-add');
                buttons.push('button-back');
                buttons.forEach(button => document.getElementById(button).classList.remove('scale-out'));

            }, 250);

        });

    },

    // add

    getAddButtonHTML: () => {

        return '' +
            '<button ' +
                'id="button-add" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-plus-thick"></i>' +
            '</button>';

    },

    getAddModalHTML: () => {

        return '' +
            '<div id="modal-add" class="app-modal">' +
                '<div class="app-modal-content">' +

                    '<h3 class="app-h3">Добавление</h3>' +

                    '<div class="input-field">' +
                        '<input id="name" type="text">' +
                        '<label for="name">Название</label>' +
                    '</div>' +

                    '<div class="app-toolbar-space"></div>' +

                '</div>' +

                app.tool.toolbar({
                    id: 'toolbar-add',
                    buttons: [

                        '<button ' +
                            'id="button-add-cancel" ' +
                            'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
                        '>' +
                            '<i class="mdi mdi-undo"></i>' +
                        '</button>',

                        '<button ' +
                            'id="button-add-apply" ' +
                            'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out app-primary"' +
                        '>' +
                            '<i class="mdi mdi-check-bold"></i>' +
                        '</button>'

                    ]
                }) +

            '</div>';

    },

    initAdd: () => {

        document.getElementById('button-add').addEventListener('click', () => {

            [
                'button-add',
                'button-back'
            ].forEach(button => document.getElementById(button).classList.add('scale-out'));

            document.body.insertAdjacentHTML('afterbegin', app.scene.tag.getAddModalHTML());

            (() => {

                // cancel

                document.getElementById('button-add-cancel').addEventListener('click', () => {

                    [
                        'button-add-cancel',
                        'button-add-apply'
                    ].forEach(button => document.getElementById(button).classList.add('scale-out'));

                    setTimeout(() => {

                        document.getElementById('modal-add').remove();
                        document.body.style.overflow = 'overlay';

                        [
                            'button-add',
                            'button-back'
                        ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                    }, 250);

                });

                // apply

                document.getElementById('button-add-apply').addEventListener('click', () => {

                    axios.post('/tag', {
                        name: document.getElementById('name').value
                    }).then(res => {

                        if (res.data.success) {

                            app.scene.tag.load().then(() => {

                                document.getElementById('button-add-cancel').click();

                            });

                        } else M.toast({
                            html: res.data.message
                        });

                    })

                });

            })();

            document.body.style.overflow = 'hidden';

            setTimeout(() => {

                document.getElementById('modal-add').style.display = 'block';

                setTimeout(() => {

                    [
                        'button-add-cancel',
                        'button-add-apply'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                }, 100);

            }, 250);

        });

    },

    // edit

    getEditButtonHTML: () => {

        return '' +
            '<button ' +
                'id="button-edit" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-pencil"></i>' +
            '</button>';

    },

    getEditModalHTML: () => {

        let tag = app.scene.tag.tags.find(tag => tag.id === app.scene.tag.selected);

        return '' +
            '<div id="modal-edit" class="app-modal">' +
                '<div class="app-modal-content">' +

                    '<h3 class="app-h3">Изменение</h3>' +

                    '<div class="input-field">' +
                        '<input id="new-name" type="text" value="' + tag.name + '">' +
                        '<label for="new-name">Название</label>' +
                    '</div>' +

                    '<div class="app-toolbar-space"></div>' +

                '</div>' +

                app.tool.toolbar({
                    id: 'toolbar-edit',
                    buttons: [

                        '<button ' +
                            'id="button-edit-cancel" ' +
                            'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
                        '>' +
                            '<i class="mdi mdi-undo"></i>' +
                        '</button>',

                        '<button ' +
                            'id="button-edit-apply" ' +
                            'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out app-primary"' +
                        '>' +
                            '<i class="mdi mdi-check-bold"></i>' +
                        '</button>'

                    ]
                }) +

            '</div>';

    },

    initEdit: () => {

        document.getElementById('button-edit').addEventListener('click', () => {

            let buttons = [];

            if (app.account['access_tag_delete']) buttons.push('button-delete');
            if (app.account['access_tag_edit']) buttons.push('button-edit');

            buttons.push('button-info-back');
            buttons.forEach(button => document.getElementById(button).classList.add('scale-out'));

            document.body.insertAdjacentHTML('afterbegin', app.scene.tag.getEditModalHTML());
            M.updateTextFields();

            (() => {

                // cancel

                document.getElementById('button-edit-cancel').addEventListener('click', () => {

                    [
                        'button-edit-cancel',
                        'button-edit-apply'
                    ].forEach(button => document.getElementById(button).classList.add('scale-out'));

                    setTimeout(() => {

                        document.getElementById('modal-info').style.display = 'block';
                        document.getElementById('modal-edit').remove();
                        document.body.style.overflow = 'overlay';

                        let buttons = [];

                        if (app.account['access_tag_delete']) buttons.push('button-delete');
                        if (app.account['access_tag_edit']) buttons.push('button-edit');

                        buttons.push('button-info-back');
                        buttons.forEach(button => document.getElementById(button).classList.remove('scale-out'));

                    }, 250);

                });

                // apply

                document.getElementById('button-edit-apply').addEventListener('click', () => {

                    axios.put('/tag', {
                        id: app.scene.tag.selected,
                        name: document.getElementById('new-name').value
                    }).then(res => {

                        if (res.data.success) {

                            app.scene.tag.load().then(() => {

                                [
                                    'button-edit-cancel',
                                    'button-edit-apply'
                                ].forEach(button => document.getElementById(button).classList.add('scale-out'));

                                setTimeout(() => {

                                    document.getElementById('modal-info').remove();
                                    document.getElementById('modal-edit').remove();
                                    document.body.style.overflow = 'overlay';

                                    let buttons = [];

                                    if (app.account['access_tag_add']) buttons.push('button-add');
                                    buttons.push('button-back');
                                    buttons.forEach(button => document.getElementById(button).classList.remove('scale-out'));

                                }, 250);

                            });

                        } else M.toast({
                            html: res.data.message
                        });

                    })

                });

            })();

            document.body.style.overflow = 'hidden';

            setTimeout(() => {

                document.getElementById('modal-edit').style.display = 'block';
                document.getElementById('modal-info').style.display = '';

                setTimeout(() => {

                    [
                        'button-edit-cancel',
                        'button-edit-apply'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                }, 100);

            }, 250);

        });

    },

    // delete

    getDeleteButtonHTML: () => {

        return '' +
            '<button ' +
                'id="button-delete" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
            '>' +
                '<i class="mdi mdi-delete"></i>' +
            '</button>';

    },

    getDeleteModalHTML: () => {

        let tag = app.scene.tag.tags.find(tag => tag.id === app.scene.tag.selected);

        return '' +
            '<div id="modal-delete" class="app-modal">' +
                '<div class="app-modal-content">' +

                    '<h3 class="app-h3">Удаление</h3>' +

                    '<p>' +
                        'Тег <b>' +
                        tag.name +
                        '</b> используется у <b>' +
                        tag.count +
                        '</b> ' +
                        app.tool.format.getUnitEnding(
                            tag.count,
                            'фотографии',
                            'фотографий',
                            'фотографий'
                        ) +
                        ', Вы точно хотите его удалить?</p>' +

                    '<div class="app-toolbar-space"></div>' +

                '</div>' +

                app.tool.toolbar({
                    id: 'toolbar-delete',
                    buttons: [

                        '<button ' +
                            'id="button-delete-cancel" ' +
                            'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out"' +
                        '>' +
                            '<i class="mdi mdi-undo"></i>' +
                        '</button>',

                        '<button ' +
                            'id="button-delete-apply" ' +
                            'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out app-primary"' +
                        '>' +
                            '<i class="mdi mdi-check-bold"></i>' +
                        '</button>'

                    ]
                }) +

            '</div>';

    },

    initDelete: () => {

        document.getElementById('button-delete').addEventListener('click', () => {

            let buttons = [];

            if (app.account['access_tag_delete']) buttons.push('button-delete');
            if (app.account['access_tag_edit']) buttons.push('button-edit');

            buttons.push('button-info-back');
            buttons.forEach(button => document.getElementById(button).classList.add('scale-out'));

            document.body.insertAdjacentHTML('afterbegin', app.scene.tag.getDeleteModalHTML());

            (() => {

                // cancel

                document.getElementById('button-delete-cancel').addEventListener('click', () => {

                    [
                        'button-delete-cancel',
                        'button-delete-apply'
                    ].forEach(button => document.getElementById(button).classList.add('scale-out'));

                    setTimeout(() => {

                        document.getElementById('modal-info').style.display = 'block';
                        document.getElementById('modal-delete').remove();
                        document.body.style.overflow = 'overlay';

                        let buttons = [];

                        if (app.account['access_tag_delete']) buttons.push('button-delete');
                        if (app.account['access_tag_edit']) buttons.push('button-edit');

                        buttons.push('button-info-back');
                        buttons.forEach(button => document.getElementById(button).classList.remove('scale-out'));

                    }, 250);

                });

                // apply

                document.getElementById('button-delete-apply').addEventListener('click', () => {

                    axios.delete('/tag', {
                        data: {
                            id: app.scene.tag.selected
                        }
                    }).then(res => {

                        if (res.data.success) {

                            app.scene.tag.load().then(() => {

                                [
                                    'button-delete-cancel',
                                    'button-delete-apply'
                                ].forEach(button => document.getElementById(button).classList.add('scale-out'));

                                setTimeout(() => {

                                    document.getElementById('modal-info').remove();
                                    document.getElementById('modal-delete').remove();
                                    document.body.style.overflow = 'overlay';

                                    let buttons = [];

                                    if (app.account['access_tag_add']) buttons.push('button-add');
                                    buttons.push('button-back');
                                    buttons.forEach(button => document.getElementById(button).classList.remove('scale-out'));

                                }, 250);

                            });

                        } else M.toast({
                            html: res.data.message
                        });

                    })

                });

            })();

            document.body.style.overflow = 'hidden';

            setTimeout(() => {

                document.getElementById('modal-delete').style.display = 'block';
                document.getElementById('modal-info').style.display = '';

                setTimeout(() => {

                    [
                        'button-delete-cancel',
                        'button-delete-apply'
                    ].forEach(button => document.getElementById(button).classList.remove('scale-out'));

                }, 100);

            }, 250);

        });

    },

    // back

    getBackButtonHTML: () => {

        return '' +
            '<button ' +
                'id="button-back" ' +
                'class="btn-floating btn-large waves-effect waves-light scale-transition scale-out app-primary"' +
            '>' +
                '<i class="mdi mdi-undo"></i>' +
            '</button>';

    },

    initBack: () => {

        document.getElementById('button-back').addEventListener('click', () => {

            let buttons = [];

            if (app.account['access_tag_add']) buttons.push('button-add');

            buttons.push('button-back');
            buttons.forEach(button => document.getElementById(button).classList.add('scale-out'));

            setTimeout(() => {

                app.scene.cloud.close();
                app.scene.menu.show();

            }, 250);

        });

    }

};