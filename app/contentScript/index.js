import EventDispatcher from 'lib/communication/EventDispatcher.js';
import PortChild from 'lib/communication/PortChild';
import Logger from 'lib/logger';

const logger = new Logger('contentScript');
const pageHook = new EventDispatcher('contentScript', 'pageHook');
const backgroundScript = new PortChild('contentScript');

pageHook.on('tunnel', ({ data, source }) => {
    backgroundScript.send('tunnel', data);
});

backgroundScript.on('tunnel', data => {
    pageHook.send('tunnel', data);
});

logger.info('Script loaded. Waiting for DOM load event');

document.addEventListener('DOMContentLoaded', event => {
    logger.info('DOM loaded, injecting pageHook');

    const node = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');

    const config = {
        version: chrome.runtime.getManifest().version,
        environment: ENVIRONMENT
    };

    const queryString = Object.keys(config).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(config[k])}`).join('&');

    script.setAttribute('id', 'tronLinkAPI');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', `${chrome.extension.getURL('dist/pageHook.js')}?${queryString}`);

    node.prepend(script);
});

// To wait for dom element to be created:
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver