app.tool.toolbar = data => {

    if (Array.isArray(data)) data = {
        buttons: data
    };

    return '' +
        '<div ' +
            (data.id ? 'id="' + data.id + '" ' : '') +
            (data.display ? 'style="display: ' + data.display + ';" ' : '') +
            'class="app-toolbar"' +
        '>' +
            data.buttons.join('') +
        '</div>'

};