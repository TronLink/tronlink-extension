import StorageService from '../StorageService';
import TronWeb from 'tronweb';
import Logger from '@tronlink/lib/logger';
import Utils from '@tronlink/lib/utils';
import NodeService from '../NodeService';
import TransactionMapper from './TransactionMapper';

import { BigNumber } from 'bignumber.js';

import {
    ACCOUNT_TYPE,
    SUPPORTED_CONTRACTS
} from '@tronlink/lib/constants';

const logger = new Logger('WalletService/Account');

class Account {
    constructor(accountType, importData, accountIndex = 0) {
        this.type = accountType;
        this.accountIndex = accountIndex;

        this.address = false;
        this.name = false;
        this.updatingTransactions = false;

        this.energy = 0;
        this.balance = 0;
        this.bandwidth = 0;
        this.lastUpdated = 0;

        this.ignoredTransactions = [];
        this.transactions = {};
        this.tokens = {
            basic: {},
            smart: {}
        };
        //this.listTokens = [];
        if(accountType == ACCOUNT_TYPE.MNEMONIC)
            this._importMnemonic(importData);
        else this._importPrivateKey(importData);
        this.loadCache();
        this._cacheTransactions();
        this.loadTokenList() ;
    }

    static generateAccount() {
        const mnemonic = Utils.generateMnemonic();

        return new Account(
            ACCOUNT_TYPE.MNEMONIC,
            mnemonic
        );
    }

    async _cacheTransactions() {
        const { address } = this;
        const txID = StorageService.getNextPendingTransaction(address);

        if(!txID)
            return setTimeout(() => this._cacheTransactions(), 3000);

        logger.info(`Caching transaction ${ txID }`);

        StorageService.removePendingTransaction(address, txID);

        const txData = await NodeService.tronWeb.trx.getTransactionInfo(txID);

        if(!txData.id) {
            logger.info(`Transaction ${ txID } is still missing`);
            StorageService.addPendingTransaction(address, txID);

            return setTimeout(() => this._cacheTransactions(), 3000);
        }

        logger.info(`Transaction ${ txID } has been cached`);

        const transaction = this.transactions[ txID ];

        transaction.cached = true;
        transaction.timestamp = txData.blockTimeStamp;
        transaction.receipt = txData.receipt || false;
        transaction.result = txData.contractResult || false;

        this.transactions[ txID ] = transaction;
        this.save();

        this._cacheTransactions();
    }

    _importMnemonic(mnemonic) {
        if(!Utils.validateMnemonic(mnemonic))
            throw new Error('INVALID_MNEMONIC');

        this.mnemonic = mnemonic;

        const {
            privateKey,
            address
        } = this.getAccountAtIndex(this.accountIndex);

        this.privateKey = privateKey;
        this.address = address;
    }

    _importPrivateKey(privateKey) {
        try {
            this.privateKey = privateKey;
            this.address = TronWeb.address.fromPrivateKey(privateKey);
        } catch (ex) { // eslint-disable-line
            throw new Error('INVALID_PRIVATE_KEY');
        }
    }

    getAccountAtIndex(index = 0) {
        if(this.type !== ACCOUNT_TYPE.MNEMONIC)
            throw new Error('Deriving account keys at a specific index requires a mnemonic account');

        return Utils.getAccountAtIndex(
            this.mnemonic,
            index
        );
    }

    async loadTokenList() {
        let listTokens = [];
        const cacheListTokens = StorageService.getListTokens();
        console.log('cacheListTokens', cacheListTokens);
        if(!cacheListTokens.length) {
            listTokens = await NodeService.tronWeb.trx.listTokens();
            StorageService.saveListTokens(listTokens);
        }
        else
            listTokens = cacheListTokens;
        return listTokens;
    }

    loadCache() {
        if(!StorageService.hasAccount(this.address))
            return logger.warn('Attempted to load cache for an account that does not exist');

        const {
            type,
            name,
            balance,
            transactions,
            tokens,
            bandwidth,
            energy,
            lastUpdated
        } = StorageService.getAccount(this.address);

        this.type = type;
        this.name = name;
        this.balance = balance;
        this.transactions = transactions;
        this.tokens = tokens;
        this.bandwidth = bandwidth;
        this.energy = energy;
        this.lastUpdated = lastUpdated;
    }

