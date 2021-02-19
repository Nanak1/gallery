app.tool.toolbar = {

    padding: 8,
    diameter: 56,

    getMarginLeft: (position, size) => {

        let width = app.tool.toolbar.diameter * size + app.tool.toolbar.padding * (size - 1);
        let left = 0;

        for (let i = 1; i < position; i++) {

            left = left + app.tool.toolbar.diameter + app.tool.toolbar.padding;

        }

        return -1 * Math.round(width / 2) + left;

    },

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