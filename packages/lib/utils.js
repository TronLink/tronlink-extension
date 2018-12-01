import crypto from 'crypto';
import bip39 from 'bip39';
import bip32 from 'bip32';
import TronWeb from 'tronweb';

const Utils = {
    encryptionAlgorithm: 'aes-256-ctr',
    hashAlgorithm: 'sha256',

    hash(string) {
        return crypto
            .createHash(this.hashAlgorithm)
            .update(string)
            .digest('hex');
    },

    encrypt(data, key) {
        const encoded = JSON.stringify(data);
        const cipher = crypto.createCipher(this.encryptionAlgorithm, key);

        let crypted = cipher.update(encoded, 'utf8', 'hex');
        crypted += cipher.final('hex');

        return crypted;
    },

    decrypt(data, key) {
        const decipher = crypto.createDecipher(this.encryptionAlgorithm, key);

        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return JSON.parse(decrypted);
    },

    requestHandler(target) {
        return new Proxy(target, {
            get(target, prop) {
                // First, check if the property exists on the target
                // If it doesn't, throw an error
                if(!Reflect.has(target, prop))
                    throw new Error(`Object does not have property '${ prop }'`);

                // If the target is a variable or the internal 'on'
                // method, simply return the standard function call
                if(typeof target[ prop ] !== 'function' || prop === 'on')
                    return Reflect.get(target, prop);

                // The 'req' object can be destructured into three components -
                // { resolve, reject and data }. Call the function (and resolve it)
                // so the result can then be passed back to the request.
                return (...args) => {
                    if(!args.length)
                        args[ 0 ] = {};

                    const [ firstArg ] = args;

                    const {
                        resolve = () => {},
                        reject = ex => console.error(ex),
                        data
                    } = firstArg;

                    if(typeof firstArg !== 'object' || !('data' in firstArg))
                        return target[ prop ].call(target, ...args);

                    Promise.resolve(target[ prop ].call(target, data))
                        .then(resolve)
                        .catch(reject);
                };
            }
        });
    },

    generateMnemonic() {
        return bip39.generateMnemonic(128);
    },

    getAccountAtIndex(mnemonic, index = 0) {
        const seed = bip39.mnemonicToSeed(mnemonic);
        const node = bip32.fromSeed(seed);
        const child = node.derivePath(`m/44'/195'/${ index }'/0/0`);
        const privateKey = child.privateKey.toString('hex');
        const address = TronWeb.address.fromPrivateKey(privateKey);

        return {
            privateKey,
            address
        };
    },

    validateMnemonic(mnemonic) {
        return bip39.validateMnemonic(mnemonic);
    },

    injectPromise(func, ...args) {
        return new Promise((resolve, reject) => {
            func(...args, (err, res) => {
                if(err)
                    reject(err);
                else resolve(res);
            });
        });
    },

    isFunction(obj) {
        return typeof obj === 'function';
    }
};

export default Utils;