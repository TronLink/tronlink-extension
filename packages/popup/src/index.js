import React from 'react';
import ReactDOM from 'react-dom';
import reduxLogger from 'redux-logger';
import App from 'app';
import Logger from '@tronlink/lib/logger';
import MessageDuplex from '@tronlink/lib/MessageDuplex';
import reducer from 'reducers';

import * as Sentry from '@sentry/browser';

import { addLocaleData, IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { configureStore, getDefaultMiddleware } from 'redux-starter-kit';
import { PopupAPI } from '@tronlink/lib/api';
import { setConfirmations } from 'reducers/confirmationsReducer';
import { library } from '@fortawesome/fontawesome-svg-core';

import {
    setAppState,
    setCurrency,
    setNodes,
    setPriceList
} from 'reducers/appReducer';

import {
    setAccount,
    setAccounts
} from 'reducers/accountsReducer';

// This should be added into it's own class, and just call IconLibrary.init();
import {
    faLock,
    faCheckCircle,
    faTimesCircle,
    faCircle,
    faDotCircle
} from '@fortawesome/free-solid-svg-icons';

import enLocale from 'react-intl/locale-data/en';
import enMessages from 'translations/en.json';

Sentry.init({
    dsn: 'https://546d9fe346d149f6b60962741858759b@sentry.io/1329911',
    release: `TronLink@${ process.env.REACT_APP_VERSION }`
});

const logger = new Logger('Popup');

export const app = {
    duplex: new MessageDuplex.Popup(),

    async run() {
        this.loadLocale();
        this.loadIcons();
        this.createStore();

        await this.getAppState();

        this.bindDuplexRequests();
        this.render();
    },

    loadLocale() {
        logger.info('Loading locale and translation data');

        addLocaleData([
            ...enLocale
        ]);

        this.messages = {
            en: enMessages
        };

        this.languageKey = navigator.language.split(/[-_]/)[ 0 ];
        this.language = this.messages.hasOwnProperty(this.languageKey) ? this.languageKey : 'en';

        logger.info('Loaded locales and translations');
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

        const [
            appState,
            nodes,
            accounts,
            selectedAccount,
            prices,
            confirmations
        ] = await Promise.all([
            PopupAPI.requestState(),
            PopupAPI.getNodes(),
            PopupAPI.getAccounts(),
            PopupAPI.getSelectedAccount(),
            PopupAPI.getPrices(),
            PopupAPI.getConfirmations()
        ]);

        this.store.dispatch(setAppState(appState));
        this.store.dispatch(setNodes(nodes));
        this.store.dispatch(setAccounts(accounts));
        this.store.dispatch(setPriceList(prices.priceList));
        this.store.dispatch(setCurrency(prices.selected));
        this.store.dispatch(setConfirmations(confirmations));

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
    },

    render() {
        logger.info('Rendering application');

        ReactDOM.render(
            <Provider store={ this.store }>
                <IntlProvider
                    key={ this.language }
                    locale={ this.language }
                    messages={ this.messages[ this.language ] }
                >
                    <App />
                </IntlProvider>
            </Provider>,
            document.getElementById('root')
        );
    }
};

app.run();