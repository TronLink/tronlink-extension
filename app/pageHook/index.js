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
    const tronWeb = new TronWeb('https://api.trongrid.io:8090', 'https://api.trongrid.io:8091', 'https://api.trongrid.io'); // Default URLs to validate provider

    // tronWeb.fullNode = provider;
    // tronWeb.solidityNode = provider;

    tronWeb.setAddress("TAN4RmPrhZmCednPGcmwbLG41VDNMcqTaC")

    tronWeb._tronlinkSetAddress = tronWeb.setAddress
    // TODO:
    // - Overwrite event server

    tronWeb.setPrivateKey = () => logger.warn('Setting private key disabled in TronLink');
    tronWeb.setAddress = () => logger.warn('Setting address disabled in TronLink');
    tronWeb.setFullNode = () => logger.warn('Setting full node disabled in TronLink');
    tronWeb.setSolidityNode = () => logger.warn('Setting solidity node disabled in TronLink');
    tronWeb.setEventServer = () => logger.warn('Setting event server disabled in TronLink');

    tronWeb.trx.sign = async function(transaction = false, privateKey = false, callback = false) {
        if (!callback) {
            return new Promise((resolve, reject) => {
                linkedRequest.build({
                    method: 'signTransaction',
                    payload: transaction
                }).then((response)  => {
                    resolve(response.response)

                }).catch((err) => { // eslint-disable-line
                    logger.warn('Failed to sign transaction', err);
                    reject(err);
                });
            });
        } else {
            return linkedRequest.build({
                method: 'signTransaction',
                payload: transaction
            }).then(transaction => {
                callback(null, transaction)

            }).catch(err => { // eslint-disable-line
                logger.warn('Failed to sign transaction', err);
                callback(err);
            });
        }

    };

    window.tronWeb = tronWeb;

    logger.info('Script injected into page');
    logger.info('-> Running TronLink');
    logger.info('-> Injected TronWeb');
};

injectTronWeb();