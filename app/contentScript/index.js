import EventDispatcher from 'lib/communication/EventDispatcher.js';
import PortChild from 'lib/communication/PortChild';

new PortChild(
    'contentScript',
    new EventDispatcher(
        'contentScript',
        'pageHook'
    )
);

const container = document.createElement('script');

container.src = chrome.extension.getURL('dist/pageHook.js');
container.onload = function() {
    this.remove();
};

(document.head || document.documentElement).appendChild(container);