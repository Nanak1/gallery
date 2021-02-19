app.tool.toolbar = {

    padding: 8,
    diameter: 56,

    getHTML: (id, buttons, display) => {

        display = display || 'block';

        let width = 0;
        let html = '';

        for (let i = 0; i < buttons.length; i++) {

            if (i > 0) {

                width += app.tool.toolbar.padding;
                html += '' +
                    '<div ' +
                        'style="' +
                            'display: inline-block; ' +
                            'width: ' + app.tool.toolbar.padding + 'px;' +
                        '"' +
                    '>' +
                    '</div>';

            }

            width += app.tool.toolbar.diameter;
            html += buttons[i];

        }

        return '' +
            '<div ' +
                'id="' + id + '" ' +
                'style="' +
                    'display: ' + display + '; ' +
                    'position: fixed; ' +
                    'left: 50%; ' +
                    'z-index: 2; ' +
                    'bottom: ' + app.tool.toolbar.padding + 'px; ' +
                    'margin-left: ' + Math.round(- width / 2) + 'px;' +
                '"' +
            '>' +
                html +
            '</div>';

    }

};