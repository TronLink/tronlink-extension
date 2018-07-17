import EventEmitter from 'eventemitter3';

export default class PortHost extends EventEmitter {
    constructor() {
        super();

        this._ports = {};
        this._registerListeners();
    }

    _registerListeners() {
        chrome.extension.onConnect.addListener(port => {
            const source = `${port.name}-${port.sender.tab.id}`;

            this._ports[source] = port;
            console.log(`Port ${source} connected`);

            port.onMessage.addListener(({ action, data }, sendingPort) => {
                this.emit(action, { source, data });
            });

            port.onDisconnect.addListener(() => {
                console.log(`Port ${source} disconnected: ${chrome.runtime.lastError}`);
                delete this._ports[source];
            });
        });
    }
    
    send(source, action, data = {}) {
        // Check if action is valid

        if(!this._ports.hasOwnProperty(source))
            return false;

        this._ports[source].postMessage({ action, data });
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