import Communication, { CommunicationChannel } from 'lib/communication/index.js';

console.log('Content script loaded');

/*const portCommunication = new Communication(CommunicationChannel.PORT, 'tronContentScript');
const eventCommunication = new Communication(CommunicationChannel.EVENT_LISTENER, 'tronContentScript');

portCommunication.on('test', data => {
    console.log('received port with data', data);
});

eventCommunication.on('test', data => {
    console.log('received event with data', data);
});

portCommunication.send('test', { from: 'contentScript' });
eventCommunication.send('test', { from: 'contentScript' }, 'tronPageHook');*/

// Inject pageHook.js into page
document.addEventListener('DOMContentLoaded', event => {
    // console.log('DOM loaded, injecting pageHook.js');

    const node = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('dist/pageHook.js'));

    node.appendChild(script);
});

// To wait for dom element to be created:
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver