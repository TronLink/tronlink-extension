import EventDispatcher from 'lib/communication/EventDispatcher.js';
import PortChild from 'lib/communication/PortChild';
import Logger from 'lib/logger';

const logger = new Logger('contentScript');

new PortChild(
    'contentScript',
    new EventDispatcher(
        'contentScript',
        'pageHook'
    )
);

// https://developer.chrome.com/extensions/storage
// If we change this over to the Storage API
// we can get the node config directly from this script

try {
    const injectionSite = (document.head || document.documentElement);
    const container = document.createElement('script');

    container.src = chrome.extension.getURL('dist/pageHook.js');
    container.onload = function() {
        this.parentNode.removeChild(this);
    };

    injectionSite.insertBefore(
        container,
        injectionSite.children[0]
    );

    logger.info('TronLink injected');
} catch(ex) {
    logger.error('Failed to inject TronLink', ex);
}