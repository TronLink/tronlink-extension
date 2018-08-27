import TronUtils from 'TronUtils';
import Logger from 'lib/logger';
import Utils from 'lib/utils';
import AccountHandler from 'lib/AccountHandler';

import {
    WALLET_STATUS
} from 'lib/constants';

const logger = new Logger('wallet');
const rpc = new TronUtils.rpc();

export default class Wallet {
    constructor() {
        this._walletStatus = WALLET_STATUS.UNINITIALIZED;

        this._accounts = {};
        this._internalAccounts = 0;
        this._rootAccount = false;
        this._mnemonic = false;
        this._password = false;
        this._currentAccount = false;
        this._encryptedStorage = false;

        this._loadWallet();
    }

    get status() {
        return this._walletStatus;
    }

    _loadWallet() {
        this._encryptedStorage = Utils.loadStorage();

        if (this._encryptedStorage)
            this._walletStatus = WALLET_STATUS.LOCKED;
    }

    getFullAccount() {
        if (this._accounts[this._currentAccount])
            return this._accounts[this._currentAccount];

        const keys = Object.keys(this._accounts);

        this._currentAccount = keys[0];
        this._saveStorage();

        return this._accounts[this._currentAccount];
    }

    async send(recipient, amount) {
        const account = this.getFullAccount();

        logger.info(`Sending from ${account.publicKey} to ${recipient}, amount: ${amount}`);

        return rpc.sendTrx(
            account.privateKey,
            recipient,
            amount
        );
    }

    async sendAsset(recipient, asset, amount) {
        const account = this.getFullAccount();
        logger.info(`Sending asset from ${account.publicKey} to ${recipient}, asset: ${asset}, amount: ${amount}`);

        return rpc.sendAsset(
            account.privateKey,
            recipient,
            asset,
            amount
        );
    }

    async triggerSmartContract(address, functionSelector, parameters, options) {
        const account = this.getFullAccount();

        logger.info(`Triggering smart contract from ${account.publicKey}`, {
            address,
            functionSelector,
            parameters,
            options
        });

        return rpc.triggerContract(
            account.privateKey,
            address,
            functionSelector,
            parameters,
            options
        );
    }

    async createSmartContract(abi, bytecode, name, options) {
        const account = this.getFullAccount();

        logger.info(`Creating smart contract from account ${account.publicKey}`, { abi, bytecode, name, options });

        return rpc.deployContract(
            account.privateKey,
            abi,
            bytecode,
            name,
            options
        );
    }

    _saveStorage(password = false) {
        if (!this._password && !password)
            throw 'Storage requires a password for encryption';

        this._encryptedStorage = Utils.encrypt(JSON.stringify({
            accounts: this._accounts,
            mnemonic: this._mnemonic,
            currentAccount: this._currentAccount,
            internalAccounts: this._internalAccounts
        }), this._password || password);

        if (!this._password)
            this._password = password;

        logger.info('Saving storage');
        Utils.saveStorage(this._encryptedStorage);
    }

    async updateAccount(address, save = false) {
        logger.info(`Account update requested for ${address}`);

        const account = await rpc.getAccount(address);
        const transactions = await rpc.getTransactions(address);

        logger.info('Account updated', { account, transactions });

        this._accounts[address] = {
            ...this._accounts[address],
            transactions: Utils.convertTransactions(transactions, address),
            tokens: {},
            balance: account.balance || 0
        };

        if (save)
            this._saveStorage();
    }

    async updateAccounts() {
        logger.info('Requesting batch account update');

        for (const address in this.getAccounts())
            await this.updateAccount(address, false);

        this._saveStorage();

        logger.info('Batch account update complete');
    }

    addAccount(account) {
        logger.info(`Adding account to wallet ${account.publicKey}`);

        const extendedAccount = {
            tokens: {},
            transactions: [],
            balance: 0,
            ...account
        };

        this._accounts[account.publicKey] = extendedAccount;
        this._saveStorage();
    }

    setupWallet(password = false) {
        if (this._walletStatus !== WALLET_STATUS.UNINITIALIZED)
            throw 'Wallet cannot be initialized multiple times';

        if (!password)
            throw 'Wallet cannot be initialized without a password';

        logger.info('Initialising wallet for first use');

        const account = AccountHandler.generateAccount();
        const wordList = account.export();
        const defaultAccount = account.getAccountAtIndex(0);

        defaultAccount.name = 'Default Account';

        this._rootAccount = new AccountHandler(wordList);
        this._mnemonic = wordList;
        this._password = password;
        this._internalAccounts = 1;

        this.addAccount(defaultAccount);
        this.unlockWallet(password);

        return defaultAccount;
    }

    isSetup() {
        return this._walletStatus !== WALLET_STATUS.UNINITIALIZED;
    }

    unlockWallet(password) {
        logger.info('Requested wallet unlock');

        try {
            const {
                accounts,
                mnemonic,
                currentAccount,
                internalAccounts
            } = JSON.parse(Utils.decrypt(this._encryptedStorage, password));

            this._rootAccount = new AccountHandler(mnemonic);
            this._accounts = accounts;
            this._mnemonic = mnemonic;
            this._currentAccount = currentAccount;
            this._password = password;
            this._internalAccounts = internalAccounts;

            this._walletStatus = WALLET_STATUS.UNLOCKED;

            logger.info('Wallet unlocked successfully');
            return true;
        } catch (e) {
            logger.warn('Error unlocking wallet');
            logger.error(e);

            return false;
        }
    }

    getAccounts() {
        return this._accounts;
    }

    getAccount(address = this._currentAccount) {
        if (this._walletStatus !== WALLET_STATUS.UNLOCKED)
            return false;

        if (this._accounts[address])
            return this._accounts[address];

        const keys = Object.keys(this._accounts);

        this._currentAccount = keys[0];
        this._saveStorage();

        return this._accounts[this._currentAccount];
    }

    createAccount(name = false) {
        const account = this._rootAccount.getAccountAtIndex(
            this._internalAccounts + 1
        );

        if (name) {
            let accountName = name.toString().substring(0, 32).trim();

            if (Object.values(this._accounts).some(account => account.name === accountName))
                accountName = false;

            account.name = accountName;
        }

        this._internalAccounts += 1;
        this.addAccount(account);

        this._saveStorage();

        return account;
    }

    selectAccount(publicKey) {
        if (!this._accounts.hasOwnProperty(publicKey))
            return;

        this._currentAccount = publicKey;
        this._saveStorage();
    }

    deleteAccount(publicKey) {
        if (!this._accounts.hasOwnProperty(publicKey))
            return;

        if (Object.keys(this._accounts).length === 1)
            return;

        delete this._accounts[publicKey];

        if (this._currentAccount === publicKey)
            this.selectAccount(Object.keys(this._accounts)[0]); // this calls saveStorage()
        else this._saveStorage();
    }
}
