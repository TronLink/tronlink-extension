import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

import PortChild from './extension/communication/PortChild';
import PopupHost from './extension/communication/popup/PopupHost';

import registerServiceWorker from './registerServiceWorker';


import reducers from './reducers';
import './index.css';

import App from './App';

// need to connect to port to send/receive data here
const createStoreWithMiddleware = applyMiddleware()(createStore);
export const store = createStoreWithMiddleware(reducers);

const portChild = new PortChild('popup');
export const popup = new PopupHost(portChild);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
