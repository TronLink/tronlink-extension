import EventDispatcher from 'lib/communication/EventDispatcher.js';
import LinkedRequest from 'lib/messages/LinkedRequest';
import Logger from 'lib/logger';
import TronWeb from 'tronweb';
import TronLinkProvider from './TronLinkProvider';
import utils from 'lib/utils';

const logger = new Logger('pageHook');
const contentScript = new EventDispatcher('pageHook', 'contentScript');
const linkedRequest = new LinkedRequest(contentScript, ({ data }) => ({ ...data }));

const injectTronWeb = () => {
    if(window.tronWeb !== undefined)
        return logger.warn('Failed to inject TronWeb as it already exists in the global namespace');

    const provider = new TronLinkProvider(linkedRequest);
    const tronWeb = new TronWeb('http://127.0.0.1', 'http://127.0.0.1'); // Default URLs to validate provider

    tronWeb.fullNode = provider;
    tronWeb.solidityNode = provider;

    // TODO:
    // - Overwrite event server

    tronWeb.setPrivateKey = () => logger.warn('Setting private key disabled in TronLink');
    tronWeb.setAddress = () => logger.warn('Setting address disabled in TronLink');
    tronWeb.setFullNode = () => logger.warn('Setting full node disabled in TronLink');
    tronWeb.setSolidityNode = () => logger.warn('Setting solidity node disabled in TronLink');
    tronWeb.setEventServer = () => logger.warn('Setting event server disabled in TronLink');

    const sign = tronWeb.sign;

    tronWeb.sign = function(transaction = false, privateKey = false, callback = false) {
        if(utils.isFunction(privateKey)) {
            callback = privateKey; // eslint-disable-line
            privateKey = false; // eslint-disable-line
        }

        if(!callback)
            return utils.injectPromise(this, transaction, privateKey);

        if(privateKey)
            return sign(transaction, privateKey, callback);

        if(!transaction)
            return callback('Invalid transaction provided');

        linkedRequest.build({
            method: 'signTransaction',
            payload: transaction
        }).then(transaction => callback(null, transaction)).catch(err => { // eslint-disable-line
            logger.warn('Failed to sign transaction', err);
            callback(err);
        });
    };

    tronWeb.signTransaction = tronWeb.sign;
    window.tronWeb = tronWeb;

    logger.info('Script injected into page');
    logger.info('-> Running TronLink');
    logger.info('-> Injected TronWeb');
};

injectTronWeb();