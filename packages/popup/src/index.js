import React from 'react';
import ReactDOM from 'react-dom';
import reduxLogger from 'redux-logger';
import App from 'app';
import Logger from '@tronlink/lib/logger';
import MessageDuplex from '@tronlink/lib/MessageDuplex';
import reducer from 'reducers';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import ja from 'react-intl/locale-data/ja';
import * as Sentry from '@sentry/browser';
import { Provider } from 'react-redux';
import { configureStore, getDefaultMiddleware } from 'redux-starter-kit';
import { PopupAPI } from '@tronlink/lib/api';
import { setConfirmations } from 'reducers/confirmationsReducer';
import { library } from '@fortawesome/fontawesome-svg-core';
import { version } from '@tronlink/popup/package';
import { tokensMap } from './tokensMap.js';
import axios from 'axios';

import {
    setAppState,
    setCurrency,
    setNodes,
    setPriceList,
    setLanguage,
    setSetting,
    setVersion,
    setDappList,
    setAuthorizeDapps,
    setLedgerImportAddress,
    setVTokenList,
    setChains
} from 'reducers/appReducer';

import {
    setAccount,
    setAccounts,
    setToken,
    setSelectedBankRecordId,
    changeDealCurrencyPage,
    setAirdropInfo
} from 'reducers/accountsReducer';

// This should be added into it's own class, and just call IconLibrary.init();
import {
    faLock,
    faCheckCircle,
    faTimesCircle,
    faCircle,
    faDotCircle
} from '@fortawesome/free-solid-svg-icons';

addLocaleData([...en, ...zh, ...ja]);
Sentry.init({
    dsn: 'http://7b03df289e7d42a7a4d5df9e1651bbd2@18.220.1.137:9000/13',
    release: `TronLink@${ process.env.REACT_APP_VERSION }`
});

localStorage.setItem('tokensMap', JSON.stringify(tokensMap));

let getTokensMap = async function () {
    let { data } = await axios.get(`https://apilist.tronscan.org/api/token?showAll=1&limit=4000`);
    for (let i = 0; i < data.data.length; i++) {
        if (!tokensMap[data.data[i].id]) {
            tokensMap[data.data[i].id] = data.data[i].name + '_' + data.data[i].id + '_' + data.data[i].precision + '_' + data.data[i].abbr;
        }
    }

    localStorage.setItem('tokensMap', JSON.stringify(tokensMap));
};

getTokensMap();

const logger = new Logger('Popup');