    async getTransactions() {
        const transactions = [];

        let hasMoreTransactions = true;
        let offset = 0;

        while(hasMoreTransactions) {
            const newTransactions = (await NodeService.tronWeb.trx
                .getTransactionsRelated(this.address, 'all', 90, offset))
                .map(transaction => {
                    transaction.offset = offset;
                    return transaction;
                });

            if(!newTransactions.length)
                hasMoreTransactions = false;
            else offset += 90;

            transactions.push(...newTransactions);
        }

        return transactions;
    }

    matches(accountType, importData) {
        if(this.type !== accountType)
            return false;

        if(accountType == ACCOUNT_TYPE.MNEMONIC && this.mnemonic == importData)
            return true;

        if(accountType == ACCOUNT_TYPE.PRIVATE_KEY && this.privateKey == importData)
            return true;

        return false;
    }

    reset() {
        this.balance = 0;
        this.energy = 0;
        this.bandwidth = 0;

        this.transactions = {};
        this.ignoredTransactions = [];

        Object.keys(this.tokens.smart).forEach(address => (
            this.tokens.smart[ address ].balance = 0
        ));

        Object.keys(this.tokens.basic).forEach(token => (
            this.tokens.basic[ token ] = 0
        ));
    }

    async update() {
        const {
            address,
            tokens
        } = this;

        logger.info(`Requested update for ${ address }`);
        const listTokens = await this.loadTokenList();

        const accountExists = await NodeService.tronWeb.trx.getUnconfirmedAccount(address)
            .then(account => {
                if(!account.address) {
                    logger.info(`Account ${ address } does not exist on the network`);

                    this.reset();
                    return false;
                }
                this.tokens.basic = (account.assetV2 || []).filter(({ value }) => {
                    return value > 0;
                }).reduce((tokens, { key, value}) => {
                    const filter = listTokens.filter(v => v.id === key);
                    if(filter.length > 0) {
                        const name = filter[ 0 ].name;
                        const precision = filter[ 0 ].precision ? filter[ 0 ].precision : 0;
                        const v = value / Math.pow(10, precision);
                        tokens[ key ] = { value: v, name, precision };
                    }
                    return tokens;
                }, {});
                this.balance = account.balance || 0;
                this.lastUpdated = Date.now();
                return true;
            }).catch(ex => {
                logger.error(`Failed to update account ${ address }:`, ex);
                return false;
            });

        if(!accountExists)
            return this.save();

        await Promise.all([
            this.updateBalance(),
            this.updateTokens(tokens.smart)
        ]);

        logger.info(`Account ${ address } successfully updated`);

        this.save();

        /*const {
            cached,
            uncached
        } = Object.values(this.transactions).reduce((obj, transaction) => {
            if(!transaction.cached)
                obj.uncached[transaction.txID] = transaction;
            else obj.cached.push(transaction);

            return obj;
        }, {
            cached: [],
            uncached: {}
        });

        this.transactions = uncached;

        cached.sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 100)
            .forEach(transaction => {
                this.transactions[transaction.txID] = transaction;
            });*/
    }

    async updateBalance() {
        const { address } = this;

        await NodeService.tronWeb.trx.getBandwidth(address)
            .then((bandwidth = 0) => (
                this.bandwidth = bandwidth
            ));

        await NodeService.tronWeb.trx.getAccountResources(address)
            .then(({ EnergyLimit = 0 }) => (
                this.energy = EnergyLimit
            ));
    }

    async updateTransactions() {
        if(this.updatingTransactions)
            return;

        this.updatingTransactions = true;

        const transactions = await this.getTransactions().catch(() => {
            logger.error('Failed to update transactions for', this.address);
            this.updatingTransactions = false;

            return [];
        });

        const filteredTransactions = transactions
            .filter(({ txID }) => (
                !Object.keys(this.transactions).includes(txID) &&
                !this.ignoredTransactions.includes(txID)
            ));

        const mappedTransactions =
            TransactionMapper.mapAll(filteredTransactions)
                .filter(({ type }) => SUPPORTED_CONTRACTS.includes(type));

        const newTransactions = [];
        const manuallyCached = [];

        for(const transaction of mappedTransactions) {
            if(transaction.timestamp) {
                transaction.cached = true;
                newTransactions.push(transaction);
                continue;
            }

            const txData = await NodeService.tronWeb.trx
                .getTransactionInfo(transaction.txID);

            if(!txData.id) {
                logger.warn(`Transaction ${ transaction.txID } has not been cached, skipping`);
                continue;
            }

            // if(!txData.id) {
            //     logger.warn(`Transaction ${ transaction.txID } has not been cached`);
            //
            //     StorageService.addPendingTransaction(address, transaction.txID);
            //     transaction.cached = false;
            //
            //     this.transactions[transaction.txID] = transaction;
            //     continue;
            // }

            // logger.info(`Transaction ${ transaction.txID } has been cached`, transaction);

            transaction.cached = true;
            transaction.timestamp = txData.blockTimeStamp;
            transaction.receipt = txData.receipt || false;
            transaction.result = txData.contractResult || false;

            newTransactions.push(transaction);
            manuallyCached.push(transaction.txID);
        }

        const sortedTransactions = [
            ...Object.values(this.transactions),
            ...newTransactions
        ].sort((a, b) => b.timestamp - a.timestamp);

        this.transactions = sortedTransactions
            .slice(0, 100)
            .reduce((transactions, transaction) => {
                transactions[ transaction.txID ] = transaction;
                return transactions;
            }, {});

        manuallyCached.forEach(txID => {
            if(txID in this.transactions)
                return;

            // Transaction is now too old for TronLink (100+)
            this.ignoredTransactions.push(txID);
        });

        this.updatingTransactions = false;
        this.save();
    }

