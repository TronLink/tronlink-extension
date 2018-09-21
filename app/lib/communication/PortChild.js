/*global chrome*/
import Logger from '../logger';

const logger = new Logger('PortChild');

export default class PortChild {
    constructor(channelKey = false, eventHandler = false) {
        if(!channelKey)
            throw 'No communication channel provided';

        if(!eventHandler)
            throw 'No event handler provided';

        this._channelKey = channelKey;
        this._eventHandler = eventHandler;
        this._connected = false;

        this._connect();
    }

    _connect() {
        this._port = chrome.runtime.connect({ name: this._channelKey });
        this._connected = true;

        this._port.onMessage.addListener(({ action, data }) => {
            this._eventHandler.send(action, data);
        });

        this._eventHandler.on('tunnel', ({ data }) => {
            this.send('tunnel', data);
        });

        this._port.onDisconnect.addListener(() => {
            logger.warn(`Lost connection to backgroundScript: ${chrome.runtime.lastError || 'No reason provided'}`);
            this._connected = false;
        });
    }

    send(action = false, data = {}) {
        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

        if(!this._connected)
            return { success: false, error: 'Connection to backgroundScript failed' };

        this._port.postMessage({ action, data });
        return { success: true };
    }
}