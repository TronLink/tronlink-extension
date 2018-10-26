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
        window.addEventListener('message', ({ data: { fromContentScript = false, action, data, source } }) => {
            if(!fromContentScript)
                return;

            if(source == this._channelKey)
                return;

            this.emit(action, { data, source });
        });
    }

    send(action = false, data = {}) {
        if(!action)
            return { success: false, error: 'Function requires action {string} parameter' };

        window.postMessage({ fromContentScript: true, action, data, source: this._channelKey }, '*');
    }
}