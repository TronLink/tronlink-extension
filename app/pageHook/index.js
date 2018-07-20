import EventDispatcher from 'lib/communication/EventDispatcher.js';
import LinkedRequest from 'lib/messages/LinkedRequest';
import TronWatch from 'pageHook/api/v1';

console.log('Page hook loaded');

const contentScript = new EventDispatcher('pageHook', 'contentScript');
const linkedRequest = new LinkedRequest(contentScript, ({ source, data }) => ({ ...data }));

/*const beginTest = () => {
    const result = linkedRequest.build({ hello: 'world' }, 5);

    result.then(response => {
        console.log({ response });
    }).catch(error => {
        console.warn({ error });
    });
}

beginTest();*/

window[window.TRON_WATCH_VARIABLE || 'TronWatch'] = {
    v1: new TronWatch(linkedRequest)
};

window.TRON_WATCH_ENABLED = true;

// Set any configuration options
const scriptUrl = document.getElementById('tronWatchAPI').src;
const queryString = scriptUrl.replace(/^[^\?]+\??/,'');
const qsMatch = /(?:\?|&|)([\w\d]*)=([^&]+)*&*/g;
const config = {};

let match = qsMatch.exec(queryString);

while(match != null) {
    config[match[1]] = match[2];
    match = qsMatch.exec(queryString);
};

window.TRON_WATCH_ENVIRONMENT = config.environment;
window.TRON_WATCH_VERSION = config.version;