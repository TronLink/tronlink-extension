console.log('Content script loaded');

import EventDispatcher from 'lib/communication/EventDispatcher.js';
import PortChild from 'lib/communication/PortChild';

const pageHook = new EventDispatcher('contentScript', 'pageHook');
const backgroundScript = new PortChild('contentScript');

pageHook.on('tunnel', ({ data, source }) => {
    console.log(`Forwarding ${JSON.stringify(data)} from ${source}`);
    backgroundScript.send('tunnel', data);
});

backgroundScript.on('tunnel', data => {
    console.log(`Returning ${JSON.stringify(data)} to pageHook`);
    pageHook.send('tunnel', data);
});

// Inject pageHook.js into page
document.addEventListener('DOMContentLoaded', event => {
    console.log('DOM loaded, injecting pageHook');

    const node = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');

    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('dist/pageHook.js'));

    node.appendChild(script);
});

// To wait for dom element to be created:
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

// pageHook.on('test', ({ data, source }) => {
//     console.log(`contentScript received ${JSON.stringify(data)} from ${source}`);
//     pageHook.send('test', { time: Date.now() });
// });
// 
// backgroundScript.on('test', data => {
//     console.log(`contentScript port received ${JSON.stringify(data)}`);
// });
// 
// backgroundScript.send('test', { time: Date.now() });