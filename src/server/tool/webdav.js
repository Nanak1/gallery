let axios = require('axios');

module.exports = {

    debug: true,

    RESOURCE_ALREADY_EXIST: 405,
    PARENT_NODE_DOES_NOT_EXIST: 409,

    DESTINATION_NODE_IS_NOT_FOUND: 409,
    OVERWRITE_HEADER_IS_SET_TO_FALSE: 412,

    /**
     * Создать директорию
     * @param data
     * @param {string} data.webdav
     * @param {string} data.username
     * @param {string} data.password
     * @param {string} data.path
     * @returns {Promise<object>}
     */
    create: function (data) {

        return new Promise((resolve, reject) => {

            if (this.debug) console.log('webdav::create', data.webdav, data.username, data.path, '...');

            axios({
                method: 'MKCOL',
                url: encodeURI(data.webdav + '/files/' + data.username + '/' + data.path),
                auth: {
                    username: data.username,
                    password: data.password
                }
            }).then(() => {

                if (this.debug) console.log('webdav::create', data.webdav, data.username, data.path, 'success');

                resolve({
                    success: true
                });

            }).catch(error => {

                if (error.response.status === this.RESOURCE_ALREADY_EXIST) {

                    let status = 'RESOURCE_ALREADY_EXIST';

                    if (this.debug) console.log('webdav::create', data.webdav, data.username, data.path, 'success', status);

                    resolve({
                        success: true,
                        status: status,
                        error: error
                    });

                } else if (error.response.status === this.PARENT_NODE_DOES_NOT_EXIST) {

                    let status = 'PARENT_NODE_DOES_NOT_EXIST';

                    if (this.debug) console.log('webdav::create', data.webdav, data.username, data.path, 'failure', status);

                    let nodes = data.path.split('/');

                    nodes.pop();

                    this.create({
                        webdav: data.webdav,
                        username: data.username,
                        password: data.password,
                        path: nodes.join('/')
                    }).then(() => {

                        this.create({
                            webdav: data.webdav,
                            username: data.username,
                            password: data.password,
                            path: data.path
                        }).then(() => {

                            resolve({
                                success: true,
                                status: status,
                                error: error
                            });

                        });

                    });

                } else reject({
                    success: false,
                    error: error
                });

            });

        });

    },

    /**
     * Переместить файл
     * @param data
     * @param {string} data.webdav
     * @param {string} data.username
     * @param {string} data.password
     * @param {string} data.from
     * @param {string} data.to
     * @param {boolean} data.overwrite
     * @returns {Promise<object>}
     */
    move: function (data) {

        return new Promise((resolve, reject) => {

            if (this.debug) console.log('webdav::move', data.webdav, data.username, data.from, data.to, '...');

            axios({
                method: 'MOVE',
                url: encodeURI(data.webdav + '/files/' + data.username + '/' + data.from),
                auth: {
                    username: data.username,
                    password: data.password
                },
                headers: {
                    overwrite: data.overwrite ? 'T' : 'F',
                    destination: encodeURI(data.webdav + '/files/' + data.username + '/' + data.to)
                }
            }).then(() => {

                if (this.debug) console.log('webdav::move', data.webdav, data.username, data.from, data.to, 'success');

                resolve({
                    success: true
                });

            }).catch(error => {

                if (error.response.status === this.DESTINATION_NODE_IS_NOT_FOUND) {

                    let status = 'DESTINATION_NODE_IS_NOT_FOUND';

                    if (this.debug) console.log('webdav::move', data.webdav, data.username, data.from, data.to, 'failure', status);

                    let nodes = data.to.split('/');

                    nodes.pop();

                    this.create({
                        webdav: data.webdav,
                        username: data.username,
                        password: data.password,
                        path: nodes.join('/')
                    }).then(() => {

                        this.move({
                            webdav: data.webdav,
                            username: data.username,
                            password: data.password,
                            from: data.from,
                            to: data.to,
                            overwrite: data.overwrite
                        }).then(() => {

                            resolve({
                                success: true,
                                status: status,
                                error: error
                            });

                        });

                    });

                } else if (error.response.status === this.OVERWRITE_HEADER_IS_SET_TO_FALSE) {

                    let status = 'OVERWRITE_HEADER_IS_SET_TO_FALSE';

                    if (this.debug) console.log('webdav::move', data.webdav, data.username, data.from, data.to, 'failure', status);

                    resolve({
                        success: false,
                        status: status,
                        error: error
                    });

                } else reject({
                    success: false,
                    error: error
                });

            });

        });

    },

    /**
     * Удалить файл
     * @param data
     * @param {string} data.webdav
     * @param {string} data.username
     * @param {string} data.password
     * @param {string} data.path
     * @returns {Promise<object>}
     */
    delete: function (data) {

        return new Promise((resolve, reject) => {

            if (this.debug) console.log('webdav::delete', data.webdav, data.username, data.path, '...');

            axios({
                method: 'DELETE',
                url: encodeURI(data.webdav + '/files/' + data.username + '/' + data.path),
                auth: {
                    username: data.username,
                    password: data.password
                }
            }).then(() => {

                if (this.debug) console.log('webdav::delete', data.webdav, data.username, data.path, 'success');

                resolve({
                    success: true
                });

            }).catch(error => {

                resolve({
                    success: false,
                    error: error
                });

            });

        });

    }

};