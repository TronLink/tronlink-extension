import Logger from '@tronlink/lib/logger';
import EventEmitter from 'eventemitter3';
import StorageService from '../StorageService';
import NodeService from '../NodeService';
import Account from './Account';
import axios from 'axios';
import extensionizer from 'extensionizer';
import Utils from '@tronlink/lib/utils';
import TronWeb from 'tronweb';

import {
    APP_STATE,
    ACCOUNT_TYPE,
    CONTRACT_ADDRESS
} from '@tronlink/lib/constants';

const logger = new Logger('WalletService');
let basicPrice;
let smartPrice;
let usdtPrice;
class Wallet extends EventEmitter {
    constructor() {
        super();

        this.state = APP_STATE.UNINITIALISED;
        this.selectedAccount = false;
        this.isConfirming = false;
        this.popup = false;
        this.accounts = {};
        this.contractWhitelist = {}; // sign white list for trigger smart contract
        this.appWhitelist = {};      // sign white list for string limit some website
        this.phishingList = [];      // dapp phishing list (if it doesn't exit on the list the website will jump a phishing page for risk warning)
        this.confirmations = [];
        this.timer = {};
        // This should be moved into its own component
        this.shouldPoll = false;
        this._checkStorage(); //change store by judge
        // this.bankContractAddress = 'TMdSctThYMVEuGgPU8tumKc1TuyinkeEFK'; //test
        this.bankContractAddress = 'TPgbgZReSnPnJeXPakHcionXzsGk6kVqZB'; //online
        this.ledgerImportAddress = [];
        setInterval(() => {
            this._updatePrice();
            this.setCache();
        }, 30 * 60 * 1000);

    }

    async _checkStorage() {
        if(await StorageService.dataExists() || StorageService.needsMigrating)
            this._setState(APP_STATE.PASSWORD_SET); // initstatus APP_STATE.PASSWORD_SET
    }

    migrate(password) {
        if(!StorageService.needsMigrating) {
            logger.info('No migration required');
            return false;
        }

        StorageService.authenticate(password);

        const {
            error = false,
            accounts,
            selectedAccount
        } = StorageService.migrate();

        if(error)
            return false;

        localStorage.setItem('TronLink_WALLET.bak', localStorage.getItem('TronLink_WALLET'));
        localStorage.removeItem('TronLink_WALLET');

        accounts.forEach(account => (
            this.importAccount(account)
        ));

        this.selectAccount(selectedAccount);

        // Force "Reboot" TronLink
        this.state = APP_STATE.PASSWORD_SET;
        StorageService.ready = false;

        this.unlockWallet(StorageService.password);

        return true;
    }

    _setState(appState) {
        if(this.state === appState)
            return;

        logger.info(`Setting app state to ${ appState }`);

        this.state = appState;
        this.emit('newState', appState);
        // if(appState === APP_STATE.DAPP_LIST) {
        //     ga('send', 'event', {
        //         eventCategory: 'Dapp List',
        //         eventAction: 'Recommend',
        //         eventLabel: 'Recommend',
        //         eventValue: TronWeb.address.fromHex(this.selectedAccount),
        //         userId: Utils.hash(TronWeb.address.toHex(this.selectedAccount))
        //     });
        // }

        return appState;
    }

    _loadAccounts() {
        const accounts = StorageService.getAccounts();
        const selected = StorageService.selectedAccount;
        Object.entries(accounts).forEach(([ address, account ]) => {
            const accountObj = new Account(
                account.type,
                account.mnemonic || account.privateKey || account.address,
                account.accountIndex
            );

            accountObj.loadCache();
            accountObj.update([], [], 0);

            this.accounts[ address ] = accountObj;
        });

        this.selectedAccount = selected;
    }

