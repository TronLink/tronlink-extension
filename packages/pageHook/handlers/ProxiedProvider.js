import TronWeb from 'tronweb';
import Logger from '@tronlink/lib/logger';
import axios from 'axios';

const { HttpProvider } = TronWeb.providers;
const logger = new Logger('ProxiedProvider');

class ProxiedProvider extends HttpProvider {
    constructor() {
        super('http://127.0.0.1');

        logger.info('Provider initialised');

        this.ready = false;
        this.queue = [];
    }

    configure(url) {
        logger.info('Received new node:', url);

        this.host = url;
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
                    logger.info(`Completed the queued request to ${ args[ 0 ] }`)
                ));
        }
    }

    request(endpoint, payload = {}, method = 'get') {
        if(!this.ready) {
            logger.info(`Request to ${ endpoint } has been queued`);

            return new Promise((resolve, reject) => {
                this.queue.push({
                    args: [ endpoint, payload, method ],
                    resolve,
                    reject
                });
            });
        }

        return super.request(endpoint, payload, method).then(res => {
            const response = res.transaction || res;

            Object.defineProperty(response, '__payload__', {
                writable: false,
                enumerable: false,
                configurable: false,
                value: payload
            });

            return res;
        });
    }
}

export default ProxiedProvider;