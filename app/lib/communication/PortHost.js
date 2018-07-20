import EventEmitter from 'eventemitter3';

export default class PortHost extends EventEmitter {
    constructor() {
        super();

        this._ports = {};
        this._registerListeners();
    }

    _registerListeners() {
        chrome.extension.onConnect.addListener(port => {
            let source = port.name;
        
            if(port.sender.tab)
                source += `-${port.sender.tab.id}`;

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
    
    send(source = false, action = false, data = {}) {
        if(!source)
            return { success: false, error: 'Function requires source {string} parameter' };

        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

        if(!this._ports.hasOwnProperty(source))
            return { success: false, error: 'Specified port does not exist' };;

        this._ports[source].postMessage({ action, data });
        return { success: true };
    }

    broadcast(action = false, data = {}) {
        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

        const portAmount = Object.keys(this._ports).length;

        if(!portAmount)
            return { success: false, error: 'No ports available to broadcast to' };

        Object.values(this._ports).forEach(port => {
            port.postMessage({ action, data });
        });

        return { success: true, data: { portAmount } };
    }
}