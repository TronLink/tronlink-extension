import crypto from 'crypto';
import Sha from 'jssha';
import ByteArray from './ByteArray';
import Logger from './logger';

const logger = new Logger('Utils');
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

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
            logger.warn('Failed to load storage');
            logger.error({ exception });
            return {};
        }
    },

    saveStorage(data, key = LOCALSTORAGE_KEY) {
        window.localStorage.setItem(key, JSON.stringify(data));
    },

    convertTransactions(transactions, address) {
        return transactions.map((transaction) => {
            const ownerAddress = this.hexToBase58(transaction.parameter.value.owner_address);
            const toAddress = transaction.parameter.value.to_address ? this.hexToBase58(transaction.parameter.value.to_address) : false;
            const isMine = address === ownerAddress;

            return {
                txType: transaction.type,
                ownerAddress,
                toAddress,
                isMine,
                amount: transaction.parameter.value.amount,
                timestamp: transaction.amount,
                txID: transaction.txID
            };
        });
    },

    convertAccountObject(address, { balance }, transactions) {
        return {
            name: 'Default account',
            transactions: this.convertTransactions(transactions, address),
            tokens: {},
            address,
            balance            
        };
    },

    base64ToHex(string) {
        const bin = atob(string.replace(/[ \r\n]+$/, ''));
        const hex = [];

        for (let i = 0; i < bin.length; i++) {
            let temp = bin.charCodeAt(i).toString(16);

            if (temp.length == 1)
                temp = `0${temp}`;

            hex.push(temp);
        }

        return hex.join('');
    },

    sha256(string) {
        const shaObj = new Sha('SHA-256', 'HEX');
        shaObj.update(string);
        return shaObj.getHash('HEX');
    },

    base58ToHex(string) {
        const bytes = [ 0 ];

        for (let i = 0; i < string.length; i++) {
            const char = string[i];

            if (!ALPHABET.includes(char))
                throw new Error('Non-base58 character');

            for (let j = 0; j < bytes.length; j++)
                bytes[j] *= 58;

            bytes[0] += ALPHABET.indexOf(char);

            let carry = 0;

            for (let j = 0; j < bytes.length; ++j) {
                bytes[j] += carry;
                carry = bytes[j] >> 8;
                bytes[j] &= 0xff;
            }

            while (carry) {
                bytes.push(carry & 0xff);
                carry >>= 8;
            }
        }

        for (let i = 0; string[i] === '1' && i < string.length - 1; i++)
            bytes.push(0);

        return bytes.reverse().slice(0, 21).map(byte => {
            let temp = byte.toString(16);

            if (temp.length == 1)
                temp = `0${temp}`;

            return temp;
        }).join('');
    },    

    hexToBase58(string) {
        const primary = this.sha256(string);
        const secondary = this.sha256(primary);

        const buffer = ByteArray.fromHexString(string + secondary.slice(0, 8));
        const digits = [ 0 ];

        for (let i = 0; i < buffer.length; i++) {
            for (let j = 0; j < digits.length; j++) 
                digits[j] <<= 8;

            digits[0] += buffer[i];

            let carry = 0;

            for (let j = 0; j < digits.length; ++j) {
                digits[j] += carry;
                carry = (digits[j] / 58) | 0;
                digits[j] %= 58;
            }

            while (carry) {
                digits.push(carry % 58);
                carry = (carry / 58) | 0;
            }
        }

        for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) 
            digits.push(0);

        return digits.reverse().map(digit => ALPHABET[digit]).join('');
    },

    isString(string) {
        return Object.prototype.toString.call(string) === '[object String]';
    },

    isNumber(number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    },

    validateDescription(desc) {
        if (desc && !this.isString(desc))
            return false;

        if (desc && desc.length > 240)
            return false;

        if (desc && !desc.length)
            return false;

        return true;
    },

    validateAmount(amount) {
        return this.isNumber(amount) && amount > 0;
    }
};

export default utils;