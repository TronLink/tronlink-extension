import EventEmitter from 'eventemitter3';

export default class PortHost extends EventEmitter {
    constructor() {
        super();

        // Emit tab ID for port key?
        this._ports = {};
        this._registerListeners();
    }

    _registerListeners() {
        chrome.extension.onConnect.addListener(port => {
            const tabID = Date.now(); // Temporary, wait for incoming tabID first

            this._ports[tabID] = port;
            console.log('Incoming port connected');

            port.onMessage.addListener(({ action, data }) => {
                console.log('Received port event', { action, data, tabID });
                this.emit(action, { tabID, data });
            });

            port.onDisconnect.addListener(() => {
                console.log('Port disconnected:', chrome.runtime.lastError);
                delete this._ports[tabID];
            });
        });
    }
    
    send(tabID, action, data = {}) {
        // Check if action is valid

        console.log('Sending port event', { tabID, action, data });


        if(!this._ports.hasOwnProperty(tabID))
            return false;

        this._ports[tabID].postMessage({ action, data });
        return true;
    }

    broadcast(action, data = {}) {
        // Check if action is valid

        Object.values(this._ports).forEach(port => {
            port.postMessage({ action, data });
        });

        // How many ports were sent the message
        return Object.keys(this._ports).length;
    }
}