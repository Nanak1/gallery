let axios = require('axios');

let config = require('../../../config.json');

module.exports = {

    RESOURCE_ALREADY_EXIST: 405,
    PARENT_NODE_DOES_NOT_EXIST: 409,

    DESTINATION_NODE_IS_NOT_FOUND: 409,
    OVERWRITE_HEADER_IS_SET_TO_FALSE: 412,

    createFolder: function (user, path) {

        return new Promise((resolve, reject) => {

            axios({
                method: 'MKCOL',
                url: encodeURI(
                    config.cloud.webdav +
                    '/files/' +
                    user.username +
                    '/' +
                    path
                ),
                auth: {
                    username: user.cloud_username,
                    password: user.cloud_password
                }
            }).then(() => resolve()).catch(error => {

                if (error.response.status === this.RESOURCE_ALREADY_EXIST) resolve();
                else if (error.response.status === this.PARENT_NODE_DOES_NOT_EXIST) {

                    let items = path.split('/');

                    items.pop();

                    this.createFolder(user, items.join('/')).then(() => {

                        this.createFolder(user, path).then(() => resolve());

                    });

                } else reject(error);

            });

        });

    },

    moveFile: function (user, from, to) {

        return new Promise((resolve, reject) => {

            axios({
                method: 'MOVE',
                url: encodeURI(
                    config.cloud.webdav +
                    '/files/' +
                    user.username +
                    '/' +
                    from
                ),
                auth: {
                    username: user.cloud_username,
                    password: user.cloud_password
                },
                headers: {
                    overwrite: 'F',
                    destination: encodeURI(
                        config.cloud.webdav +
                        '/files/' +
                        user.username +
                        '/' +
                        to
                    )
                }
            }).then(() => resolve()).catch(error => {

                if (error.response.status === this.DESTINATION_NODE_IS_NOT_FOUND) {

                    let items = to.split('/');

                    items.pop();

                    this.createFolder(user, items.join('/')).then(() => {

                        this.moveFile(user, from, to).then(() => {

                            resolve();

                        });

                    });

                } else if (error.response.status === this.OVERWRITE_HEADER_IS_SET_TO_FALSE) {

                    resolve();

                } else reject();

            });

        });

    }

};