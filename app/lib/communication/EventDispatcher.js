import EventEmitter from 'eventemitter3';

export default class EventDispatcher extends EventEmitter {
    constructor(channelKey = false, target = false) {
        super();

        if(!channelKey)
            throw 'No communication channel provided';

        if(!target)
            throw 'No communication target provided';

        this._channelKey = channelKey;
        this._target = target;

        this._registerEventListener();
    }

    _registerEventListener() {
        window.addEventListener(this._channelKey, ({ detail: { action, data, source } }) => {
            this.emit(action, { data, source });
        });
    }

    send(action, data = {}) {
        // Check if action is valid

        window.dispatchEvent(
            new CustomEvent(
                this._target,
                {
                    detail: {
                        action,
                        data,
                        source: this._channelKey
                    }
                }
            )
        );
    }
}