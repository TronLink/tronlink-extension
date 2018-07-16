import Communication, { CommunicationChannel } from 'lib/communication/index.js';

const port = chrome.runtime.connect({ name: 'tronContentScript' });

port.onMessage.addListener(message => {
    console.log('contentScript received message', message);
});

console.log('contentScript sending message ping');
port.postMessage('ping');

// Listen to messages from pageHook.js
window.addEventListener('tronContentScript', ({ detail: message }) => {
    // We should add a target param to the message
    // so we know when to forward to backgroundScript.js

    // forward with port.postMessage('ping')
    // reply with window.dispatchEvent (we should make 
    // this a wrapper that calls back with a reply method)

    console.log('contentScript receive message (from pageHook):', message);
    window.dispatchEvent(new CustomEvent('tronPageHook', { detail: 'Returning message ' + message }));
});

// Inject pageHook.js into page
document.addEventListener('DOMContentLoaded', event => {
    console.log('DOM loaded, injecting pageHook.js');

    const node = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('dist/pageHook.js'));

    node.appendChild(script);
});

// To wait for dom element to be created:
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver