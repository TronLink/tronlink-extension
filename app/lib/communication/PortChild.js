import EventEmitter from 'eventemitter3';

export default class PortChild extends EventEmitter {
    constructor(channelKey = false) {
        super();

        if(!channelKey)
            throw 'No communication channel provided';


        this._channelKey = channelKey;
        this._connect();
    }

    _connect() {
        this._port = chrome.runtime.connect({ name: this._channelKey });

        console.log('Port connected');

        this._port.onMessage.addListener(({ action, data }) => {
            console.log('Received port event', { action, data });
            this.emit(action, data);
        });

        this._port.onDisconnect.addListener(port => {
            console.log('Port disconnected', chrome.runtime.lastError);
        });
    }

    send(action, data = {}) {
        // Check if connected
        // Check if action is valid string
        this._port.postMessage({ action, data });
    }
}