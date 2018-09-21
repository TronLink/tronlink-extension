import EventDispatcher from 'lib/communication/EventDispatcher.js';
import LinkedRequest from 'lib/messages/LinkedRequest';
import Logger from 'lib/logger';
import TronWeb from 'tronweb';
import TronLinkProvider from './TronLinkProvider';
import utils from 'lib/utils';

const logger = new Logger('pageHook');
const contentScript = new EventDispatcher('pageHook', 'contentScript');
const linkedRequest = new LinkedRequest(contentScript, ({ data }) => ({ ...data }));

const provider = new TronLinkProvider(linkedRequest);
const tronWeb = new TronWeb('http://127.0.0.1', 'http://127.0.0.1'); // These are not used. They're only to validate the provider.

tronWeb.fullNode = provider;
tronWeb.solidityNode = provider;

tronWeb.setPrivateKey = () => logger.warn('Setting private key disabled in TronLink');
tronWeb.setAddress = () => logger.warn('Setting address disabled in TronLink');
tronWeb.setFullNode = () => logger.warn('Setting full node disabled in TronLink');
tronWeb.setSolidityNode = () => logger.warn('Setting solidity node disabled in TronLink');
tronWeb.setEventServer = () => logger.warn('Setting event server disabled in TronLink');

const signFunction = tronWeb.sign;
const proxiedSignFunction = (transaction = false, privateKey = false, callback = false) => {
    if(utils.isFunction(privateKey)) {
        callback = privateKey; // eslint-disable-line
        privateKey = false; // eslint-disable-line
    }

    if(!callback)
        return utils.injectPromise(this, transaction, privateKey);

    if(privateKey)
        return signFunction(transaction, privateKey, callback);

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

tronWeb.sign = proxiedSignFunction;
tronWeb.signTransaction = proxiedSignFunction;

contentScript.on('setEventServer', ({ data: eventServer }) => {
    logger.info('TronLink detected Event Server change:', eventServer);
    tronWeb.eventServer = eventServer;
});

contentScript.on('setAddress', ({ data: address }) => {
    logger.info('TronLink detected account change:', address);

    tronWeb.defaultAddress = {
        hex: tronWeb.address.toHex(address),
        base58: tronWeb.address.fromHex(address)
    };
});

linkedRequest.build({ method: 'init' }).then(({ eventServer, address }) => {
    logger.info('TronLink initiated with values', { eventServer, address });

    tronWeb.eventServer = eventServer;

    if(!address)
        return;

    tronWeb.defaultAddress = {
        hex: tronWeb.address.toHex(address),
        base58: tronWeb.address.fromHex(address)
    };
}).catch(err => {
    logger.warn('Failed to initialise TronLink');
    logger.error(err);
});

const injectTronWeb = () => {
    if(window.tronWeb !== undefined)
        return logger.warn('Failed to inject TronWeb as it already exists in the global namespace');

    window.tronWeb = tronWeb;

    logger.info('Script injected into page');
    logger.info('-> Running TronLink');
    logger.info('-> Injected TronWeb');
};

injectTronWeb();