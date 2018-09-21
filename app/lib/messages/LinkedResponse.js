import EventEmitter from 'eventemitter3';

export default class LinkedResponse extends EventEmitter {
    constructor(eventHandler = false) {
        super();

        if(!eventHandler)
            throw 'No event handler specified';

        this._eventHandler = eventHandler;
        this._registerListener();
    }

    _registerListener() {
        this._eventHandler.on('tunnel', ({ source, meta, data: { uuid, data } }) => {
            this._respond(source, uuid, data, meta);
        });
    }

    _respond(source, uuid, request, meta) {

        const response = {
            resolve: data => {
                this._eventHandler.send(source, 'tunnel', {
                    success: true,
                    uuid,
                    data
                });
            },
            reject: error => {
                this._eventHandler.send(source, 'tunnel', {
                    success: false,
                    uuid,
                    error
                });
            },
            request,
            meta
        };

        this.emit('request', response);
    }
}