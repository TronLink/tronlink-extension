import StorageService from '../StorageService';
import TronWeb from 'tronweb';
import Logger from '@tronlink/lib/logger';
import Utils from '@tronlink/lib/utils';
import NodeService from '../NodeService';

import { BigNumber } from 'bignumber.js';

import {
    ACCOUNT_TYPE,
    CONTRACT_ADDRESS
} from '@tronlink/lib/constants';
import axios from 'axios';
BigNumber.config({ EXPONENTIAL_AT: [-20, 30] });
const logger = new Logger('WalletService/Account');
class Account {
    constructor(accountType, importData, accountIndex = 0) {
        this.type = accountType;
        this.accountIndex = accountIndex;

        this.address = false;
        this.name = false;
        this.updatingTransactions = false;
        this.selectedBankRecordId = 0;
        this.dealCurrencyPage = 0;
        this.energy = 0;
        this.energyUsed = 0;
        this.balance = 0;
        this.frozenBalance = 0;
        this.netUsed = 0;
        this.netLimit = 0;
        this.totalEnergyWeight = 0; //totalEnergyWeight
        this.TotalEnergyLimit = 0; //TotalEnergyLimit
        this.lastUpdated = 0;
        this.asset = 0;
        this.ignoredTransactions = [];
        this.transactions = {};
        this.airdropInfo = {};
        this.transactionDetail = {};
        this.tokens = {
            basic: {},
            smart: {}
        };
        this.tokens.smart[ CONTRACT_ADDRESS.USDT ] = {
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 6,
            tokenId: CONTRACT_ADDRESS.USDT,
            balance: 0,
            price: 0
        };
        if(accountType == ACCOUNT_TYPE.MNEMONIC) {
            this._importMnemonic(importData);
        } else{
            this._importPrivateKey(importData);
        }
        this.loadCache();
    }