    async _pollAccounts() {
        clearTimeout(this.timer);
        if(!this.shouldPoll) {
            logger.info('Stopped polling');
            return;
        }

        const accounts = Object.values(this.accounts);
        if(accounts.length > 0) {
            const { data: { data: basicTokenPriceList } } = await axios.get('https://bancor.trx.market/api/exchanges/list?sort=-balance').catch(e => {
                logger.error('get trc10 token price fail');
                return { data: { data: [] } };
            });
            const { data: { data: { rows: smartTokenPriceList } } } = await axios.get('https://api.trx.market/api/exchange/marketPair/list').catch(e => {
                logger.error('get trc20 token price fail');
                return { data: { data: { rows: [] } } };
            });
            const prices = StorageService.prices;
            basicPrice = basicTokenPriceList;
            smartPrice = smartTokenPriceList;
            usdtPrice = prices.usdtPriceList ? prices.usdtPriceList[ prices.selected ] : 0;
            for (const account of accounts) {
                if (account.address === this.selectedAccount) {
                    Promise.all([account.update(basicPrice, smartPrice, usdtPrice)]).then(() => {
                        if (account.address === this.selectedAccount) {
                            this.emit('setAccount', this.selectedAccount);
                        }
                    }).catch(e => {
                        logger.error(`update account ${account.address} fail`, e);
                    });
                } else {
                    await account.update(basicPrice, smartPrice, usdtPrice);
                }
            }
            this.emit('setAccounts', this.getAccounts());
        }
        this.timer = setTimeout(() => {
            this._pollAccounts(); // ??TODO repeatedly request
        }, 10000);
    }

    async _updatePrice() {
        if(!StorageService.ready)
            return;

        const prices = axios('https://min-api.cryptocompare.com/data/price?fsym=TRX&tsyms=USD,CNY,GBP,EUR,BTC,ETH');
        const usdtPrices = axios('https://min-api.cryptocompare.com/data/price?fsym=USDT&tsyms=USD,CNY,GBP,EUR,BTC,ETH');
        Promise.all([prices, usdtPrices]).then(res => {
            StorageService.setPrices(res[0].data, res[1].data);
            this.emit('setPriceList', [res[0].data, res[1].data]);
        }).catch(e => {
            logger.error('Failed to update prices',e);
        });

    }

    selectCurrency(currency) {
        StorageService.selectCurrency(currency);
        this.emit('setCurrency', currency);
    }

    async _updateWindow() {
        return new Promise(resolve => {
            if(typeof chrome !== 'undefined') {
                return extensionizer.windows.update(this.popup.id, { focused: true }, window => {
                    resolve(!!window);
                });
            }

            extensionizer.windows.update(this.popup.id, {
                focused: true
            }).then(resolve).catch(() => resolve(false));
        });
    }

    async _openPopup() {
        if(this.popup && this.popup.closed)
            this.popup = false;

        if(this.popup && await this._updateWindow())
            return;

        if(typeof chrome !== 'undefined') {
            return extensionizer.windows.create({
                url: 'packages/popup/build/index.html',
                type: 'popup',
                width: 360,
                height: 600,
                left: 25,
                top: 25
            }, window => this.popup = window);
        }

        this.popup = await extensionizer.windows.create({
            url: 'packages/popup/build/index.html',
            type: 'popup',
            width: 360,
            height: 600,
            left: 25,
            top: 25
        });
    }

    _closePopup() {
        if(this.confirmations.length)
            return;

        if(!this.popup)
            return;

        extensionizer.windows.remove(this.popup.id);
        this.popup = false;
    }

    startPolling() {

        logger.info('Started polling');

        this.shouldPoll = true;
        this._pollAccounts();
    }

    stopPolling() {
        this.shouldPoll = false;
    }

    async refresh() {
        this.setCache();
        let res;
        const accounts = Object.values(this.accounts);
        for(const account of accounts) {
            if(account.address === this.selectedAccount) {
                const r = await account.update(basicPrice, smartPrice, usdtPrice).catch(e => false);
                if(r) {
                    res = true;
                    this.emit('setAccount', this.selectedAccount);
                } else {
                    res = false;
                }
            }else{
                continue;
                //await account.update(basicPrice,smartPrice);
            }
        }
        this.emit('setAccounts', this.getAccounts());
        return res;
    }

    changeState(appState) {
        const stateAry = [
            APP_STATE.PASSWORD_SET,
            APP_STATE.RESTORING,
            APP_STATE.CREATING,
            APP_STATE.RECEIVE,
            APP_STATE.SEND,
            APP_STATE.TRANSACTIONS,
            APP_STATE.SETTING,
            APP_STATE.ADD_TRC20_TOKEN,
            APP_STATE.READY,
            APP_STATE.TRONBANK,
            APP_STATE.TRONBANK_RECORD,
            APP_STATE.TRONBANK_DETAIL,
            APP_STATE.TRONBANK_HELP,
            APP_STATE.USDT_INCOME_RECORD,
            APP_STATE.USDT_ACTIVITY_DETAIL,
            APP_STATE.DAPP_LIST,
            APP_STATE.ASSET_MANAGE,
            APP_STATE.TRANSACTION_DETAIL,
            APP_STATE.DAPP_WHITELIST,
            APP_STATE.LEDGER,
            APP_STATE.LEDGER_IMPORT_ACCOUNT
        ];
        if(!stateAry.includes(appState))
            return logger.error(`Attempted to change app state to ${ appState }. Only 'restoring' and 'creating' is permitted`);

        this._setState(appState);
    }

    async resetState() {
        logger.info('Resetting app state');

        if(!await StorageService.dataExists())
            return this._setState(APP_STATE.UNINITIALISED);

        if(!StorageService.hasAccounts && !StorageService.ready)
            return this._setState(APP_STATE.PASSWORD_SET);

        if(!StorageService.hasAccounts && StorageService.ready)
            return this._setState(APP_STATE.UNLOCKED);

        if(StorageService.needsMigrating)
            return this._setState(APP_STATE.MIGRATING);

        if(this.state === APP_STATE.REQUESTING_CONFIRMATION && this.confirmations.length)
            return;

        this._setState(APP_STATE.READY);
    }

    // We shouldn't handle requests directly in WalletService.
    setPassword(password) {
        if(this.state !== APP_STATE.UNINITIALISED)
            return Promise.reject('ERRORS.ALREADY_INITIALISED');

        StorageService.authenticate(password);
        StorageService.save();
        NodeService.save();

        this._updatePrice();

        logger.info('User has set a password');
        this._setState(APP_STATE.UNLOCKED);

        const node = NodeService.getCurrentNode();

        this.emit('setNode', {
            fullNode: node.fullNode,
            solidityNode: node.solidityNode,
            eventServer: node.eventServer
        });
    }

    async unlockWallet(password) {
        if(this.state !== APP_STATE.PASSWORD_SET) {
            logger.error('Attempted to unlock wallet whilst not in PASSWORD_SET state');
            return Promise.reject('ERRORS.NOT_LOCKED');
        }

        if(StorageService.needsMigrating) {
            const success = this.migrate(password);

            if(!success)
                return Promise.reject('ERRORS.INVALID_PASSWORD');

            return;
        }

        const unlockFailed = await StorageService.unlock(password);
        if(unlockFailed) {
            logger.error(`Failed to unlock wallet: ${ unlockFailed }`);
            return Promise.reject(unlockFailed);
        }

        if(!StorageService.hasAccounts) {
            logger.info('Wallet does not have any accounts');
            return this._setState(APP_STATE.UNLOCKED);
        }

        NodeService.init();

        this._loadAccounts();
        this._updatePrice();

        // Bandage fix to change old ANTE to new ANTE
        Object.keys(this.accounts).forEach(address => {
            const account = this.accounts[ address ];
            const tokens = account.tokens;

            const oldAddress = 'TBHN6guS6ztVVXbFivajdG3PxFUZ5UXGxY';
            const newAddress = 'TCN77KWWyUyi2A4Cu7vrh5dnmRyvUuME1E';

            if(!tokens.hasOwnProperty(oldAddress))
                return;

            tokens[ newAddress ] = tokens[ oldAddress ];
            delete tokens[ oldAddress ];
        });
        const node = NodeService.getCurrentNode();
        this.emit('setNode', {
            fullNode: node.fullNode,
            solidityNode: node.solidityNode,
            eventServer: node.eventServer
        });
        this.emit('setAccount', this.selectedAccount);
        const setting = this.getSetting();
        setting.lock.lockTime = new Date().getTime();
        this.setSetting(setting);
        if (this.confirmations.length === 0) {
            this.setCache();
            this._setState(APP_STATE.READY);
        } else {
            this._setState(APP_STATE.REQUESTING_CONFIRMATION);
        }
    }

    async lockWallet() {
        StorageService.lock();
        this.accounts = {};
        this.selectedAccount = false;
        this.appWhitelist = {};
        this.emit('setAccount', this.selectedAccount);
        this._setState(APP_STATE.PASSWORD_SET);
    }

    queueConfirmation(confirmation, uuid, callback) {
        this.confirmations.push({
            confirmation,
            callback,
            uuid
        });

        // if(this.state === APP_STATE.PASSWORD_SET) {
        //     this.emit('setConfirmations', this.confirmations);
        //     this._openPopup();
        //     return;
        // }

        if(this.state !== APP_STATE.REQUESTING_CONFIRMATION)
            this._setState(APP_STATE.REQUESTING_CONFIRMATION);

        logger.info('Added confirmation to queue', confirmation);

        this.emit('setConfirmations', this.confirmations);
        this._openPopup();
    }

    whitelistContract(confirmation, duration) {
        const {
            input: {
                contract_address: address
            },
            contractType,
            hostname
        } = confirmation;
        //if(!address)
        //    return Promise.reject('INVALID_CONFIRMATION');

        if(contractType !== 'TriggerSmartContract'){
            //return Promise.reject('INVALID_CONFIRMATION');
            //this.contractWhitelist[ hostname ] = {};
            if(!this.appWhitelist[ hostname ])
                this.appWhitelist[ hostname ] = {};

            this.appWhitelist[ hostname ].duration = duration === -1 ? -1 : Date.now() + duration;
            logger.info(`Added auto sign on host ${ hostname } with duration ${ duration } to whitelist`);

            ga('send', 'event', {
                eventCategory: 'Transaction',
                eventAction: 'Whitelisted Transaction',
                eventLabel: confirmation.contractType || 'SignMessage',
                eventValue: duration,
                referrer: hostname,
                userId: Utils.hash(TronWeb.address.toHex(this.selectedAccount))
            });

        } else {
            if(!this.contractWhitelist[ address ])
                this.contractWhitelist[ address ] = {};

            this.contractWhitelist[ address ][ hostname ] = (
                duration === -1 ?
                    -1 :
                    Date.now() + duration
            );

            logger.info(`Added contact ${ address } on host ${ hostname } with duration ${ duration } to whitelist`);

            ga('send', 'event', {
                eventCategory: 'Smart Contract',
                eventAction: 'Whitelisted Smart Contract',
                eventLabel: TronWeb.address.fromHex(confirmation.input.contract_address),
                eventValue: duration,
                referrer: confirmation.hostname,
                userId: Utils.hash(confirmation.input.owner_address)
            });
        }




        this.acceptConfirmation();
    }

    acceptConfirmation(whitelistDuration) {
        if(!this.confirmations.length)
            return Promise.reject('NO_CONFIRMATIONS');

        if(this.isConfirming)
            return Promise.reject('ALREADY_CONFIRMING');

        this.isConfirming = true;

        const {
            confirmation,
            callback,
            uuid
        } = this.confirmations.pop();

        if(whitelistDuration !== false)
            this.whitelistContract(confirmation, whitelistDuration);

        ga('send', 'event', {
            eventCategory: 'Transaction',
            eventAction: 'Confirmed Transaction',
            eventLabel: confirmation.contractType || 'SignMessage',
            eventValue: confirmation.input.amount || 0,
            referrer: confirmation.hostname,
            userId: Utils.hash(TronWeb.address.toHex(this.selectedAccount))
        });

        callback({
            success: true,
            data: confirmation.signedTransaction,
            uuid
        });

        this.isConfirming = false;
        if(this.confirmations.length) {
            this.emit('setConfirmations', this.confirmations);
        }
        this._closePopup();
        this.resetState();
    }

    rejectConfirmation() {
        if(this.isConfirming)
            return Promise.reject('ALREADY_CONFIRMING');

        this.isConfirming = true;

        const {
            confirmation,
            callback,
            uuid
        } = this.confirmations.pop();

        ga('send', 'event', {
            eventCategory: 'Transaction',
            eventAction: 'Rejected Transaction',
            eventLabel: confirmation.contractType || 'SignMessage',
            eventValue: confirmation.input.amount || 0,
            referrer: confirmation.hostname,
            userId: Utils.hash(
                TronWeb.address.toHex(this.selectedAccount)
            )
        });

        callback({
            success: false,
            data: 'Confirmation declined by user',
            uuid
        });

        this.isConfirming = false;
        if(this.confirmations.length) {
            this.emit('setConfirmations', this.confirmations);
        }
        this._closePopup();
        this.resetState();
    }

    /**
     *
     * @param mnemonic
     * @param name
     * @returns {Promise.<boolean>} create an account with mnemonic after confirming by generated mnemonic
     */

    async addAccount({ mnemonic, name }) {
        logger.info(`Adding account '${ name }' from popup`);
        if(Object.keys(this.accounts).length === 0) {
            this.setCache();
        }

        const account = new Account(
            ACCOUNT_TYPE.MNEMONIC,
            mnemonic
        );

        const {
            address
        } = account;

        account.name = name;

        this.accounts[ address ] = account;
        StorageService.saveAccount(account);

        this.emit('setAccounts', this.getAccounts());
        this.selectAccount(address);
        return true;
    }


    // This and the above func should be merged into one
    /**
     *
     * @param privateKey
     * @param name
     * @returns {Promise.<boolean>}
     */

    async importAccount({ privateKey, name }) {
        logger.info(`Importing account '${ name }' from popup`);

        const account = new Account(
            privateKey.match(/^T/) && TronWeb.isAddress(privateKey) ? ACCOUNT_TYPE.LEDGER : ACCOUNT_TYPE.PRIVATE_KEY,
            privateKey
        );

        const {
            address
        } = account;

        account.name = name;
        if(Object.keys(this.accounts).length === 0) {
            this.setCache();
        }
        this.accounts[ address ] = account;
        StorageService.saveAccount(account);

        this.emit('setAccounts', this.getAccounts());
        this.selectAccount(address);
        return true;
    }

    async setCache(){
        const dapps   = axios.get('https://dappradar.com/api/xchain/dapps/theRest');
        const dapps2  = axios.get('https://dappradar.com/api/xchain/dapps/list/0');
        Promise.all([dapps, dapps2]).then(res => {
            const tronDapps =  res[ 0 ].data.data.list.concat(res[ 1 ].data.data.list).filter(({ protocols: [ type ] }) => type === 'tron').map(({ logo: icon, url: href, title: name }) => ({ icon, href, name }));
            StorageService.saveAllDapps(tronDapps);
        });
        const trc10tokens = axios.get('https://apilist.tronscan.org/api/token?showAll=1&limit=4000&fields=tokenID,name,precision,abbr,imgUrl');
        const trc20tokens = axios.get('https://apilist.tronscan.org/api/tokens/overview?start=0&limit=1000&filter=trc20');
        Promise.all([trc10tokens, trc20tokens]).then(res => {
            let t = [];
            res[ 0 ].data.data.concat( res[ 1 ].data.tokens).forEach(({ abbr, name, imgUrl = false, tokenID = false, contractAddress = false, decimal = false, precision = false }) => {
                if(contractAddress && contractAddress === CONTRACT_ADDRESS.USDT)return;
                t.push({ tokenId: tokenID ? tokenID.toString() : contractAddress, abbr, name, imgUrl, decimals: precision || decimal || 0 });
            });
            StorageService.saveAllTokens(t);
        });
        const {data:{data:phishingList}} = await axios.get('https://testlist.tronlink.org/api/activity/website/blacklist').catch(e=>({data:{data:[]}}));
        this.phishingList = phishingList.map(v=>({url:v,isVisit:false}));
    }

    selectAccount(address) {
        StorageService.selectAccount(address);
        NodeService.setAddress();
        this.selectedAccount = address;
        this.emit('setAccount', address);
    }

    async selectNode(nodeID) {
        NodeService.selectNode(nodeID);

        Object.values(this.accounts).forEach(account => (
            account.reset()
        ));

        const node = NodeService.getCurrentNode();

        this.emit('setNode', {
            fullNode: node.fullNode,
            solidityNode: node.solidityNode,
            eventServer: node.eventServer
        });
        this.emit('setAccounts', this.getAccounts());
        this.emit('setAccount', this.selectedAccount);
    }

    addNode(node) {
        this.selectNode(
            NodeService.addNode(node)
        );
    }

    getAccounts() {
        const accounts = Object.entries(this.accounts).reduce((accounts, [ address, account ]) => {
            accounts[ address ] = {
                name: account.name,
                balance: account.balance + account.frozenBalance,
                energyUsed: account.energyUsed,
                totalEnergyWeight: account.totalEnergyWeight,
                TotalEnergyLimit: account.TotalEnergyLimit,
                energy: account.energy,
                netUsed: account.netUsed,
                netLimit: account.netLimit,
                tokenCount: Object.keys(account.tokens.basic).length + Object.keys(account.tokens.smart).length,
                asset: account.asset,
                type: account.type
            };

            return accounts;
        }, {});

        return accounts;
    }