    async updateTokens(tokens) {
        const { address } = this;

        for(const tokenAddress in tokens) {
            try {
                const contract = await NodeService.tronWeb.contract().at(tokenAddress);
                const balance = await contract.balanceOf(address).call();
                const bn = new BigNumber(balance.balance || balance);

                if(bn.isNaN())
                    tokens[ tokenAddress ].balance = '0';
                else tokens[ tokenAddress ].balance = bn.toString();
            } catch(ex) {
                if(ex.toString().includes('not been deployed')) {
                    tokens[ tokenAddress ].balance = 0;
                    continue;
                }

                logger.error(`Failed to fetch token balance of ${ tokenAddress }:`, ex);
            }
        }

        this.tokens.smart = tokens;
    }

    async addSmartToken({ address, name, decimals, symbol }) {
        logger.info(`Adding TRC20 token '${ address }' ${ name } (${ symbol }) to account '${ this.address }'`);

        let balance = 0;

        try {
            const contract = await NodeService.tronWeb.contract().at(address);
            const balanceObj = await contract.balanceOf(this.address).call();

            const bn = new BigNumber(balanceObj.balance || balanceObj);

            if(bn.isNaN())
                balance = '0';
            else balance = bn.toString();
        } catch {}

        this.tokens.smart[ address ] = {
            balance,
            decimals,
            symbol,
            name
        };

        return this.save();
    }

    getDetails() {
        return {
            tokens: this.tokens,
            type: this.type,
            name: this.name,
            address: this.address,
            balance: this.balance,
            bandwidth: this.bandwidth,
            energy: this.energy,
            transactions: this.transactions,
            lastUpdated: this.lastUpdated
        };
    }

    export() {
        return JSON.stringify(this);
    }

    save() {
        StorageService.saveAccount(this);
    }

    async sign(transaction) {
        const tronWeb = NodeService.tronWeb;
        const signedTransaction = tronWeb.trx.sign(
            transaction,
            this.privateKey
        );

        return await signedTransaction;
    }

    async sendTrx(recipient, amount) {
        try {
            const transaction = await NodeService.tronWeb.transactionBuilder.sendTrx(
                recipient,
                amount
            );

            await NodeService.tronWeb.trx.sendRawTransaction(
                await this.sign(transaction)
            ).then(() => true).catch(err => Promise.reject(
                'Failed to broadcast transaction'
            ));
        } catch(ex) {
            logger.error('Failed to send TRX:', ex);
            return Promise.reject(ex);
        }
    }

    async sendBasicToken(recipient, amount, token) {
        try {
            const transaction = await NodeService.tronWeb.transactionBuilder.sendToken(
                recipient,
                amount,
                token
            );

            await NodeService.tronWeb.trx.sendRawTransaction(
                await this.sign(transaction)
            ).then(() => true).catch(err => Promise.reject(
                'Failed to broadcast transaction'
            ));
        } catch(ex) {
            logger.error('Failed to send basic token:', ex);
            return Promise.reject(ex);
        }
    }

    async sendSmartToken(recipient, amount, token) {
        try {
            const contract = await NodeService.tronWeb.contract().at(token);

            await contract.transfer(recipient, amount).send(
                {},
                this.privateKey
            );

            return true;
        } catch(ex) {
            logger.error('Failed to send smart token:', ex);
            return Promise.reject(ex);
        }
    }
}

export default Account;
