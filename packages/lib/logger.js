import dateFormat from 'dateformat';
import debugout from './debugout.js'
export default class Logger {
    constructor(source) {
        this._source = source;
        window.bugout = new debugout();
        return new Proxy(this, {
            get(target, name) {
                return target._handleInput.bind(target, name);
            }
        });
    }

    _handleInput(logType, ...data) {
        const formatted = this._formatMessage(logType, data);
        logType === 'error' && data.length=== 1 && window.bugout.log(data);
        logType === 'error' && data.length=== 2 && window.bugout.log([data[0],data[1].stack]);
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