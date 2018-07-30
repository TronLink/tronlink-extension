import { BigNumber } from 'bignumber.js';

import Logger from 'lib/logger';
import ByteArray from 'lib/ByteArray';
import Utils from 'lib/utils';

const logger = new Logger('TronLink');

const TRON_CONSTANTS_BASE = {
    ADDRESS_SIZE: 42,
    TRANSACTION_MAX_BYTE_SIZE: 500 * 1024,
    MAXIMUM_TIME_UNTIL_EXPIRATION: 24 * 60 * 60 * 1000,
    TRANSACTION_DEFAULT_EXPIRATION_TIME: 60 * 1000
};

const TRON_CONSTANTS_MAINNET = {
    ADD_PRE_FIX_BYTE: 0x41,
    ADD_PRE_FIX_STRING: '41',
};

const TRON_CONSTANTS_TESTNET = {
    ADD_PRE_FIX_BYTE: 0xa0,
    ADD_PRE_FIX_STRING: 'a0',
};

class TronLink {
    constructor(linkedRequest, network = 'mainnet') {
        if (network !== 'mainnet' && network !== 'testnet')
            throw new Error('Invalid network supplied. Expected mainnet or testnet');

        this._linkedRequest = linkedRequest;
        this._extensionUrl = `chrome-extension://${ EXTENSION_ID }`;
        this._network = network;

        if (this._network === 'mainnet')
            this._constants = { ...TRON_CONSTANTS_BASE, ...TRON_CONSTANTS_MAINNET };
        else this._constants = { ...TRON_CONSTANTS_BASE, ...TRON_CONSTANTS_TESTNET };

        return new Proxy(this, {
            get(target, name) {
                if (name.startsWith('_'))
                    throw new Error('Failed to access private property');

                return target[ name ];
            }
        });
    }

    get node() {
        return {
            getLatestBlock: () => {
                return this._dispatch('getLatestBlock');
            },
            getWitnesses: () => {
                return this._dispatch('getWitnesses');
            },
            getTokens: () => {
                return this._dispatch('getTokens');
            },
            getBlock: blockID => {
                return this._dispatch('getBlock', { blockID });
            },
            getTransaction: transactionID => {
                return this._dispatch('getTransaction', { transactionID });
            },
            getAccount: address => {
                if (!this.utils.validateAddress(address))
                    throw new Error('Invalid address provided');

                return this._dispatch('nodeGetAccount', { address });
            }
        };
    }

    get wallet() {
        return {
            sendTron: (recipient, amount, desc = false) => {
                if (!this.utils.validateAddress(recipient))
                    throw new Error('Invalid recipient provided');

                if (!Utils.validateAmount(amount))
                    throw new Error('Invalid amount provided');

                if (!Utils.validateDescription(desc))
                    throw new Error('Invalid description provided');

                return this._dispatch('sendTron', { recipient, amount, desc });
            },
            sendAsset: (recipient, amount, assetID, desc) => {
                if (!this.utils.validateAddress(recipient))
                    throw new Error('Invalid recipient provided');

                if (!Utils.validateAmount(amount))
                    throw new Error('Invalid amount provided');

                if (!Utils.validateDescription(desc))
                    throw new Error('Invalid description provided');

                return this._dispatch('sendAsset', { recipient, amount, assetID, desc });
            },
            freeze: (amount, duration) => {
                if (!Number.isInteger(amount) || amount <= 0)
                    throw new Error('Invalid amount provided');

                if (!Number.isInteger(duration) || duration <= 0)
                    throw new Error('Invalid duration provided');

                return this._dispatch('freezeTrx', { amount, duration });
            },
            unfreeze: () => {
                return this._dispatch('unfreezeTrx', {});
            },
            sendTransaction: transaction => {
                return this._dispatch('sendTransaction', { transaction });
            },
            signTransaction: transaction => {
                return this._dispatch('signTransaction', { transaction });
            },
            simulateSmartContract: (address, data) => {
                if (!this.utils.validateAddress(address))
                    throw new Error('Invalid smart contract address provided');

                return this._dispatch('simulateSmartContract', { address, data });
            },
            createSmartContract: (abi, bytecode) => {
                return this._dispatch('createSmartContract', { abi, bytecode });
            },
            getAccount: () => {
                return this._dispatch('getAccount');
            }
        };
    }

    get utils() {
        return {
            validateAddress: input => {
                logger.info(`Validating address ${input}`);

                const type = this._transformAddress(input);

                if (!type)
                    logger.warn(`Address ${input} is invalid`);
                else logger.info(`Address ${input} is valid, type ${type}`);

                return type;
            },
            sunToTron: sun => {
                return (new BigNumber(sun)).dividedBy(1000000);
            },
            tronToSun: tron => {
                return (new BigNumber(tron)).multipliedBy(1000000);
            }
        };
    }

    _dispatch(method, args = {}) {
        return this._linkedRequest.build({ method, args });
    }

    _validateAddress(address, type) {
        if (((address.length * 2) | 0) !== this._constants.ADDRESS_SIZE)
            return false;

        if (address[ 0 ] !== this._constants.ADD_PRE_FIX_BYTE)
            return false;

        return type;
    }

    _transformAddress(address) {
        if (!Utils.isString(address))
            return false;

        switch (address.length) {
            case this._constants.ADDRESS_SIZE:
                // Hex
                return this._validateAddress(
                    ByteArray.fromHexString(address),
                    'hex'
                );
            case 34:
                // Base58
                return this._validateAddress(
                    ByteArray.fromHexString(
                        Utils.base58ToHex(address)
                    ),
                    'base58'
                );
            case 28:
                // Base64
                return this._validateAddress(
                    ByteArray.fromHexString(
                        Utils.base64ToHex(address)
                    ),
                    'base64'
                );
        }

        return false;
    }
}

export default TronLink;

// Not Implemented
//
//    get proxy() {
//        const solidityUrls = [
//            'getaccount', 'listwitnesses', 'getassetissuelist',
//            'getpaginatedassetissuelist', 'getnowblock', 'getblockbynum',
//            'gettransactionbyid', 'gettransactioninfobyid', 'gettransactionsfromthis',
//            'gettransactionstothis',
//        ];
//
//        const walletUrls = [
//            'createtransaction', 'gettransactionsign', 'broadcasttransaction',
//            'updateaccount', 'votewitnessaccount', 'createassetissue',
//            'createaccount', 'createwitness', 'transferasset',
//            'easytransfer', 'easytransferbyprivate', 'createaddress',
//            'generateaddress', 'participateassetissue', 'freezebalance',
//            'unfreezebalance', 'unfreezeasset', 'withdrawbalance',
//            'updateasset', 'listnodes', 'getassetissuebyaccount',
//            'getaccountnet', 'getassetissuebyname', 'getnowblock',
//            'getblockbynum', 'getblockbyid', 'getblockbylimitnext',
//            'getblockbylatestnum', 'gettransactionbyid', 'listwitnesses',
//            'getassetissuelist', 'getpaginatedassetissuelist', 'totaltransaction',
//            'getnextmaintenancetime', 'validateaddress',
//        ];
//
//        return {
//            walletsolidity: solidityUrls.reduce((obj, method) => {
//                obj[method] = `${this._extensionUrl}/proxy/${method}`;
//                return obj;
//            }, {}),
//            wallet: walletUrls.reduce((obj, method) => {
//                obj[method] = `${this._extensionUrl}/proxy/${method}`;
//                return obj;
//            }, {})
//        };
//    }
//