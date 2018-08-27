import { BigNumber } from 'bignumber.js';

import Logger from 'lib/logger';
import Utils from 'lib/utils';

const logger = new Logger('TronLink');

/**
 * TronLink API v1
 * - Exposes node, wallet and utility methods
 * @class TronLink
 */
class TronLink {
    /**
     * Creates an instance of TronLink v1
     * @param {object} linkedRequest Event handler for data communication with backgroundScript
     * @param {string} [network='mainnet'] Network type to configure the API with for address validation
     * @memberof TronLink
     */
    constructor(linkedRequest, network = 'mainnet') {
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

    /**
     * External node methods for communicating with the blockchain
     * @readonly
     * @memberof TronLink
     */
    get node() {
        return {
            /**
             * Returns the latest tracked block
             * @readonly
             * @memberof TronLink
             */
            getLatestBlock: () => {
                return this._dispatch('getLatestBlock');
            },
            /**
             * Returns the current list of tracked witnesses
             * @readonly
             * @memberof TronLink
             */
            getWitnesses: () => {
                return this._dispatch('getWitnesses');
            },
            /**
             * Returns all tokens that are currently tracked
             * @readonly
             * @memberof TronLink
             */
            getTokens: () => {
                return this._dispatch('getTokens');
            },
            /**
             * Returns a block given a valid blockID
             * @param {string} blockID A valid blockID for a tracked block on the blockchain
             * @readonly
             * @memberof TronLink
             */
            getBlock: blockID => {
                return this._dispatch('getBlock', { blockID });
            },
            /**
             * Returns a transaction given a valid transactionID
             * @param {string} transactionID A valid transactionID for a tracked block on the blockchain
             * @readonly
             * @memberof TronLink
             */
            getTransaction: transactionID => {
                return this._dispatch('getTransaction', { transactionID });
            },
            /**
             * Returns the transaction info given a valid transactionID
             * @param {string} transactionID A valid transactionID for a tracked block on the blockchain
             * @readonly
             * @memberof TronLink
             */
            getTransactionInfo: transactionID => {
                return this._dispatch('getTransactionInfo', { transactionID });
            },
            /**
             * Returns an account given a valid hex, base58 or base64 address
             * @param {string} address A valid hex, base58 or base64 address belonging to an account that has received TRX in the past
             * @readonly
             * @memberof TronLink
             */
            getAccount: address => {
                if (!this.utils.validateAddress(address))
                    throw new Error('Invalid address provided');

                return this._dispatch('nodeGetAccount', { address });
            }
        };
    }

    /**
     * External wallet methods for communicating with the blockchain.
     * @readonly
     * @memberof TronLink
     */
    get wallet() {
        return {
            /**
             * Requests confirmation from the end user to send tron to the specified address. Will broadcast the transaction if accepted
             * @param {string} recipient A valid hex, base58 or base64 address of the recipient
             * @param {number} amount The amount of TRX the end user should send
             * @param {string} [desc=false] Transaction description with a maximum of 240 characters to display in the confirmation dialog
             * @readonly
             * @memberof TronLink
             */
            sendTron: (recipient, amount, desc = false) => {
                const address = this.utils.validateAddress(recipient);

                if (!address)
                    throw new Error('Invalid recipient provided');

                if (!Utils.validateAmount(amount))
                    throw new Error('Invalid amount provided');

                if (!Utils.validateDescription(desc))
                    throw new Error('Invalid description provided');

                return this._dispatch('sendTron', {
                    recipient: address,
                    amount: amount * 1000000,
                    desc
                });
            },
            /**
             * Requests confirmation from the end user to send an asset to the specified address. Will broadcast the transaction if accepted
             * @param {string} recipient A valid hex, base58 or base64 address of the recipient
             * @param {number} amount The amount of the asset the end user should send
             * @param {string} assetID The ID of the asset you would like the end user to send. You can obtain this from the token list
             * @param {string} [desc=false] Transaction description with a maximum of 240 characters to display in the confirmation dialog
             * @readonly
             * @memberof TronLink
             */
            sendAsset: (recipient, amount, assetID, desc) => {
                const address = this.utils.validateAddress(recipient);

                if (!address)
                    throw new Error('Invalid recipient provided');

                if (!Utils.validateAmount(amount))
                    throw new Error('Invalid amount provided');

                if (!Utils.validateDescription(desc))
                    throw new Error('Invalid description provided');

                return this._dispatch('sendAsset', {
                    recipient: address,
                    amount: amount * 1000000,
                    assetID,
                    desc
                });
            },
            /**
             * Requests confirmation from the end user to freeze tron for the specified duration. Will broadcast the transaction if accepted
             * @param {number} amount The amount of TRX the end user should freeze
             * @param {number} duration The duration (in days) of how long the TRX should be frozen for
             * @readonly
             * @memberof TronLink
             */
            freeze: (amount, duration) => {
                if (!Number.isInteger(amount) || amount <= 0)
                    throw new Error('Invalid amount provided');

                if (!Number.isInteger(duration) || duration <= 0)
                    throw new Error('Invalid duration provided');

                return this._dispatch('freezeTrx', { amount, duration });
            },
            /**
             * Requests confirmation from the end user to unfreeze all of their current frozen TRX. Will broadcast the transaction if accepted
             * @readonly
             * @memberof TronLink
             */
            unfreeze: () => {
                return this._dispatch('unfreezeTrx', {});
            },
            /**
             * Requests confirmation from the end user to sign and broadcast a transaction. Will broadcast the transaction if accepted
             * @param {string} transaction The transaction for the user to sign and broadcast
             * @readonly
             * @memberof TronLink
             */
            sendTransaction: transaction => {
                return this._dispatch('sendTransaction', { transaction });
            },
            /**
             * Requests confirmation from the end user to sign a transaction without broadcasting it
             * @param {string} transaction The transaction for the user to sign
             * @readonly
             * @memberof TronLink
             */
            signTransaction: transaction => {
                return this._dispatch('signTransaction', { transaction });
            },
            /**
             * Requests confirmation from the end user to simulate a smart contract call
             * @param {string} address The address that hosts the smart contract
             * @param {object} functionSelector The function to be triggered
             * @param {array} [parameters=[]] Any parameters that the function takes
             * @param {object} [options={}] Any options to pass to the node, such as storage_limit, cpu_limit or drop_limit
             * @readonly
             * @memberof TronLink
             */
            simulateSmartContract: (address, functionSelector, parameters = [], options = {}) => {
                if (!this.utils.validateAddress(address))
                    throw new Error('Invalid smart contract address provided');

                return this._dispatch('simulateSmartContract', {
                    address,
                    functionSelector,
                    parameters,
                    options
                });
            },
            /**
             * Requests confirmation from the end user to create and deploy a smart contract. Will deploy the contract if accepted
             * @param {string} abi The ABI configuration for the smart contract
             * @param {string} bytecode The compiled bytecode for the smart contract
             * @param {object} [options={}] Any options to pass to the node, such as storage_limit, cpu_limit or drop_limit
             * @readonly
             * @memberof TronLink
             */
            createSmartContract: (abi, bytecode, name, options = {
                feeLimit: 10000000,
                callValue: 0
            }) => this._dispatch('createSmartContract', {
                abi,
                bytecode,
                name,
                options
            }),
            /**
             * Requests confirmation from the end user to trigger a smart contract call
             * @param {string} address The address that hosts the smart contract
             * @param {object} functionSelector The function to be triggered
             * @param {array} [parameters=[]] Any parameters that the function takes
             * @param {object} [options={}] Any options to pass to the node, such as storage_limit, cpu_limit or drop_limit
             * @readonly
             * @memberof TronLink
             */
            triggerSmartContract: (address, functionSelector, parameters = [], options = {
                feeLimit: 10000000,
                callValue: 0
            }) => this._dispatch('triggerSmartContract', {
                address,
                functionSelector,
                parameters,
                options
            }),
            /**
             * Requests confirmation from the end user to trigger a smart contract call
             * @param {string} address The address that hosts the smart contract
             * @param {object} functionSelector The function to be triggered
             * @param {array} [parameters=[]] Any parameters that the function takes
             * @param {object} [options={}] Any options to pass to the node, such as storage_limit, cpu_limit or drop_limit
             * @readonly
             * @memberof TronLink
             */
            callSmartContract: (address, functionSelector, parameters = [], options = {
                feeLimit: 10000000,
                callValue: 0
            }) => this._dispatch('callSmartContract', {
                address,
                functionSelector,
                parameters,
                options
            }),
            /**
             * Returns the current active account used in the extension by the end user
             * @readonly
             * @memberof TronLink
             */
            getAccount: () => {
                return this._dispatch('getAccount');
            }
        };
    }

    get utils() {
        return {
            /**
             * Validates an address
             * @param {string} address The address to validate
             * @returns {(string|boolean)} The base58 transformed address on success, or false on failure
             * @readonly
             * @memberof TronLink
             */
            validateAddress: input => {
                logger.info(`Validating address ${input}`);

                const address = Utils.transformAddress(input);

                if (!address)
                    logger.warn(`Address ${input} is invalid`);
                else logger.info(`Address ${input} is valid, base58 transformation: ${address}`);

                return address;
            },
            /**
             * Converts SUN to TRX
             * @param {number} sun The amount of SUN to convert to TRX
             * @returns {number} The result of dividing the input by 1,000,000. Use .toNumber() to convert to a JavaScript Number, or toString() to convert to a string
             * @readonly
             * @memberof TronLink
             */
            sunToTron: sun => {
                return (new BigNumber(sun)).dividedBy(1000000);
            },
            /**
             * Converts TRX to SUN
             * @param {number} tron The amount of TRX to convert to SUN
             * @returns {number} The result of multiplying the input by 1,000,000. Use .toNumber() to convert to a JavaScript Number, or toString() to convert to a string
             * @readonly
             * @memberof TronLink
             */
            tronToSun: tron => {
                return (new BigNumber(tron)).multipliedBy(1000000);
            }
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
