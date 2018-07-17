import EventEmitter from 'eventemitter3';

export default class EventDispatcher extends EventEmitter {
    constructor(channelKey = false) {
        super();

        if(!channelKey)
            throw 'No communication channel provided';

        this._channelKey = channelKey;
        this._registerEventListener();
    }

    _registerEventListener() {
        window.addEventListener(this._channelKey, ({ detail: { action, data } }) => {
            console.log('Received event', { action, data });
            this.emit(action, data);
        });
    }

    send(channel, action, data = {}) {
        // Check if channel is valid
        // Check if action is valid

        console.log('Sending event', { channel, action, data });
        
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
}