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
            console.log('backgroundScript received', { source, action, data });

            if(action == 'internalResponse') {
                const { 
                    action, 
                    success, 
                    data 
                } = data;

                return this._handleResponse(uuid, success, data);
            }
                
            this._handleEvent(action, uuid, data, expectsResponse);
        });
    }

    _handleResponse(uuid, success, data) {
        if(!this._pendingRequests.hasOwnProperty(uuid))
            return;

        if(success)
            this._pendingRequests.resolve(data);
        else this._pendingRequests.reject(data);

        clearTimeout(this._pendingRequests.timeout);
        delete this._pendingRequests[uuid];
    }

    _handleEvent(action, uuid, data, expectsResponse) {
        if(!expectsResponse)
            return this.emit(action, data);

        return this.emit(action, {
            resolve: data => {
                this._portHost.send('popup', 'internalResponse', {
                    success: true,
                    action,                    
                    data,
                    uuid
                });
            },
            reject: data => {
                this._portHost.send('popup', 'internalResponse', {
                    success: false,
                    action,                    
                    data,
                    uuid
                });
            },
            data
        });
    }

    raw(action = false, data = false, expectsResponse = true) {
        const uuid = randomUUID();

        if(!expectsResponse) {
            return this._portHost.send('popup', action, {
                expectsResponse: false,
                uuid,
                data
            });
        }

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

// if possible two-way communication
//
// we'll expose a `raw` method that sends
// data without formatting, it would be
// raw(eventName, data)
//
// we'll also add custom methods such as:
// - requestTronSend
// - requestTokenSend
// - requestVote
//
// and then whatever methods need to be
// added for popup -> backgroundScript comms

// nevermind this will be two seperate files
// that wrap around PortHost for backgroundScript
// and PortChild for popup