import EventEmitter from 'eventemitter3';

export default class PopupHost extends EventEmitter {
    constructor(portChild = false) {
        super();

        if(!portChild)
            throw 'Expected PortChild object';

        this._portChild = portChild;
        this._pendingRequests = {}

        this._registerListener();
    }

    _registerListener() {
        this._portHost.on('popupCommunication', ( { action, data: { uuid, data, expectsResponse } }) => {
            console.log('popup received', { action, data });

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

    requestFreeze(account = false, amount = false) {
        // -> background
    }

    requestUnfreeze(account = false) {
        // -> background
    }
}