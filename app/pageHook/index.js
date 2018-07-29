import EventDispatcher from 'lib/communication/EventDispatcher.js';
import LinkedRequest from 'lib/messages/LinkedRequest';
import TronLink from 'pageHook/api/v1';
import Logger from 'lib/logger';

const logger = new Logger('pageHook');
const contentScript = new EventDispatcher('pageHook', 'contentScript');
const linkedRequest = new LinkedRequest(contentScript, ({ data }) => ({ ...data }));
const scriptVariable = (window.TRON_LINK_VARIABLE || 'TronLink').toString();

window[scriptVariable] = {
    v1: (network = 'mainnet') => new TronLink(linkedRequest, network)
};

window.TRON_LINK_ENABLED = true;

// Set any configuration options
const scriptUrl = document.getElementById('tronLinkAPI').src;
const queryString = scriptUrl.replace(/^[^?]+\??/, '');
const qsMatch = /(?:\?|&|)([\w\d]*)=([^&]+)*&*/g;
const config = {};

let match = qsMatch.exec(queryString);

// eslint-disable-next-line no-null/no-null
while(match != null) {
    config[match[1]] = match[2];
    match = qsMatch.exec(queryString);
}

window.TRON_LINK_ENVIRONMENT = config.environment;
window.TRON_LINK_VERSION = config.version;

logger.info('Script injected into page');
logger.info(`-> Running TronLink v${config.version}`);
logger.info(`-> Running in ${config.environment} mode`);
logger.info(`-> Injected under ${scriptVariable}`);