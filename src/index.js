/*global chrome*/

import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

chrome.runtime.sendMessage({ message: 'ping' }, response => {
    console.log(response.message);
});

ReactDOM.render(<div>Hello</div>, document.getElementById('root'));
registerServiceWorker();
