import EventEmitter from 'eventemitter3';
import randomUUID from 'uuid/v4';

export default class PopupClient extends EventEmitter {
    constructor(portHost = false) {
        super();

        if(!portHost)
            throw 'Expected PortHost object';

        this._portHost = portHost;
        this._pendingRequests = {}

        this._registerListener();
    }

    _registerListener() {
        this._portHost.on('popupCommunication', ({ source, data: { action, data: { uuid, data, expectsResponse } } }) => {
            if(action == 'internalResponse')
                return this._handleResponse(uuid, data.success, data.data);
                
            this._handleEvent(action, uuid, data, expectsResponse);
        });
    }

    _handleResponse(uuid, success, data) {
        if(!this._pendingRequests.hasOwnProperty(uuid))
            return;

        if(success)
            this._pendingRequests[uuid].resolve(data);
        else this._pendingRequests[uuid].reject(data);

        clearTimeout(this._pendingRequests[uuid].timeout);
        delete this._pendingRequests[uuid];
    }

    _handleEvent(action, uuid, data, expectsResponse) {
        if(!expectsResponse)
            return this.emit(action, data);        

        return this.emit(action, {
            resolve: data => {
                this._portHost.send('popup', 'popupCommunication', { 
                    action: 'internalResponse', 
                    data: {
                        data: {
                            success: true,
                            data
                        },
                        uuid
                    }
                });
            },
            reject: data => {
                this._portHost.send('popup', 'popupCommunication', { 
                    action: 'internalResponse', 
                    data: {
                        data: {
                            success: false,
                            data
                        },
                        uuid
                    }
                });
            },
            data
        });
    }

    raw(action = false, data = false, expectsResponse = true) {
        const uuid = randomUUID();

        this._portHost.send('popup', 'popupCommunication', {
            action,
            data: {
                expectsResponse,
                uuid,
                data
            }
        });

        if(!expectsResponse)
            return;

        return new Promise((resolve, reject) => {
            this._pendingRequests[uuid] = {
                timeout: setTimeout(() => {
                    reject('Request timed out');    
                    delete this._pendingRequests[uuid];
                }, 30 * 1000),
                resolve,
                reject
            };
        });
    }

    requestTronSend(to = false, amount = false) {
        return this.raw('requestTronSend', { to, amount });
    }

    requestTokenSend(token = false, to = false, amount = false) {
        return this.raw('requestTokenSend', { token, to, amount });
    }

    requestVote(to = false) {
        return this.raw('requestVote', { to });
    }
}