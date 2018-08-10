import React from 'react';
import ReactDOM from 'react-dom';

import { addLocaleData, IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import PortChild from './extension/communication/PortChild';
import PopupHost from './extension/communication/popup/PopupHost';

import { addConfirmation, updateConfirmations } from './reducers/confirmations';
import { setAccount, setTrxPrice } from './reducers/wallet';

import reducers from './reducers';
import { updateStatus, updatePrice } from './reducers/wallet';

import App from 'components/App';
import Logger from 'extension/logger';

import enLocaleData from 'react-intl/locale-data/en';
import frLocaleDate from 'react-intl/locale-data/fr';

import messages_en from 'translations/en.json';
import messages_fr from 'translations/fr.json';

addLocaleData([
    ...enLocaleData,
    ...frLocaleDate
]);

const messages = {
    en: messages_en,
    fr: messages_fr
};

const languageKey = navigator.language.split(/[-_]/)[0];
const language = messages.hasOwnProperty(languageKey) ? languageKey : 'en';

const logger = new Logger('index');

const createStoreWithMiddleware = applyMiddleware()(createStore);
export const store = createStoreWithMiddleware(reducers);

const portChild = new PortChild('popup');
export const popup = new PopupHost(portChild);

ReactDOM.render(
    <Provider store={ store }>
        <IntlProvider key={ language } locale={ language } messages={ messages[language] }>
            <App/>
        </IntlProvider>
    </Provider>,
    document.getElementById('root')
);

/**********************************
 ********** LISTENERS *************
 **********************************/
popup.on('isOpen', ({ resolve }) => {
    resolve();
});

popup.on('addConfirmation', data => {
    logger.info('Adding confirmation', data);

    store.dispatch(
        addConfirmation(data)
    );
});

popup.on('sendAccount', data => {
    logger.info('Received account', data);

    store.dispatch(
        setAccount(data)
    );
});

popup.on('broadcastPrice', data => {
    logger.info('Received price', data);

    store.dispatch(
        setTrxPrice(data)
    );
});

updateConfirmations();
updateStatus();
updatePrice();
