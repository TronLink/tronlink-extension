import extensionizer from 'extensionizer';
import Logger from '@tronlink/lib/logger';
import Utils from '@tronlink/lib/utils';
import NodeService from '../NodeService';
import axios from 'axios';
const logger = new Logger('StorageService');

const StorageService = {
    // We could instead scope the data so we don't need this array
    storageKeys: [
        'accounts',
        'nodes',
        'transactions',
        'selectedAccount',
        'prices',
        'pendingTransactions',
        'tokenCache',
        'setting',
        'language',
        'dappList',
        'allDapps',
        'allTokens',
        'authorizeDapps',
        'vTokenList',
        'chains',
    ],

    storage: extensionizer.storage.local,

    prices: {
        priceList: {
            CNY: 0,
            USD: 0,
            GBP: 0,
            EUR: 0,
            BTC: 0,
            ETH: 0
        },
        usdtPriceList: {
            CNY: 0,
            USD: 0,
            GBP: 0,
            EUR: 0,
            BTC: 0,
            ETH: 0
        },
        selected: 'USD'
    },
    nodes: {
        nodeList: {},
        selectedNode: false
    },
    chains: {
        chainList:{},
        selectedChain: false
    },
    pendingTransactions: {},
    accounts: {},
    transactions: {},
    tokenCache: {},
    selectedAccount: false,
    selectedToken: {},
    setting: {
        lock: {
            lockTime: 0,
            duration: 0
        },
        openAccountsMenu:false,
        advertising: {},
        developmentMode: location.hostname !== 'ibnejdfjmmkpcnlpebklmnkoeoihofec',
        showUpdateDescription:false
    },
    language: '',
    ready: false,
    password: false,
    dappList: {
        recommend: [],
        used: []
    },
    allDapps: [],
    allTokens : {
        mainchain: [],
        sidechain: []
    },
    allSideTokens : [],
    authorizeDapps: {},
    vTokenList: [],
    get needsMigrating() {
        return localStorage.hasOwnProperty('TronLink_WALLET');
    },

    get hasAccounts() {
        return Object.keys(this.accounts).length;
    },

    getStorage(key) {
        return new Promise(resolve => (
            this.storage.get(key, data => {
                if(key in data)
                    return resolve(data[ key ]);

                resolve(false);
            })
        ));
    },

    async dataExists() {
        return !!(await this.getStorage('accounts'));
    },

    lock() {
        this.ready = false;
    },

    async unlock(password) {
        if(this.ready) {
            logger.error('Attempted to decrypt data whilst already unencrypted');
            return 'ERRORS.ALREADY_UNLOCKED';
        }

        if(!await this.dataExists())
            return 'ERRORS.NOT_SETUP';

        try {
            for(let i = 0; i < this.storageKeys.length; i++) {
                const key = this.storageKeys[ i ];
                const encrypted = await this.getStorage(key);

                if(!encrypted)
                    continue;

                this[ key ] = Utils.decrypt(
                    encrypted,
                    password
                );
            }
        } catch(ex) {
            logger.warn('Failed to decrypt wallet (wrong password?):', ex);
            return 'ERRORS.INVALID_PASSWORD';
        }

        logger.info('Decrypted wallet data');

        this.password = password;
        this.ready = true;

        return false;
    },

    hasAccount(address) {
        // This is the most disgusting piece of code I've ever written.
        return (address in this.accounts);
    },

    selectAccount(address) {
        logger.info(`Storing selected account: ${ address }`);

        this.selectedAccount = address;
        this.save('selectedAccount');
    },

    getAccounts() {
        const accounts = {};

        Object.keys(this.accounts).forEach(address => {
            accounts[ address ] = {
                transactions: this.transactions[ address ] || [],
                ...this.accounts[ address ]
            };
        });

        return accounts;
    },

    getAccount(address) {
        const account = this.accounts[ address ];
        const transactions = this.transactions[ address ] || [];

        return {
            transactions,
            ...account
        };
    },

    deleteAccount(address) {
        logger.info('Deleting account', address);

        delete this.accounts[ address ];
        //delete this.transactions[ address ];
        //this.accounts = Object.entries(this.accounts).filter(([key,accounts])=>key !== address).reduce((accumulator, currentValue)=>{accumulator[currentValue[0]]=currentValue[1];return accumulator;},{});
        this.save('accounts');
    },

    deleteNode(nodeID) {
        logger.info('Deleting node', nodeID);

        delete this.nodes.nodeList[ nodeID ];
        this.save('nodes');
    },

    saveNode(nodeID, node) {
        logger.info('Saving node', node);

        this.nodes.nodeList[ nodeID ] = node;
        this.save('nodes');
    },

    saveChain(chainId ,chain) {
        logger.info('Saving chain', chain);

        this.chains.chainList[ chainId ] = chain;
        this.save('chains');
    },

    selectNode(nodeID) {
        logger.info('Saving selected node', nodeID);

        this.nodes.selectedNode = nodeID;
        this.save('nodes');
    },

    selectChain(chainID) {
        logger.info('Saving selected chain', chainID);

        this.chains.selectedChain = chainID;
        this.save('chains');
    },

    saveAccount(account) {
        logger.info('Saving account', account);

        const {
            transactions,
            ...remaining // eslint-disable-line
        } = account;

        this.transactions[ account.address ] = transactions;
        this.accounts[ account.address ] = remaining;

        this.save('transactions', 'accounts');
    },

    setSelectedToken(token) {
        logger.info('Saving selectedToken', token);
        this.selectedToken = token;
        this.save('selectedToken');
    },

    setLanguage(language){
        logger.info('Saving language', language);
        this.language = language;
        this.save('language');
    },

    setSetting(setting){
        logger.info('Saving setting', setting);
        this.setting = setting;
        this.save('setting');
    },

    getSetting(){
        if(!this.setting.hasOwnProperty('advertising')){
            this.setting.advertising = {};
        }
        if(!this.setting.hasOwnProperty('showUpdateDescription')){
            this.setting.showUpdateDescription = false;
        }
        return {...this.setting,developmentMode:location.hostname !== 'ibnejdfjmmkpcnlpebklmnkoeoihofec'};
    },

    migrate() {
        try {
            const storage = localStorage.getItem('TronLink_WALLET');
            const decrypted = Utils.decrypt(
                JSON.parse(storage),
                this.password
            );

            const {
                accounts,
                currentAccount
            } = decrypted;

            return {
                accounts: Object.values(accounts).map(({ privateKey, name }) => ({
                    privateKey,
                    name
                })),
                selectedAccount: currentAccount
            };
        } catch(ex) {
            logger.info('Failed to migrate (wrong password?):', ex);

            return {
                error: true
            };
        }
    },

    authenticate(password) {
        this.password = password;
        this.ready = true;

        logger.info('Set storage password');
    },

    addPendingTransaction(address, txID) {
        if(!(address in this.pendingTransactions))
            this.pendingTransactions[ address ] = [];

        if(this.pendingTransactions[ address ].some(tx => tx.txID === txID))
            return;

        logger.info('Adding pending transaction:', { address, txID });

        this.pendingTransactions[ address ].push({
            nextCheck: Date.now() + 5000,
            txID
        });

        this.save('pendingTransactions');
    },

    removePendingTransaction(address, txID) {
        if(!(address in this.pendingTransactions))
            return;

        logger.info('Removing pending transaction:', { address, txID });

        this.pendingTransactions[ address ] = this.pendingTransactions[ address ].filter(transaction => (
            transaction.txID !== txID
        ));

        if(!this.pendingTransactions[ address ].length)
            delete this.pendingTransactions[ address ];

        this.save('pendingTransactions');
    },

    getNextPendingTransaction(address) {
        if(!(address in this.pendingTransactions))
            return false;

        const [ transaction ] = this.pendingTransactions[ address ];

        if(!transaction)
            return false;

        if(transaction.nextCheck < Date.now())
            return false;

        return transaction.txID;
    },

    setPrices(priceList,usdtPriceList) {
        this.prices.priceList = priceList;
        this.prices.usdtPriceList = usdtPriceList;
        this.save('prices');
    },

    selectCurrency(currency) {
        this.prices.selected = currency;
        this.save('prices');
    },

    save(...keys) {
        if(!this.ready)
            return logger.error('Attempted to write storage when not ready');

        if(!keys.length)
            keys = this.storageKeys;

        logger.info(`Writing storage for keys ${ keys.join(', ') }`);

        keys.forEach(key => (
            this.storage.set({
                [ key ]: Utils.encrypt(this[ key ], this.password)
            })
        ));

        logger.info('Storage saved');
    },

    /**
     *
     * @param tokenID
     * @returns {Promise.<void>}
     * get token  name,abbr,precision and cache the token (only called this function in shast environment)
     */

    async cacheToken(tokenID) {


        const {
            name,
            abbr,
            precision: decimals = 0
        } = await NodeService.tronWeb.trx.getTokenFromID(tokenID);
        this.tokenCache[ tokenID ] = {
            name,
            abbr,
            decimals
        };


        logger.info(`Cached token ${ tokenID }:`, this.tokenCache[ tokenID ]);

        this.save('tokenCache');
    },

    async getDappList(isFromStorage) {
        if(!this.hasOwnProperty('dappList')) {
            this.dappList = { recommend: [], used: [] };
        }
        if(!isFromStorage) {
            const { data: { data: recommend } } = await axios.get('https://list.tronlink.org/dapphouseapp/plug').catch(e => {
                logger.error('Get dapp recommend list fail',e);
                return { data: { data: this.dappList.recommend } };
            });
            this.dappList.recommend = recommend;
        }
        const used = this.dappList.used.filter(v => v != null);
        this.dappList.used = used;
        return this.dappList;
    },

    saveDappList(dappList) {
        this.dappList = dappList;
        this.save('dappList');
    },

    saveAllDapps(dapps) {
        this.allDapps = dapps;
        this.save('allDapps');
    },

    saveAllTokens(tokens,tokens2) {
        this.allTokens.mainchain = tokens;
        this.allTokens.sidechain = tokens2;
        this.save('allTokens');
    },

    setAuthorizeDapps(authorizeDapps) {
        this.authorizeDapps = authorizeDapps;
        this.save('authorizeDapps');
    },

    saveVTokenList(vTokenList){
        this.vTokenList = vTokenList;
        this.save('vTokenList');
    },

    purge() {
        logger.warn('Purging TronLink. This will remove all stored transaction data');

        this.storage.set({
            transactions: Utils.encrypt({}, this.password)
        });

        logger.info('Purge complete. Please reload TronLink');
    }
};

export default StorageService;
