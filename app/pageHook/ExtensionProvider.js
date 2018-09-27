import TronWeb from 'tronweb';

const {
    HttpProvider
} = TronWeb.providers;

export default class ExtensionProvider extends HttpProvider {
    request(url, payload = {}, method = 'get') {
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