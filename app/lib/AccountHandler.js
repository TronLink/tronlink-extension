import TronUtils from 'TronUtils';
import Logger from './logger';
import bip39 from 'bip39';
import bip32 from 'bip32';

import { Buffer } from 'buffer/';

import {
    ACCOUNT_TYPE,
    BIP44
} from './constants';

const logger = new Logger('AccountHandler');

export default class AccountHandler {
    constructor(input, accountType = ACCOUNT_TYPE.MNEMONIC) {
        switch(accountType) {
            case ACCOUNT_TYPE.RAW:
                this._importFromPrivateKey(input);
                break;
            case ACCOUNT_TYPE.MNEMONIC:
                this._importFromWordList(input);
                break;
            default:
                throw new Error(`ACCOUNT_TYPE ${accountType} invalid`);
        }
    }

    _importFromPrivateKey(privateKey) {
        logger.info('Importing account from private key');

        this._type = ACCOUNT_TYPE.RAW;
        this._privateKey = privateKey;
        this._publicKey = TronUtils.accounts.privateKeyToAddress(privateKey);
    }

    _importFromWordList(wordList) {
        logger.info('Importing account from word list');

        if(!bip39.validateMnemonic(wordList))
            throw new Error(`Invalid wordList ${wordList} provided`);

        logger.info('Word list was valid');

        this._type = ACCOUNT_TYPE.MNEMONIC;
        this._seed = bip39.mnemonicToSeedHex(wordList);
        this._wordList = wordList;
    }

    getAccountAtIndex(index = 0) {
        logger.info(`Getting account at index ${index}`);

        if(this._type !== ACCOUNT_TYPE.MNEMONIC)
            throw new Error('ACCOUNT_TYPE must be of type MNEMONIC to derive account keys');

        logger.info('Valid account type, deriving key pair');

        const node = bip32.fromSeed(new Buffer(this._seed, 'hex'));
        const child = node.derivePath(`m/44'/${ BIP44.INDEX }'/${ index }'/0/0`, this._seed);

        const privateKey = child.privateKey.toString('hex');
        const publicKey = TronUtils.accounts.privateKeyToAddress(privateKey);

        logger.info(`Generated public key ${publicKey}`);

        return {
            wordList: this._wordList,
            accountType: this._type,
            accountIndex: index,
            name: false,
            internal: false,
            privateKey,
            publicKey,
        };
    }

    export() {
        if(this._type === ACCOUNT_TYPE.MNEMONIC)
            return this._wordList;

        if(this._type === ACCOUNT_TYPE.RAW) {
            return {
                privateKey: this._privateKey,
                publicKey: this._publicKey,
                accountType: this._type,
                name: false,
                internal: false
            };
        }

        return false;
    }

    static generateAccount(size = 256) {
        logger.info(`Generating new account with size ${size}`);

        const mnemonic = bip39.generateMnemonic(size);

        return new AccountHandler(
            mnemonic
        );
    }
}