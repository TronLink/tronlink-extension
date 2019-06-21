import dateFormat from 'dateformat';

export default class Logger {
    constructor(source) {
        this._source = source;
        return new Proxy(this, {
            get(target, name) {
                return target._handleInput.bind(target, name);
            }
        });
    }

    _handleInput(logType, ...data) {
        const formatted = this._formatMessage(logType, data);
        console.log(...formatted);
    }

    _formatMessage(logType = 'info', data) {
        let level = logType;

        const colours = {
            info: '7f8c8d',
            warn: 'f39c12',
            error: 'c0392b'
        };

        if(!colours.hasOwnProperty(logType))
            level = 'info';

        const colour = colours[ level ];
        const timestamp = dateFormat(Date.now(), 'mmm d, hh:MM:ss tt');

        return [
            `[${ timestamp }] %c[${ this._source }]: %c[${ level.toUpperCase() }]:`,
            'font-weight: bold;',
            `color: #${ colour };`,
            ...data,
        ];
    }
}