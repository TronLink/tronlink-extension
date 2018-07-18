import randomUUID from 'uuid/v4';
import emptyPromise from 'empty-promise';

export default class LinkedRequest {
    constructor(outputMap = false) {
        if(outputMap && {}.toString.call(outputMap) !== '[object Function]')
            throw 'Invalid output map passed. Expected type function';
            
        this._pendingRequests = {};
        this._defaultTimeout = 30;        
        this._outputMap = outputMap;        
    }

    dataStream(output) {
        console.log('Received data stream:', output);
        
        if(this._outputMap)
            output = this._outputMap(output);

        console.log('Data stream mapped to:', output);

        const { uuid, data } = output;

        if(!this._pendingRequests.hasOwnProperty(uuid))
            return false;

        this._pendingRequests[uuid].promise.resolve({ success: true, data });

        clearTimeout(this._pendingRequests[uuid].timeout);
        delete this._pendingRequests[uuid];

        return true;
    }

    create(input = false, expiration = this._defaultTimeout) {
        if(isNaN(expiration) || expiration !== parseInt(expiration))
            throw 'Invalid expiration argument passed. Expected type integer';

        const uuid = randomUUID();
        const promise = emptyPromise();

        this._pendingRequests[uuid] = {
            timeout: setTimeout(() => {
                console.log(`Linked request ${uuid} timed out`);       

                promise.resolve({ 
                    success: false, error: 'Request timed out' 
                });

                delete this._pendingRequests[uuid];
            }, expiration * 1000),
            promise
        };

        console.log(`Linked request ${uuid} with expiration of ${expiration}s created`);

        return { 
            request: {
                uuid,
                data: input
            }, 
            promise 
        };
    }
}