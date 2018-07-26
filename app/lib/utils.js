import crypto from 'crypto';

import { 
    ENCRYPTION_ALGORITHM, 
    LOCALSTORAGE_KEY 
} from './constants';

const utils = {
    encrypt(data, password, algorithm = ENCRYPTION_ALGORITHM) {
        const cipher = crypto.createCipher(algorithm, password);

        let crypted = cipher.update(data, 'utf8', 'hex');
        crypted += cipher.final('hex');

        return crypted;
    },

    decrypt(data, password, algorithm = ENCRYPTION_ALGORITHM) {
        const decipher = crypto.createDecipher(algorithm, password);

        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    },

    loadStorage(key = LOCALSTORAGE_KEY) {
        try {
            const data = window.localStorage.getItem(key);

            if (data)
                return JSON.parse(data);
            
            return {};
        } catch(exception) {
            console.log({ exception });
            return {};
        }
    },

    saveStorage(data, key = LOCALSTORAGE_KEY) {
        window.localStorage.setItem(key, JSON.stringify(data));
    },

    convertAccountObject(address, { balance }) {
        return {
            tokens: {},
            address,
            balance,
            name : "Account 1"
        };
    }
};

export default utils;