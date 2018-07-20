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
        this._eventHandler.on('tunnel', ({ source, data: { uuid, data } }) => {
            this._respond(source, uuid, data);
        });
    }

    _respond(source, uuid, request) {
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
            request
        };

        this.emit('request', response);
    }
}