import TronWeb from 'tronweb';

import Utils from 'lib/utils';
import { CONFIRMATION_METHODS } from 'lib/constants';

//import Logger from 'lib/logger';
//const logger = new Logger('TronLink');

/**
 * TronLink API v1
 * - Exposes node, wallet and utility methods
 * @class TronLink
 */
class TronLink extends TronWeb {
    /**
     * Creates an instance of TronLink v1
     * @param {object} linkedRequest Event handler for data communication with backgroundScript
     * @param {string} [network='mainnet'] Network type to configure the API with for address validation
     */
    constructor(linkedRequest, network = 'mainnet') {
        super('', '');
        if (network !== 'mainnet' && network !== 'testnet')
            throw new Error('Invalid network supplied. Expected mainnet or testnet');

        this._linkedRequest = linkedRequest;
        this._extensionUrl = `chrome-extension://${ EXTENSION_ID }`;
        this._network = network;

        return new Proxy(this, {
            get(target, name) {
                if (name.startsWith('_'))
                    throw new Error('Failed to access private property');

                return target[name];
            }
        });
    }

    get trx() {
        return {
            /**
             * Returns the latest tracked block
             */
            getCurrentBlock: () => {
                return this._dispatch(CONFIRMATION_METHODS.GET_CURRENT_BLOCK);
            },
            /**
             * Returns a block given a block id, block hash, or 'earliest' or 'latest'
             * @param block id, block hash, or 'earliest' or 'latest'
             */
            getBlock: block => {
                return this._dispatch(CONFIRMATION_METHODS.GET_BLOCK, { block });
            },
            /**
             * Returns a block given a block hash
             * @param hash, block hash
             */
            getBlockByHash: hash => {
                //TODO verify that argument is actually a hash
                return this._dispatch(CONFIRMATION_METHODS.GET_BLOCK, { hash });
            },
            /**
             * Returns a block given a block id
             * @param blockID
             */
            getBlockByNumber: blockID => {
                //TODO verify that argument is actually a block id
                return this._dispatch(CONFIRMATION_METHODS.GET_BLOCK, { blockID });
            },
            /**
             * returns transaction count given either a block hash or a block id.
             * @param block
             */
            getBlockTransactionCount: block => {
                //TODO IMPLEMENT
                throw `getBlockTransactionCount(${block} not implemented`;
            },
            /**
             * returns transactions count given either a block hash or a block id.
             * @param block
             */
            getTransactionFromBlock: block => {
                //TODO IMPLEMENT
                throw `getTransactionFromBlock(${block} not implemented`;
            },
            /**
             * Returns a transaction given a valid transactionID
             * @param {string} transactionID A valid transactionID for a tracked block on the blockchain
             */
            getTransaction: transactionID => {
                return this._dispatch(CONFIRMATION_METHODS.GET_TRANSACTION, { transactionID });
            },
            /**
             * Returns the transaction info given a valid transactionID
             * @param {string} transactionID A valid transactionID for a tracked block on the blockchain
             */
            getTransactionInfo: transactionID => {
                return this._dispatch(CONFIRMATION_METHODS.GET_TRANSACTION_INFO, { transactionID });
            },
            /**
             * Returns list of transactions TO this address
             */
            getTransactionsToAddress: (address, limit = 30, offset = 0) => {
                //TODO IMPLEMENT
                throw `getTransactionsToAddress(${address}, ${limit}, ${offset}) not implemented`;
            },
            /**
             * Returns list of transactions FROM this address
             */
            getTransactionsFromAddress: (address, limit = 30, offset = 0) => {
                //TODO IMPLEMENT
                throw `getTransactionsToAddress(${address}, ${limit}, ${offset}) not implemented`;
            },
            /**
             * Returns list of transactions related to this address
             */
            getTransactionsRelated: (address, direction = 'all', limit = 30, offset = 0) => {
                //TODO IMPLEMENT
                throw `getTransactionsToAddress(${address}, ${direction}, ${limit}, ${offset}) not implemented`;
            },
            /**
             * Returns an account given a valid hex, base58 or base64 address
             * @param {string} address A valid hex, base58 or base64 address belonging to an account that has received TRX in the past
             */
            getAccount: address => {
                if (!this.utils.validateAddress(address))
                    throw new Error('Invalid address provided');

                return this._dispatch(CONFIRMATION_METHODS.NODE_GET_ACCOUNT, { address });
            },
            /**
             * Returns balance of an address
             * @param {string} address A valid hex, base58 or base64 address belonging to an account that has received TRX in the past
             */
            getBalance: address => {
                //TODO IMPLEMENT
                throw `getBalance(${address}) not implemented`;
            },
            /**
             * Returns bandwidth of an address
             * @param {string} address A valid hex, base58 or base64 address belonging to an account that has received TRX in the past
             */
            getBandwidth: address => {
                //TODO IMPLEMENT
                throw `getBandwidth(${address}) not implemented`;
            },
            /**
             * Returns token issued by an address
             * @param {string} address A valid hex, base58 or base64 address belonging to an account that has received TRX in the past
             */
            getTokensIssuedByAddress: address => {
                //TODO IMPLEMENT
                throw `getTokensIssuedByAddress(${address}) not implemented`;
            },
            /**
             * Returns the token given its id
             * @param {string} tokenID
             */
            getTokenFromId: tokenID => {
                //TODO IMPLEMENT
                throw `getTokenFromId(${tokenID}) not implemented`;
            },
            /**
             * Returns nodes in the network
             */
            listNodes: () => {
                //TODO IMPLEMENT
                throw 'listNodes() not implemented';
            },
            /**
             * Returns blocks in the given range.
             */
            getBlockRange: (start = 0, end = 30) => {
                //TODO IMPLEMENT
                throw `getBlockRange(${start}, ${end}) not implemented`;
            },
            /**
             * Returns the current list of super representatives in the network.
             */
            listSuperRepresentatives: () => {
                return this._dispatch(CONFIRMATION_METHODS.LIST_SUPER_REPRESENTATIVES);
            },
            /**
             * Returns all basic tokens in the network.
             */
            listTokens: () => {
                return this._dispatch(CONFIRMATION_METHODS.LIST_TOKENS);
            },
            /**
             * Returns time until next vote cycle
             */
            timeUntilNextVoteCycle: () => {
                //TODO IMPLEMENT
                throw 'timeUntilNextVoteCycle(not implemented';
            },
            /**
             * Returns the contract given its address
             * @param contractAddress {string} valid hex string of existing smart contract in the network
             */
            getContract: contractAddress => {
                //TODO IMPLEMENT
                throw `getContract(${contractAddress} not implemented`;
            },
            /**
             * Returns signed transaction
             * @param transaction
             */
            sign: transaction => {
                //TODO IMPLEMENT
                throw `sign(${transaction} not implemented`;
            },
            /**
             * @param transaction
             */
            sendRawTransaction: transaction => {
                //TODO IMPLEMENT
                throw `sendRawTransaction(${transaction} not implemented`;
            },
            /**
             * Requests confirmation from the end user to send tron to the specified address. Will broadcast the transaction if accepted
             * @param {string} to A valid hex, base58 or base64 address of the recipient
             * @param {number} amount The amount of TRX the end user should send
             * @param {string} [desc=false] Transaction description with a maximum of 240 characters to display in the confirmation dialog
             */
            sendTransaction: (to, amount, desc = false) => {
                const address = this.utils.validateAddress(to);

                if (!address)
                    throw new Error('Invalid recipient provided');

                if (!Utils.validateAmount(amount))
                    throw new Error('Invalid amount provided');

                if (!Utils.validateDescription(desc))
                    throw new Error('Invalid description provided');

                return this._dispatch(CONFIRMATION_METHODS.SEND_TRX, {
                    to: address,
                    amount: amount * 1000000,
                    desc
                });
            },
            /**
             * Requests confirmation from the end user to send an asset to the specified address. Will broadcast the transaction if accepted
             * @param {string} to A valid hex, base58 or base64 address of the recipient
             * @param {number} amount The amount of the asset the end user should send
             * @param {string} tokenID The ID of the asset you would like the end user to send. You can obtain this from the token list
             * @param {string} [desc=false] Transaction description with a maximum of 240 characters to display in the confirmation dialog
             */
            sendToken: (to, amount, tokenID, desc) => {
                const address = this.utils.validateAddress(to);

                if (!address)
                    throw new Error('Invalid recipient provided');

                if (!Utils.validateAmount(amount))
                    throw new Error('Invalid amount provided');

                if (!Utils.validateDescription(desc))
                    throw new Error('Invalid description provided');

                return this._dispatch(CONFIRMATION_METHODS.SEND_ASSET, {
                    to: address,
                    amount,
                    tokenID,
                    desc
                });
            },

            sendAsset: (...args) => {
                return this.sendToken(...args);
            },

            send: (...args) => {
                return this.sendTransaction(...args);
            },

            sendTrx: (...args) => {
                return this.sendTransaction(...args);
            },

            broadcast: (...args) => {
                return this.sendRawTransaction(...args);
            },

            signTransaction: (...args) => {
                return this.sign(...args);
            },
        };
    }

    /**
     * @private
     */
    _dispatch(method, args = {}) {
        return this._linkedRequest.build({ method, args });
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
