const CommunicationChannel = {
    PORT: Symbol('PORT'),
    EVENT_LISTENER: Symbol('EVENT_LISTENER')
}

class Communication {
    constructor(communicationChannel = false, channelKey = false) {
        if(!communicationChannel)
            throw 'No communication channel provided';

        if(!Object.values(CommunicationChannel).includes(communicationChannel))
            throw 'Invalid communication channel provided';

        this._channel = communicationChannel;
        this._channelKey = channelKey;

        this._registerListeners();
    }

    _registerListeners() {
        if(this._channel == CommunicationChannel.PORT)
            this._registerPortListeners();

        if(this._channel == CommunicationChannel.EVENT_LISTENER)
            this._registerEventListeners();
    }

    _registerEventListeners() {
        window.addEventListener(this._channelKey, ({ detail: event }) => {
            // this.emit(event.action, event.data);

            // We should add a target param to the message
            // so we know when to forward to backgroundScript.js
        
            // forward with port.postMessage('ping')
            // reply with window.dispatchEvent (we should make 
            // this a wrapper that calls back with a reply method)
        
            console.log('contentScript receive message (from pageHook):', message);
            window.dispatchEvent(new CustomEvent('tronPageHook', { detail: 'Returning message ' + message }));
        });
    }

    _sentEventListener(channel, action, data) {
        window.dispatchEvent(
            new CustomEvent(
                channel,
                {
                    detail: {
                        action,
                        data
                    }
                }
            )
        );
    }

    send(action, data = {}, channel = false) {
        if(this._channel == CommunicationChannel.PORT)
            this._sendPort(action, data)

        if(this._channel == CommunicationChannel.EVENT_LISTENER)
            this._sendEventListener(channel, action, data);
    }
}

module.exports = {
    Communication,
    CommunicationChannel
};