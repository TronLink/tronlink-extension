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

    send(action = false, data = {}) {
        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

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