    setSelectedToken(token) {
        StorageService.setSelectedToken(token);
        this.emit('setSelectedToken', token);
    }

    getSelectedToken() {
        return JSON.stringify(StorageService.selectedToken) === '{}' ? { id: '_', name: 'TRX', amount: 0, decimals: 6 } : StorageService.selectedToken;
    }

    setLanguage(language) {
        StorageService.setLanguage(language);
        this.emit('setLanguage', language);
    }

    setSetting(setting) {
        StorageService.setSetting(setting);
        this.emit('setSetting', setting);
    }

    getLanguage() {
        return StorageService.language;
    }

    getSetting() {
        return StorageService.getSetting();
    }

    getAccountDetails(address) {
        if(!address) {
            return {
                tokens: {
                    basic: {},
                    smart: {}
                },
                type: false,
                name: false,
                address: false,
                balance: 0,
                transactions: {
                    cached: [],
                    uncached: 0
                }
            };
        }

        return this.accounts[ address ].getDetails();
    }

    getSelectedAccount() {
        if(!this.selectedAccount)
            return false;

        return this.getAccountDetails(this.selectedAccount);
    }

    getAccount(address) {
        return this.accounts[ address ];
    }

    deleteAccount() {
        delete this.accounts[ this.selectedAccount ];
        StorageService.deleteAccount(this.selectedAccount);

        this.emit('setAccounts', this.getAccounts());

        if(!Object.keys(this.accounts).length) {
            this.selectAccount(false);
            return this._setState(APP_STATE.UNLOCKED);
        }

        this.selectAccount(Object.keys(this.accounts)[ 0 ]);
    }

    async addSmartToken(token) {
        const {
            selectedAccount: address
        } = this;

        await this.accounts[ address ].addSmartToken(token);
        this.emit('setAccount', address);
    }

    getPrices() {
        return StorageService.prices;
    }

    getConfirmations() {
        return this.confirmations;
    }

    async sendTrx({ recipient, amount }) {
        await this.accounts[ this.selectedAccount ].sendTrx(
            recipient,
            amount
        );
        this.refresh();
    }

    async sendBasicToken({ recipient, amount, token }) {
        await this.accounts[ this.selectedAccount ].sendBasicToken(
            recipient,
            amount,
            token
        );
        this.refresh();
    }

    async sendSmartToken({ recipient, amount, token }) {
        await this.accounts[ this.selectedAccount ].sendSmartToken(
            recipient,
            amount,
            token
        );
        this.refresh();
    }

    async rentEnergy({ _freezeAmount, _payAmount, _days, _energyAddress }) {
        const {
            privateKey
        } = this.accounts[ this.selectedAccount ];
        try {
            const bankContractAddress = this.bankContractAddress;
            const contractInstance = await NodeService.tronWeb.contract().at(bankContractAddress);
            const result = await contractInstance.entrustOrder(_freezeAmount, _days, _energyAddress).send(
                {
                    callValue: _payAmount,
                    shouldPollResponse: false
                },
                privateKey
            );
            return result;
        } catch(ex) {
            logger.error('Failed to rent energy:', ex);
            return Promise.reject(ex);
        }
    }

    async bankOrderNotice({ energyAddress, trxHash, requestUrl }) {
        const { data: isValid } = await axios.post(requestUrl, { receiver_address: energyAddress, trxHash } )
            .then(res => res.data)
            .catch(err => { logger.error(err); });
        if(!isValid)
            return logger.warn('Failed to get bank order data');
        return isValid;
    }

    async getBankDefaultData({ requestUrl }) {
        const { data: defaultData } = await axios(requestUrl)
            .then(res => res.data)
            .catch(err => { logger.error(err); });
        if(!defaultData)
            return logger.warn('Failed to get default data');
        return defaultData;
    }

    async isValidOverTotal ({ receiverAddress, freezeAmount, requestUrl }) {
        const { data: isValid } = await axios.get(requestUrl, { params: { receiver_address: receiverAddress, freezeAmount } })
            .then(res => res.data)
            .catch(err => { logger.error(err); });
        let isValidVal = 0;
        if(isValid) isValidVal = 0;else isValidVal = 1;
        return isValidVal;
    }

