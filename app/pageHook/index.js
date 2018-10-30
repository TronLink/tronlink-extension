import EventDispatcher from 'lib/communication/EventDispatcher.js';
import LinkedRequest from 'lib/messages/LinkedRequest';
import Logger from 'lib/logger';
import TronWeb from 'tronweb';
import utils from 'lib/utils';
import ExtensionProvider from './ExtensionProvider';

const logger = new Logger('pageHook');
const contentScript = new EventDispatcher('pageHook', 'contentScript');
const linkedRequest = new LinkedRequest(contentScript, ({ data }) => ({ ...data }));

const tronWeb = new TronWeb(
    new ExtensionProvider('http://placeholder.dev'),
    new ExtensionProvider('http://placeholder.dev')
);

const eventQueue = [];

tronWeb.eventServer = true;
tronWeb.ready = false;

const _sign = tronWeb.trx.sign.bind(tronWeb);
const _setAddress = tronWeb.setAddress.bind(tronWeb);
const _setEventServer = tronWeb.setEventServer.bind(tronWeb);
const _getEventResult = tronWeb.getEventResult.bind(tronWeb);
const _getEventByTransacionID = tronWeb.getEventByTransacionID.bind(tronWeb);

tronWeb.setPrivateKey = () => logger.warn('Setting private key disabled in TronLink');
tronWeb.setAddress = () => logger.warn('Setting address disabled in TronLink');
tronWeb.setFullNode = () => logger.warn('Setting full node disabled in TronLink');
tronWeb.setSolidityNode = () => logger.warn('Setting solidity node disabled in TronLink');
tronWeb.setEventServer = () => logger.warn('Setting event server disabled in TronLink');

Object.entries({
    getEventResult: _getEventResult,
    getEventByTransacionID: _getEventByTransacionID
}).forEach(([ funcName, func ]) => {
    tronWeb[funcName] = (...args) => {
        if(tronWeb.eventServer !== true)
            return func(...args);

        let promise = false;
        let success = false;
        let failure = false;

        if(!args.length || typeof args[args.length - 1] !== 'function') {
            promise = new Promise((resolve, reject) => {
                success = resolve;
                failure = reject;
            });
        }

        const callback = !promise && args[args.length - 1];

        eventQueue.push({
            success: success || callback.bind(false),
            failure: failure || callback,
            args,
            func
        });

        logger.info(`Event request #${ eventQueue.length } has been queued`);

        if(promise)
            return promise;
    };
});

const proxiedSignFunction = (transaction = false, privateKey = false, callback = false) => {
    if(utils.isFunction(privateKey)) {
        callback = privateKey; // eslint-disable-line
        privateKey = false; // eslint-disable-line
    }

    if(!callback)
        return utils.injectPromise(proxiedSignFunction, transaction, privateKey);

    if(privateKey)
        return _sign(transaction, privateKey, callback);

    if(!transaction)
        return callback('Invalid transaction provided');

    if(!tronWeb.ready)
        return callback('User has not unlocked wallet');

    linkedRequest.build({
        method: 'signTransaction',
        payload: {
            transaction,
            input: (typeof transaction === 'string') ? transaction : (transaction.__payload__ || transaction.raw_data.contract[0].parameter.value)
        }
    }, 0).then(transaction => callback(null, transaction)).catch(err => { // eslint-disable-line
        logger.warn('Failed to sign transaction', err);
        callback(err);
    });
};

tronWeb.trx.sign = proxiedSignFunction;
tronWeb.trx.signTransaction = proxiedSignFunction;

contentScript.on('setNodes', ({ data: { fullNode, solidityNode, eventServer } }) => {
    logger.info('TronLink detected node change:', { fullNode, solidityNode, eventServer });

    tronWeb.fullNode.setURL(fullNode);
    tronWeb.solidityNode.setURL(solidityNode);

    _setEventServer(eventServer);
});

contentScript.on('setAddress', ({ data: address }) => {
    logger.info('TronLink detected account change:', address);

    _setAddress(address);
    tronWeb.ready = true;
});

linkedRequest.build({ method: 'init' }).then(({
    address = false,
    node: {
        fullNode,
        solidityNode,
        eventServer
    }
}) => {
    logger.info('TronLink initiated');

    tronWeb.fullNode.setURL(fullNode);
    tronWeb.solidityNode.setURL(solidityNode);
    _setEventServer(eventServer);

    if(address) {
        _setAddress(address);
        tronWeb.ready = true;
    }

    eventQueue.forEach(({ resolve, reject, args, func }, index) => {
        func(...args)
            .then(resolve)
            .catch(reject)
            .then(() => (
                logger.info(`Event request #${ index + 1 } completed`)
            ));
    });
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
