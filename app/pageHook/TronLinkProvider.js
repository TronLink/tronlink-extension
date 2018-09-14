import * as methods from './methods';

export default class TronLinkProvider {
    constructor(linkedRequest = false) {
        this.setLinkedRequest(linkedRequest);
    }

    setLinkedRequest(linkedRequest = false) {
        if(!linkedRequest)
            throw new Error('Missing event dispatch channel');

        this.linkedRequest = linkedRequest;
    }

    isConnected() {
        return true; // TODO, check if comms channel is linked
    }

    request(url, payload = {}) {
        const method = methods[url];

        if(!method || !method.length)
            return Promise.reject(`Method ${ url.toString().substr(0, 32) } not implemented`);

        return this.linkedRequest.build({
            method,
            payload
        });
    }
}