    static generateAccount() {
        const mnemonic = Utils.generateMnemonic();

        return new Account(
            ACCOUNT_TYPE.MNEMONIC,
            mnemonic
        );
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
            if(privateKey.match(/^T/) && TronWeb.isAddress(privateKey)){
                this.privateKey = null;
                this.address = privateKey;
            }else{
                this.privateKey = privateKey;
                this.address = TronWeb.address.fromPrivateKey(privateKey);
            }
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

    loadCache() {
        if(!StorageService.hasAccount(this.address))
            return logger.warn('Attempted to load cache for an account that does not exist');

        const {
            type,
            name,
            balance,
            frozenBalance,
            totalEnergyWeight,
            TotalEnergyLimit,
            transactions,
            tokens,
            netLimit,
            netUsed,
            energy,
            energyUsed,
            lastUpdated,
            asset
        } = StorageService.getAccount(this.address);

        // Old TRC10 structure are no longer compatible
        //tokens.basic = {};

        // Remove old token transfers so they can be fetched again
        Object.keys(this.transactions).forEach(txID => {
            const transaction = this.transactions[ txID ];

            if(transaction.type !== 'TransferAssetContract')
                return;

            if(transaction.tokenID)
                return;

            delete this.transactions[ txID ];
        });

        this.type = type;
        this.name = name;
        this.balance = balance;
        this.frozenBalance = frozenBalance;
        this.totalEnergyWeight = totalEnergyWeight;
        this.TotalEnergyLimit = TotalEnergyLimit;
        this.transactions = transactions;
        this.tokens = tokens;
        this.energy = energy;
        this.energyUsed = energyUsed;
        this.netLimit = netLimit;
        this.netUsed = netUsed;
        this.lastUpdated = lastUpdated;
        this.asset = asset;
        this.hash = '';

        if(!this.tokens.smart.hasOwnProperty(CONTRACT_ADDRESS.USDT)) {
            this.tokens.smart[ CONTRACT_ADDRESS.USDT ] = {
                symbol: 'USDT',
                name: 'Tether USD',
                decimals: 6,
                tokenId: CONTRACT_ADDRESS.USDT,
                balance: 0,
                price: 0
            };
        }
    }

    matches(accountType, importData) {
        if(this.type !== accountType)
            return false;

        if(accountType == ACCOUNT_TYPE.MNEMONIC && this.mnemonic === importData)
            return true;

        if(accountType == ACCOUNT_TYPE.PRIVATE_KEY && this.privateKey === importData)
            return true;

        return false;
    }

    reset() {
        this.balance = 0;
        this.energy = 0;
        this.energyUsed = 0;
        this.netUsed = 0;
        this.transactions = {};
        this.ignoredTransactions = [];
        this.netLimit = 0;
        this.asset = 0;
        Object.keys(this.tokens.smart).forEach(address => (
            this.tokens.smart[ address ].balance = 0
        ));

        this.tokens.basic = {};
    }
    /** update data of an account
     * basicTokenPriceList  trc10token price list(source from trxmarket)
     * smartTokenPriceList  trc20token price list(source from trxmarket)
     * usdtPrice            price of usdt
     **/
    async update(basicTokenPriceList = [], smartTokenPriceList = [], usdtPrice = 0) {
        if(!StorageService.allTokens.length)return;
        const { address } = this;
        logger.info(`Requested update for ${ address }`);
        try {
            const node = NodeService.getNodes().selected;
            if (node === 'f0b1e38e-7bee-485e-9d3f-69410bf30681' || node === '0f22e40f-a004-4c5a-99ef-004c8e6769bf') {
                const { data: account } = await axios.get('https://apilist.tronscan.org/api/account?address=' + address).catch(e => ( { data: {} } ));
                const account2 = await NodeService.tronWeb.trx.getUnconfirmedAccount(address);
                if (!account2.address) {
                    logger.info(`Account ${address} does not exist on the network`);
                    this.reset();
                    return true;
                }
                const addSmartTokens = Object.entries(this.tokens.smart).filter(([tokenId, token]) => !token.hasOwnProperty('abbr'));
                for (const [tokenId, token] of addSmartTokens) {
                    const contract = await NodeService.tronWeb.contract().at(tokenId).catch(e => false);
                    if (contract) {
                        let balance;
                        const number = await contract.balanceOf(address).call();
                        if (number.balance) {
                            balance = new BigNumber(number.balance).toString();
                        } else {
                            balance = new BigNumber(number).toString();
                        }
                        if (typeof token.name === 'object' || (!token.decimals)) {
                            const token2 = await NodeService.getSmartToken(tokenId).catch(err => {throw new Error(`get token ${tokenId} info fail`)});
                            this.tokens.smart[ tokenId ] = token2;
                        }
                        //this.tokens.smart[ tokenId ].imgUrl = false;
                        this.tokens.smart[ tokenId ].balance = balance;
                        this.tokens.smart[ tokenId ].price = 0;
                    } else {
                        this.tokens.smart[ tokenId ].balance = 0;
                        this.tokens.smart[ tokenId ].price = 0;
                    }
                    this.tokens.smart[ tokenId ].isLocked = token.hasOwnProperty('isLocked') ? token.isLocked : false;
                }
                this.tokens.smart[ CONTRACT_ADDRESS.USDT ].price = usdtPrice;
                let sentDelegateBandwidth = 0;
                const delegated = account.delegated;
                if (delegated && delegated.sentDelegatedBandwidth) {
                    for (let i = 0; i < delegated.sentDelegatedBandwidth.length; i++) {
                        sentDelegateBandwidth = sentDelegateBandwidth + delegated.sentDelegatedBandwidth[i][ 'frozen_balance_for_bandwidth' ];
                    }
                }
                let frozenBandwidth = 0;
                if (account.frozen && account.frozen.balances.length > 0) {
                    frozenBandwidth = account.frozen.balances[ 0 ].amount;
                }
                let sentDelegateResource = 0;
                if (delegated && delegated.sentDelegatedResource) {
                    for (let i = 0; i < delegated.sentDelegatedResource.length; i++) {
                        sentDelegateResource = sentDelegateResource + delegated.sentDelegatedResource[i]['frozen_balance_for_energy'];
                    }
                }
                let frozenEnergy = 0;
                if (account.accountResource && account.accountResource.frozen_balance_for_energy && account.accountResource.frozen_balance_for_energy.frozen_balance > 0) {
                    frozenEnergy = account.accountResource.frozen_balance_for_energy.frozen_balance;
                }
                this.frozenBalance = sentDelegateBandwidth + frozenBandwidth + sentDelegateResource + frozenEnergy;
                this.balance = account2.balance || 0;
                const filteredTokens = (account2.assetV2 || []).filter(({ value }) => {
                    return value >= 0
                });
                for (const { key, value } of filteredTokens) {
                    let token = this.tokens.basic[ key ] || false;
                    const filter = basicTokenPriceList.length ? basicTokenPriceList.filter(({ first_token_id }) => first_token_id === key) : [];
                    const trc20Filter = smartTokenPriceList.length ? smartTokenPriceList.filter(({ fTokenAddr }) => key === fTokenAddr) : [];
                    let { precision = 0, price } = filter.length ? filter[ 0 ] : (trc20Filter.length ? {
                        price: trc20Filter[ 0 ].price,
                        precision: trc20Filter[ 0 ].sPrecision
                    } : { price: 0, precision: 0 });
                    price = price / Math.pow(10, precision);

                    const {
                        name = 'TRX',
                        abbr = 'TRX',
                        decimals = 6,
                        imgUrl = false
                    } = StorageService.allTokens.filter(({ tokenId }) => tokenId === key)[ 0 ];
                    token = {
                        balance: 0,
                        name,
                        abbr,
                        decimals,
                        imgUrl,
                        isLocked: token.hasOwnProperty('isLocked') ? token.isLocked : false
                    };
                    this.tokens.basic[ key ] = {
                        ...token,
                        balance: value,
                        price
                    };
                }
                const smartTokens = account.trc20token_balances.filter(v => v.balance >= 0 && v.contract_address !== CONTRACT_ADDRESS.USDT);
                for (let { contract_address, decimals: precision } of smartTokens) {
                    let token = this.tokens.smart[ contract_address ] || false;
                    const filter = smartTokenPriceList.filter(({ fTokenAddr }) => fTokenAddr === contract_address);
                    const price = filter.length ? new BigNumber(filter[ 0 ].price).shiftedBy(-precision).toString() : 0;
                    const contract = await NodeService.tronWeb.contract().at(contract_address).catch(e => {throw new Error(`get contract instance ${contract_address} fail`)});
                    let balance;
                    if (contract) {
                        const number = await contract.balanceOf(address).call();
                        if (number.balance) {
                            balance = new BigNumber(number.balance).toString();
                        } else {
                            balance = new BigNumber(number).toString();
                        }
                    } else {
                        balance = 0;
                    }

                    const {
                        name,
                        abbr,
                        decimals,
                        imgUrl = false
                    } = StorageService.allTokens.filter(({ tokenId }) => tokenId === contract_address)[ 0 ];

                    token = {
                        price: 0,
                        balance: 0,
                        name,
                        abbr,
                        decimals,
                        imgUrl,
                        isLocked: token.hasOwnProperty('isLocked') ? token.isLocked : false
                    };
                    this.tokens.smart[ contract_address ] = {
                        ...token,
                        price,
                        balance
                    };
                }
            } else {
                const account = await NodeService.tronWeb.trx.getUnconfirmedAccount(address);
                if (!account.address) {
                    logger.info(`Account ${address} does not exist on the network`);
                    this.reset();
                    return true;
                }
                const filteredTokens = (account.assetV2 || []).filter(({ value }) => {
                    return value > 0;
                });
                if (filteredTokens.length > 0) {
                    for (const { key, value } of filteredTokens) {
                        let token = this.tokens.basic[ key ] || false;
                        const filter = basicTokenPriceList.length ? basicTokenPriceList.filter(({ first_token_id }) => first_token_id === key):[];
                        const trc20Filter = smartTokenPriceList.length ? smartTokenPriceList.filter(({ fTokenAddr }) => key === fTokenAddr) : [];
                        let { precision = 0, price } = filter.length ? filter[ 0 ] : (trc20Filter.length ? {
                            price: trc20Filter[ 0 ].price,
                            precision: trc20Filter[ 0 ].sPrecision
                        } : { price: 0, precision: 0 });
                        price = price / Math.pow(10, precision);
                        if ((!token && !StorageService.tokenCache.hasOwnProperty(key)) || (token && token.imgUrl == undefined))
                            await StorageService.cacheToken(key);

                        if (StorageService.tokenCache.hasOwnProperty(key)) {
                            const {
                                name,
                                abbr,
                                decimals,
                                imgUrl
                            } = StorageService.tokenCache[ key ];

                            token = {
                                balance: 0,
                                name,
                                abbr,
                                decimals,
                                imgUrl
                            };
                        }
                        this.tokens.basic[ key ] = {
                            ...token,
                            balance: value,
                            price
                        };
                    }
                } else {
                    this.tokens.basic = {};
                }
                //this.tokens.smart = {};
                const addSmartTokens = Object.entries(this.tokens.smart).filter(([tokenId, token]) => !token.hasOwnProperty('abbr') );
                for (const [tokenId, token] of addSmartTokens) {
                    const contract = await NodeService.tronWeb.contract().at(tokenId).catch(e => false);
                    if (contract) {
                        let balance;
                        const number = await contract.balanceOf(address).call();
                        if (number.balance) {
                            balance = new BigNumber(number.balance).toString();
                        } else {
                            balance = new BigNumber(number).toString();
                        }
                        if (typeof token.name === 'object') {
                            const token2 = await NodeService.getSmartToken(tokenId);
                            this.tokens.smart[ tokenId ] = token2;
                        } else {
                            this.tokens.smart[ tokenId ] = token;
                        }
                        this.tokens.smart[ tokenId ].imgUrl = false;
                        this.tokens.smart[ tokenId ].balance = balance;
                        this.tokens.smart[ tokenId ].price = 0;
                    } else {
                        this.tokens.smart[ tokenId ].balance = 0;
                        this.tokens.smart[ tokenId ].price = 0;
                    }
                }
                this.frozenBalance = (account.account_resource && account.account_resource.frozen_balance_for_energy ? account.account_resource.frozen_balance_for_energy.frozen_balance : 0) + (account.frozen ? account.frozen[0].frozen_balance : 0);
                this.balance = account.balance || 0;
            }
            let totalOwnTrxCount = new BigNumber(this.balance + this.frozenBalance).shiftedBy(-6);
            Object.entries({ ...this.tokens.basic, ...this.tokens.smart }).map(([tokenId, token]) => {
                if (token.price !== 0 && !token.isLocked) {
                    const prices = StorageService.prices;
                    const price = tokenId === CONTRACT_ADDRESS.USDT ? token.price / prices.priceList[prices.selected] : token.price;
                    totalOwnTrxCount = totalOwnTrxCount.plus(new BigNumber(token.balance).shiftedBy(-token.decimals).multipliedBy(price));
                }
            });
            this.asset = totalOwnTrxCount.toNumber();
            this.lastUpdated = Date.now();
            await Promise.all([
                this.updateBalance(),
                //this.updateTokens(tokens.smart)
            ]);
            logger.info(`Account ${address} successfully updated`);
            Object.keys(StorageService.getAccounts()).includes(this.address) && this.save();
        } catch(error) {
            logger.error(`update account ${this.address} fail`, error);
        }
        return true;
    }

    async updateBalance() {
        const { address } = this;
        const { EnergyLimit = 0, EnergyUsed = 0, freeNetLimit, NetLimit = 0, freeNetUsed = 0, NetUsed = 0, TotalEnergyWeight, TotalEnergyLimit } = await NodeService.tronWeb.trx.getAccountResources(address);
        this.energy = EnergyLimit;
        this.energyUsed = EnergyUsed;
        this.netLimit = freeNetLimit + NetLimit;
        this.netUsed = NetUsed + freeNetUsed;
        this.totalEnergyWeight = TotalEnergyWeight;
        this.TotalEnergyLimit = TotalEnergyLimit;
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
        } catch (e) {
            logger.error(`add smart token ${address} ${name} fail`,e);
        }

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
            frozenBalance: this.frozenBalance,
            totalEnergyWeight: this.totalEnergyWeight,
            TotalEnergyLimit: this.TotalEnergyLimit,
            energy: this.energy,
            energyUsed: this.energyUsed,
            netLimit: this.netLimit,
            netUsed: this.netUsed,
            transactions: this.transactions,
            lastUpdated: this.lastUpdated,
            selectedBankRecordId: this.selectedBankRecordId,
            dealCurrencyPage: this.dealCurrencyPage,
            airdropInfo: this.airdropInfo,
            transactionDetail:this.transactionDetail
        };
    }

    export() {
        return JSON.stringify(this);
    }

    save() {
        StorageService.saveAccount(this);
    }

    async sign(transaction) {
        if(!this.privateKey){
            return 'CREATION.LEDGER.ALERT.BODY';
        }
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
                { feeLimit: 10 * Math.pow(10, 6) },
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
