import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import PortChild from './extension/communication/PortChild';
import PopupHost from './extension/communication/popup/PopupHost';

import { addConfirmation, updateConfirmations } from './reducers/confirmations';
import { setAccount, setTrxPrice } from "./reducers/wallet";

import reducers from './reducers';
import { updateStatus, updatePrice } from './reducers/wallet';

import './index.css';

import App from './App';

const createStoreWithMiddleware = applyMiddleware()(createStore);
export const store = createStoreWithMiddleware(reducers);

const portChild = new PortChild('popup');
export const popup = new PopupHost(portChild);

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);

/**********************************
 ********** LISTENERS *************
 **********************************/
popup.on('addConfirmation', ({ data, resolve, reject }) => {
    console.log('ADD CONFIRMATION', { data });
    store.dispatch(addConfirmation(data));
    resolve();
});

popup.on('sendAccount', ({ data, resolve, reject }) => {
    console.log('received account');
    store.dispatch(setAccount(data));
});

popup.on('broadcastPrice', ({ data, resolve, reject }) => {
    console.log('received price');
    store.dispatch(setTrxPrice(data));
});

updateConfirmations();
updateStatus();
updatePrice();
