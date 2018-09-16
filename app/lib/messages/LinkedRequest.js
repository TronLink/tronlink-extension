import randomUUID from 'uuid/v4';
import Logger from '../logger';

const logger = new Logger('LinkedRequest');

export default class LinkedRequest {
    constructor(eventHandler = false, outputMap = false) {
        if(!eventHandler)
            throw 'No event handler specified';

        if(outputMap && {}.toString.call(outputMap) !== '[object Function]')
            throw 'Invalid output map passed. Expected type function';

        this._outputMap = outputMap;
        this._eventHandler = eventHandler;

        this._pendingRequests = {};
        this._defaultTimeout = 30;

        this._registerListener();
    }

    _registerListener() {
        this._eventHandler.on('tunnel', data => {
            const responseSent = this._dataStream(data);

            if(!responseSent)
                return logger.error('Failed to send response for request', data);
        });
    }

    _dataStream(output) {
        let input = output;

        if(this._outputMap)
            input = this._outputMap(output);

        const {
            uuid,
            data,
            error,
            success
        } = input;

        if(!this._pendingRequests.hasOwnProperty(uuid))
            return false;

        if(success)
            this._pendingRequests[uuid].resolve(data);
        else this._pendingRequests[uuid].reject(error);

        clearTimeout(this._pendingRequests[uuid].timeout);
        delete this._pendingRequests[uuid];

        return true;
    }

    build(input = false, expiration = this._defaultTimeout) {
        if(isNaN(expiration) || expiration !== parseInt(expiration))
            throw 'Invalid expiration argument passed. Expected type integer';

        const uuid = randomUUID();

        this._eventHandler.send('tunnel', {
            data: input,
            uuid
        });

        return new Promise((resolve, reject) => {
            this._pendingRequests[uuid] = {
                timeout: setTimeout(() => {
                    reject(`Request ${input.method}timed out`);
                    delete this._pendingRequests[uuid];
                }, expiration * 1000),
                resolve,
                reject
            };
        });
    }
}