import TronWeb from 'tronweb';
import Logger from 'lib/logger';
import axios from 'axios';

const logger = new Logger('ExtensionProvider');

const {
    HttpProvider
} = TronWeb.providers;

export default class ExtensionProvider extends HttpProvider {
    constructor(...args) {
        super(...args);

        this.ready = false;
        this.queue = [];

        logger.info('Provider initiated');
    }

    setURL(url) {
        logger.info('Received new host:', url);

        this.instance = axios.create({
            baseURL: url,
            timeout: 30000
        });

        this.ready = true;

        while(this.queue.length) {
            const {
                args,
                resolve,
                reject
            } = this.queue.shift();

            this.request(...args)
                .then(resolve)
                .catch(reject)
                .then(() => (
                    logger.info(`Request to ${ args[0] } completed`)
                ));
        }
    }

    request(url, payload = {}, method = 'get') {
        if(!this.ready) {
            logger.info(`Request to ${ url } has been queued`);

            return new Promise((resolve, reject) => {
                this.queue.push({
                    args: [ url, payload, method ],
                    resolve,
                    reject
                });
            });
        }

        return super.request(url, payload, method).then(res => {
            // Some transaction calls have a nested transaction property
            const obj = res.hasOwnProperty('transaction') ? res.transaction : res;

            Object.defineProperty(obj, '__payload__', {
                writable: false,
                enumerable: false,
                configurable: false,
                value: payload
            });

            return res;
        }).catch(err => Promise.reject(err));
    }
}