/*global chrome*/

import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import './index.css';

import App from './App';

// need to connect to port to send/receive data here

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
