import EventDispatcher from 'lib/communication/EventDispatcher.js';
import LinkedRequest from 'lib/messages/LinkedRequest';
import Logger from 'lib/logger';
import TronWeb from 'tronweb';
import utils from 'lib/utils';

const logger = new Logger('pageHook');
const contentScript = new EventDispatcher('pageHook', 'contentScript');
const linkedRequest = new LinkedRequest(contentScript, ({ data }) => ({ ...data }));

const tronWeb = new TronWeb('http://placeholder.dev', 'http://placeholder.dev'); // These are not used. They're only to validate the provider.

tronWeb.defaultPrivateKey = 'FF'; // Default private key replaced in backgroundScript
tronWeb.ready = false;

const _sign = tronWeb.trx.sign.bind(tronWeb);
const _setAddress = tronWeb.setAddress.bind(tronWeb);
const _setFullNode = tronWeb.setFullNode.bind(tronWeb);
const _setSolidityNode = tronWeb.setSolidityNode.bind(tronWeb);
const _setEventServer = tronWeb.setEventServer.bind(tronWeb);

tronWeb.setPrivateKey = () => logger.warn('Setting private key disabled in TronLink');
tronWeb.setAddress = () => logger.warn('Setting address disabled in TronLink');
tronWeb.setFullNode = () => logger.warn('Setting full node disabled in TronLink');
tronWeb.setSolidityNode = () => logger.warn('Setting solidity node disabled in TronLink');
tronWeb.setEventServer = () => logger.warn('Setting event server disabled in TronLink');

const proxiedSignFunction = (transaction = false, privateKey = false, callback = false) => {
    if(utils.isFunction(privateKey)) {
        callback = privateKey; // eslint-disable-line
        privateKey = false; // eslint-disable-line
    }

    if(!callback)
        return utils.injectPromise(proxiedSignFunction, transaction, privateKey);

    if(privateKey || privateKey === 'FF')
        return _sign(transaction, privateKey, callback);

    if(!transaction)
        return callback('Invalid transaction provided');

    if(!tronWeb.ready)
        return callback('User has not unlocked wallet');

    linkedRequest.build({
        method: 'signTransaction',
        payload: transaction
    }, 0).then(transaction => callback(null, transaction)).catch(err => { // eslint-disable-line
        logger.warn('Failed to sign transaction', err);
        callback(err);
    });
};

tronWeb.trx.sign = proxiedSignFunction;
tronWeb.trx.signTransaction = proxiedSignFunction;

contentScript.on('setNodes', ({ data: { fullNode, solidityNode, eventServer } }) => {
    logger.info('TronLink detected node change:', { fullNode, solidityNode, eventServer });

    _setFullNode(fullNode);
    _setSolidityNode(solidityNode);
    _setEventServer(eventServer);
});

contentScript.on('setAddress', ({ data: address }) => {
    logger.info('TronLink detected account change:', address);

    tronWeb.ready = true;
    _setAddress(address);
});

linkedRequest.build({ method: 'init' }).then((address = false) => {
    logger.info('TronLink initiated');

    if(!address)
        return;

    _setAddress(address);
    tronWeb.ready = true;
}).catch(err => {
    logger.warn('Failed to initialise TronLink');
    logger.error(err);
});

tronWeb.on('addressChanged', () => {
    logger.info('TronWeb has switched to a new account');
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