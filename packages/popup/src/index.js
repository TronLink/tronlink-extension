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

import {
    setAppState,
    setCurrency,
    setNodes,
    setPriceList,
    setLanguage,
    setSetting
} from 'reducers/appReducer';

import {
    setAccount,
    setAccounts,
    setToken
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
    dsn: 'https://546d9fe346d149f6b60962741858759b@sentry.io/1329911',
    release: `TronLink@${ process.env.REACT_APP_VERSION }`
});

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
        if(setting.lock.duration !== 0 && new Date().getTime() - setting.lock.lockTime > setting.lock.duration){
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
        ] = await Promise.all([
            PopupAPI.requestState(),
            PopupAPI.getNodes(),
            PopupAPI.getAccounts(),
            PopupAPI.getSelectedAccount(),
            PopupAPI.getPrices(),
            PopupAPI.getConfirmations(),
            PopupAPI.getSelectedToken(),
            PopupAPI.getLanguage()
        ]);
        const lang = navigator.language || navigator.browserLanguage;
        if(lang.indexOf('zh')>-1){
            language = language || 'zh';
        }else if(lang.indexOf('ja')>-1){
            language = language || 'ja';
        }else{
            language = language || 'en';
        }
        this.store.dispatch(setAppState(appState));
        this.store.dispatch(setNodes(nodes));
        this.store.dispatch(setAccounts(accounts));
        this.store.dispatch(setPriceList(prices.priceList));
        this.store.dispatch(setCurrency(prices.selected));
        this.store.dispatch(setConfirmations(confirmations));
        this.store.dispatch(setToken(selectedToken));
        this.store.dispatch(setLanguage(language));
        this.store.dispatch(setSetting(setting));
        if(selectedAccount)
            this.store.dispatch(setAccount(selectedAccount));

        logger.info('Set application state');
    },

    async getNodes() {
        const nodes = await PopupAPI.getNodes();

        this.store.dispatch(
            setNodes(nodes)
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