export const app = {
    duplex: new MessageDuplex.Popup(),
    async run() {
        this.loadIcons();
        this.createStore();
        await this.getAppState();
        this.bindDuplexRequests();
        this.render();
    },

    loadIcons() {
        library.add(
            faLock,
            faCheckCircle,
            faTimesCircle,
            faDotCircle,
            faCircle
        );
    },

    createStore() {
        logger.info('Creating redux store');

        this.store = configureStore({
            middleware: [
                ...getDefaultMiddleware(),
                reduxLogger
            ],
            reducer
        });

        logger.info('Created store', this.store);
    },

    async getAppState() {
        PopupAPI.init(this.duplex);
        const setting = await PopupAPI.getSetting();
        if (setting.lock.duration !== 0 && new Date().getTime() - setting.lock.lockTime > setting.lock.duration) {
            PopupAPI.lockWallet();
        }
        let [
            appState,
            nodes,
            accounts,
            selectedAccount,
            prices,
            confirmations,
            selectedToken,
            language,
            authorizeDapps,
            ledgerImportAddress,
            vTokenList,
            chains
        ] = await Promise.all([
            PopupAPI.requestState(),
            PopupAPI.getNodes(),
            PopupAPI.getAccounts(),
            PopupAPI.getSelectedAccount(),
            PopupAPI.getPrices(),
            PopupAPI.getConfirmations(),
            PopupAPI.getSelectedToken(),
            PopupAPI.getLanguage(),
            PopupAPI.getAuthorizeDapps(),
            PopupAPI.getLedgerImportAddress(),
            PopupAPI.getVTokenList(),
            PopupAPI.getChains()
        ]);
        const lang = navigator.language || navigator.browserLanguage;
        if (lang.indexOf('zh') > -1) {
            language = language || 'zh';
        } else if (lang.indexOf('ja') > -1) {
            language = language || 'ja';
        } else {
            language = language || 'en';
        }
        this.store.dispatch(setAppState(appState));
        this.store.dispatch(setNodes(nodes));
        this.store.dispatch(setAccounts(accounts));
        this.store.dispatch(setPriceList([prices.priceList, prices.usdtPriceList]));
        this.store.dispatch(setCurrency(prices.selected));
        this.store.dispatch(setConfirmations(confirmations));
        this.store.dispatch(setToken(selectedToken));
        this.store.dispatch(setLanguage(language));
        this.store.dispatch(setSetting(setting));
        this.store.dispatch(setVersion(version));
        this.store.dispatch(setAuthorizeDapps(authorizeDapps));
        this.store.dispatch(setLedgerImportAddress(ledgerImportAddress));
        this.store.dispatch(setVTokenList(vTokenList));
        this.store.dispatch(setChains(chains));
        if (selectedAccount) {
            this.store.dispatch(setAccount(selectedAccount));
        }

        logger.info('Set application state');
    },

    async getNodes() {
        const nodes = await PopupAPI.getNodes();

        this.store.dispatch(
            setNodes(nodes)
        );
    },

    async getChains() {
        const chains = await PopupAPI.getChains();

        this.store.dispatch(
            setChains(chains)
        );
    },

    bindDuplexRequests() {
        this.duplex.on('setState', appState => this.store.dispatch(
            setAppState(appState)
        ));

        this.duplex.on('setConfirmations', confirmations => this.store.dispatch(
            setConfirmations(confirmations)
        ));

        this.duplex.on('setAccount', account => this.store.dispatch(
            setAccount(account)
        ));

        this.duplex.on('setAccounts', accounts => this.store.dispatch(
            setAccounts(accounts)
        ));

        this.duplex.on('setPriceList', priceList => this.store.dispatch(
            setPriceList(priceList)
        ));

        this.duplex.on('setCurrency', currency => this.store.dispatch(
            setCurrency(currency)
        ));

        this.duplex.on('setSelectedToken', token => this.store.dispatch(
            setToken(token)
        ));

        this.duplex.on('setLanguage', language => this.store.dispatch(
            setLanguage(language)
        ));

        this.duplex.on('setSetting', setting => this.store.dispatch(
            setSetting(setting)
        ));

        this.duplex.on('setSelectedBankRecordId', id => this.store.dispatch(
            setSelectedBankRecordId(id)
        ));

        this.duplex.on('changeDealCurrencyPage', status => this.store.dispatch(
            changeDealCurrencyPage(status)
        ));

        this.duplex.on('setAirdropInfo', airdropInfo => this.store.dispatch(
            setAirdropInfo(airdropInfo)
        ));

        this.duplex.on('setDappList', dappList => this.store.dispatch(
            setDappList(dappList)
        ));

        this.duplex.on('setAuthorizeDapps', authorizeDapps => this.store.dispatch(
            setAuthorizeDapps(authorizeDapps)
        ));

        this.duplex.on('setLedgerImportAddress', address => this.store.dispatch(
            setLedgerImportAddress(address)
        ));

        this.duplex.on('setVTokenList', vTokenList => this.store.dispatch(
            setVTokenList(vTokenList)
        ));

        this.duplex.on('setChain', chains => this.store.dispatch(
            setChains(chains)
        ));

    },

    render() {
        logger.info('Rendering application');
        ReactDOM.render(
            <Provider store={ this.store }>
                <App />
            </Provider>,
            document.getElementById('root')
        );
    }
};

app.run();
