import EventDispatcher from 'lib/communication/EventDispatcher.js';
import PortChild from 'lib/communication/PortChild';
import Logger from 'lib/logger';
import extensionizer from 'extensionizer';
// import MessageDuplex from 'lib/MessageDuplex';

const logger = new Logger('contentScript');

// const child = new MessageDuplex.Tab('contentScript');

new PortChild(
    'contentScript',
    new EventDispatcher(
        'contentScript',
        'pageHook'
    )
);

try {
    const injectionSite = (document.head || document.documentElement);
    const container = document.createElement('script');

    container.src = extensionizer.extension.getURL('dist/pageHook.js');
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