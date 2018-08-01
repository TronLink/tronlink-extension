import EventEmitter from 'eventemitter3';
import randomUUID from 'uuid/v4';

export default class PopupHost extends EventEmitter {
    constructor(portChild = false) {
        super();

        if(!portChild)
            throw 'Expected PortChild object';

        this._portChild = portChild;
        this._pendingRequests = {};

        this._registerListener();
    }

    _registerListener() {
        this._portChild.on('popupCommunication', ({ action, data: { uuid, data, expectsResponse } }) => {
            if(action === 'internalResponse')
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
                this._portChild.send('popupCommunication', {
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
                this._portChild.send('popupCommunication', {
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

        this._portChild.send('popupCommunication', {
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
                    reject(`Request ${action} timed out`);
                    delete this._pendingRequests[uuid];
                }, 30 * 1000),
                resolve,
                reject
            };
        });
    }

    requestFreeze(address, amount) {
        return this.raw('requestFreeze', { address, amount });
    }

    requestUnfreeze(address) {
        return this.raw('requestUnfreeze', { address });
    }

    generateWallet() {
        return this.raw('generateWallet');
    }

    importWalletFromKey(privateKey) {
        return this.raw('importWalletFromKey', { privateKey });
    }

    importWalletFromPhrase(backupPhrase) {
        return this.raw('importWalletFromPhrase', { backupPhrase });
    }

    unlockWallets(password) {
        return this.raw('unlockWallet', { password });
    }

    setPassword(password) {
        return this.raw('setPassword', { password });
    }

    getWalletStatus() {
        return this.raw('getWalletStatus');
    }

    getPrice() {
        return this.raw('getPrice');
    }

    getConfirmations() {
        return this.raw('getConfirmations');
    }

    declineConfirmation(id) {
        return this.raw('declineConfirmation', { id });
    }

    acceptConfirmation(id) {
        return this.raw('acceptConfirmation', { id });
    }

    requestSend(recipient, amount) {
        return this.raw('sendTron', { recipient, amount });
    }

    updateAccount(publicKey) {
        return this.raw('updateAccount', { publicKey }, false);
    }
}