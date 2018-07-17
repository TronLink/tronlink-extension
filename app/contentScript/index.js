console.log('Content script loaded');

import EventDispatcher from 'lib/communication/EventDispatcher.js';
import PortChild from 'lib/communication/PortChild';

const pageHookChannel = new EventDispatcher('tronContentScript');
const contentChannel = new PortChild('tronContentScript');

pageHookChannel.on('test', data => {
    console.log('received event with data', data);

    pageHookChannel.send('tronPageHook', 'test', { from: 'contentScript' });
});

contentChannel.on('test', data => {
    console.log('received port event with data', data);
});

contentChannel.send('test', { from:'contentScript' });

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