    async calculateRentCost ({ receiverAddress, freezeAmount, days, requestUrl }) {
        const { data: calculateData } = await axios.get(requestUrl, { params: { receiver_address: receiverAddress, freezeAmount, days } })
            .then(res => res.data)
            .catch(err => { logger.error(err); });
        if(!calculateData)
            return logger.warn('Failed to get payMount data');
        return calculateData;
    }

    async isValidOrderAddress({ address, requestUrl }) {
        const { data: isRentData } = await axios.get(requestUrl, { params: { receiver_address: address } })
            .then(res => res.data)
            .catch(err => { logger.error(err); });
        if(!isRentData)
            return logger.warn('Failed to get valid order address data');
        return isRentData;
    }

    async isValidOnlineAddress({ address }) {
        // const account = await NodeService.tronWeb.trx.getUnconfirmedAccount(address);
        const account = await NodeService.tronWeb.trx.getAccountResources(address);
        if(!account.TotalEnergyLimit)
            return logger.warn('Failed to get online address data');
        return account;
    }

    async getBankRecordList({ address, limit, start, type, requestUrl }) {
        const { data: { data: recordData } } = await axios.get(requestUrl, { params: { receiver_address: address, limit, start, type } })
        if(!recordData)
            return logger.warn('Failed to get bank record data');
        return recordData;
    }

    //setting bank record id
    setSelectedBankRecordId(id) {
        this.accounts[ this.selectedAccount ].selectedBankRecordId = id;
        this.emit('setAccount', this.selectedAccount);
    }

    async getBankRecordDetail({ id, requestUrl }) {
        const { data: bankRecordDetail } = await axios.get(requestUrl, { params: { id } })
            .then(res => res.data)
            .catch(err => { logger.error(err); });
        if(!bankRecordDetail)
            return logger.warn('Failed to get bank record detail data');
        return bankRecordDetail;
    }

    changeDealCurrencyPage(status) { // change deal currency page status
        console.log(`STATUS改成了${status}`);
        this.accounts[ this.selectedAccount ].dealCurrencyPage = status;
        this.emit('setAccount', this.selectedAccount);
    }

    exportAccount() {
        const {
            mnemonic,
            privateKey
        } = this.accounts[ this.selectedAccount ];

        return {
            mnemonic: mnemonic || false,
            privateKey
        };
    }

    async getTransactionsByTokenId({ tokenId, start = 0, direction = "all" }) {
        const address = this.selectedAccount;
        const limit = 30;
        let params = { limit, start: limit * start };
        let requestUrl;
        let newRecord = [];
        if(!tokenId.match(/^T/)) {
            if(tokenId === '_') {
                requestUrl = 'https://apilist.tronscan.org/api/simple-transaction';
                //params.asset_name = 'TRX';
            } else {
                requestUrl = 'https://apilist.tronscan.org/api/simple-transfer';
                params.token_id = tokenId;
            }
            if(direction === 'all') {
                params = {...params, address};
            } else if(direction === 'to') {
                params = { ...params, from: address };
            } else {
                params = { ...params, to: address };
            }
            const { data: { data: records, total } } = await axios.get(requestUrl, { params }).catch(err => ({ data: { data: [], total: 0 }}));
            if(tokenId !== '_') {
                newRecord = records;
            }else {
                if(records.length > 0) {
                    records.forEach((val, index) => {
                        if((val.contractData.call_value || val.contractData.amount) && val.contractType !== 2) {
                            newRecord.push(val);
                        }
                    });
                }else {
                    newRecord = [];
                }
            }
            return { records: newRecord, total };
        } else {
            params.address = address;
            params.contract = tokenId;
            const { data: { data: transactions, total } } = await axios.get('https://apilist.tronscan.org/api/contract/events', {
                params
            }).catch(err => {
                return { data: { data: [], total: 0 } };
            });
            if(direction === 'all') {
                return { records: transactions, total };
            }else if(direction === 'to') {
                return { records: transactions.filter(({ transferFromAddress }) => transferFromAddress === address), total };
            }else {
                return { records: transactions.filter(({ transferToAddress })=> transferToAddress === address), total };
            }
        }
    }

    async getNews() {
        const developmentMode = StorageService.setting.developmentMode;
        //const apiUrl = developmentMode? 'http://52.14.133.221:8920':'https://list.tronlink.org';
        const apiUrl = developmentMode ? 'https://list.tronlink.org' : 'https://list.tronlink.org';
        const res = await axios.get(apiUrl+'/api/activity/announcement/reveal_v2').catch(e=>false);
        if(res) {
            return res.data.data;
        } else {
            return [];
        }
    }

    async getIeos() {
        const developmentMode = StorageService.setting.developmentMode;
        //const apiUrl = developmentMode? 'http://172.16.22.43:8090':'https://list.tronlink.org';
        const apiUrl = developmentMode ? 'https://list.tronlink.org' : 'https://list.tronlink.org';
        const res = await axios.get(apiUrl+'/api/wallet/ieo').catch(e=>false);
        if(res) {
            return res.data.data;
        } else {
            return [];
        }
    }

    async addCount(id) {
        const developmentMode = StorageService.setting.developmentMode;
        //const apiUrl = developmentMode? 'http://52.14.133.221:8920':'https://list.tronlink.org';
        const apiUrl = developmentMode ? 'https://list.tronlink.org' : 'https://list.tronlink.org';
        const res = await axios.post(apiUrl+'/api/activity/announcement/pv',{id}).catch(e=>false);
        if(res && res.data.code === 0) {
            return true;
        } else {
            return false;
        }
    }

    async setAirdropInfo(address) {
        const developmentMode = StorageService.setting.developmentMode;
        //const apiUrl = developmentMode? 'http://52.14.133.221:8951':'https://list.tronlink.org';
        const apiUrl = 'https://list.tronlink.org';
        const hexAddress = TronWeb.address.toHex(address);
        const res = await axios.get(apiUrl + '/api/wallet/airdrop_transaction',{ params: { address: hexAddress } }).catch(e=>false);
        if(res && res.data.code === 0) {
            this.accounts[ this.selectedAccount ].airdropInfo = res.data.data;
            this.emit('setAirdropInfo', res.data.data);
        }
    }

    async getDappList(isFromStorage = false) {
        return await StorageService.getDappList(isFromStorage);
    }

    async setDappList(dappList) {
        await StorageService.saveDappList(dappList);
        this.emit('setDappList', dappList);
    }

    async getAccountInfo(address) {
        return await NodeService.tronWeb.trx.getUnconfirmedAccount(address);
    }

    setGaEvent({ eventCategory, eventAction, eventLabel, referrer }) {
        ga('send', 'event', {
            eventCategory,
            eventAction,
            eventLabel,
            referrer,
            userId: Utils.hash(TronWeb.address.toHex(this.selectedAccount))
        });
    }

    getAllDapps() {
        return StorageService.hasOwnProperty('allDapps') ? StorageService.allDapps : [];
    }

    updateTokens(tokens) {
        this.accounts[ this.selectedAccount ].tokens = tokens;
        this.emit('setAccount', this.selectedAccount);
    }

    getAllTokens() {
        return StorageService.hasOwnProperty('allTokens') ? StorageService.allTokens : [];
    }

    async setTransactionDetail(hash) {
        const res = await axios.get('https://apilist.tronscan.org/api/transaction-info', { params: { hash } }).catch(e=>false);
        if(res) {
            let { confirmed, ownerAddress, toAddress, hash, block,timestamp = 0 ,cost, tokenTransferInfo = false, trigger_info, contractType, contractData } = res.data;
            if( contractType === 31 && tokenTransferInfo ) {
                ownerAddress = tokenTransferInfo.from_address;
                toAddress = tokenTransferInfo.to_address;
            }
            this.accounts[ this.selectedAccount ].transactionDetail = { confirmed, timestamp, ownerAddress, toAddress, hash, block, cost, tokenTransferInfo, trigger_info, contractType, contractData };
            this.emit('setAccount', this.selectedAccount);
        }
        return res;
    }

    getAuthorizeDapps(){
        return StorageService.hasOwnProperty('authorizeDapps') ? StorageService.authorizeDapps : {};
    }

    setAuthorizeDapps(authorizeDapps) {
        StorageService.setAuthorizeDapps(authorizeDapps);
        this.emit('setAuthorizeDapps',authorizeDapps);
    }

    setLedgerImportAddress(address){
        this.ledgerImportAddress = address;
        this.emit('setLedgerImportAddress',address);
    }

    getLedgerImportAddress(){
        return this.hasOwnProperty('ledgerImportAddress')?this.ledgerImportAddress:[];
    }

    async getAbiCode(contract_address){
        const contract = await NodeService.tronWeb.contract().at(contract_address);
        return contract.abi;
    }

}
export default Wallet;
