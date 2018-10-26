import EventEmitter from 'eventemitter3';
import randomUUID from 'uuid/v4';
import Logger from '../logger';
import extensionizer from 'extensionizer';

const logger = new Logger('PortHost');

export default class PortHost extends EventEmitter {
    constructor() {
        super();

        this._ports = {};
        this._registerListeners();
    }

    _registerListeners() {
        extensionizer.runtime.onConnect.addListener(port => {
            const uuid = randomUUID();
            port.uuid = uuid;

            let source = port.name;
            let hostname = false;

            if(port.sender.tab && source !== 'popup')
                source += `-${port.sender.tab.id}`;

            if(port.sender.url)
                hostname = new URL(port.sender.url).hostname;

            if(!this._ports.hasOwnProperty(source))
                this._ports[source] = {};

            this._ports[source][uuid] = port;
            logger.info(`Port ${source}:${uuid.substr(0, 4)} connected`);

            port.onMessage.addListener(({ action, data }) => {
                this.emit(action, {
                    meta: {
                        hostname
                    },
                    source,
                    data
                });
            });

            port.onDisconnect.addListener(() => {
                logger.info(`Port ${source}:${uuid.substr(0, 4)} disconnected: ${extensionizer.runtime.lastError || 'No reason provided'}`);

                delete this._ports[source][uuid];

                if(!Object.keys(this._ports[source]).length)
                    delete this._ports[source];
            });

            this.emit('newConnection', source);
        });
    }

    send(source = false, action = false, data = {}) {
        if(!source)
            return { success: false, error: 'Function requires source {string} parameter' };

        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

        if(!this._ports.hasOwnProperty(source))
            return { success: false, error: 'Specified port does not exist' };

        Object.values(this._ports[source]).forEach(port => {
            port.postMessage({ action, data });
        });

        return { success: true };
    }

    broadcast(action = false, data = {}) {
        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

        const portAmount = Object.keys(this._ports).length;

        if(!portAmount)
            return { success: false, error: 'No ports available to broadcast to' };

        Object.values(this._ports).forEach(portDictionary => {
            Object.values(portDictionary).forEach(port => {
                port.postMessage({ action, data });
            });
        });

        return { success: true, data: { portAmount } };
    }
}