import PortHost from 'lib/communication/PortHost';
import PopupClient from 'lib/communication/popup/PopupClient';
import LinkedResponse from 'lib/messages/LinkedResponse';
import Logger from 'lib/logger';
import Utils from 'lib/utils';
import mapTransaction from 'lib/mapTransaction';
import Wallet from './wallet';
import nodeSelector from './nodeSelector';
import randomUUID from 'uuid/v4';

import {
    CONFIRMATION_TYPE,
    WALLET_STATUS
} from 'lib/constants';

const logger = new Logger('backgroundScript');
const portHost = new PortHost();
const popup = new PopupClient(portHost);
const linkedResponse = new LinkedResponse(portHost);
const wallet = new Wallet(nodeSelector.node);

logger.info('Script loaded');

const pendingConfirmations = {};
let dialog = false;

const setNodeURLs = () => {
    const node = nodeSelector.node;

    logger.info('New node selected:', node);

    wallet.tronWeb.setFullNode(node.full); // eslint-disable-line
    wallet.tronWeb.setSolidityNode(node.solidity); // eslint-disable-line
    wallet.tronWeb.setEventServer(node.event);

    portHost.broadcast('setNodes', {
        fullNode: node.full,
        solidityNode: node.solidity,
        eventServer: node.event
    });
};

const addConfirmation = (confirmation, resolve, reject) => {
    confirmation.id = randomUUID();

    logger.info(`Adding confirmation from site ${confirmation.hostname}:`, confirmation);

    pendingConfirmations[confirmation.id] = {
        confirmation,
        resolve,
        reject
    };

    popup.sendNewConfirmation(confirmation);

    if(dialog && dialog.closed)
        dialog = false;

    if (dialog)
        return dialog.focus();

    popup.isOpen().catch(() => {
        logger.info('Popup is not open, opening dialog');

        dialog = window.open(
            'app/popup/build/index.html',
            'extension_popup',
            [
                'width=436',
                'height=634',
                'status=no',
                'scrollbars=no',
                'centerscreen=yes',
                'alwaysRaised=yes',
                'top=25',
                'left=25'
            ].join(',')
        );
    });
};

const closeDialog = () => {
    if(Object.keys(pendingConfirmations).length)
        return;

    if(!dialog)
        return;

    dialog.close();
    dialog = false;
};

popup.on('getNodes', ({ resolve }) => {
    const {
        node,
        nodes
    } = nodeSelector;

    resolve({
        node,
        nodes
    });
});

popup.on('addNode', ({
    data,
    resolve,
    reject
}) => {
    const { error, nodeHash } = nodeSelector.addNode(data);

    if(error)
        return reject(error);

    nodeSelector.setNode(nodeHash);

    setNodeURLs();
    resolve(nodeHash);
});

popup.on('deleteNode', nodeHash => {
    nodeSelector.removeNode(nodeHash);
    setNodeURLs();
});

popup.on('setNode', ({
    data,
    resolve,
    reject
}) => {
    const success = nodeSelector.setNode(data);

    if(!success)
        return reject();

    setNodeURLs();
    resolve();
});

popup.on('selectAccount', publicKey => {
    wallet.selectAccount(publicKey);

    popup.sendAccount(
        wallet.getAccount()
    );
});

popup.on('createAccount', ({
    data: name,
    resolve
}) => {
    if(!name || name.length > 32)
        return;

    const account = wallet.createAccount(name);
    const { publicKey } = account;

    wallet.selectAccount(publicKey);

    resolve(account);
});

popup.on('importAccount', async ({
    data: {
        accountType,
        importData,
        name
    },
    resolve
}) => {
    if(!name || name.length > 32)
        return;

    const account = await wallet.importAccount(accountType, importData, name);
    const { publicKey } = account;

    wallet.selectAccount(publicKey);

    resolve(account);
});

popup.on('deleteAccount', publicKey => {
    wallet.deleteAccount(publicKey);

    popup.sendAccount(
        wallet.getAccount()
    );
});

popup.on('acceptConfirmation', async ({
    data,
    resolve,
    reject
}) => {
    const { id: confirmationID } = data;

    if (!pendingConfirmations.hasOwnProperty(confirmationID)) {
        reject('Confirmation does not exist');
        return logger.warn(`Attempted to resolve non-existent confirmation ${confirmationID}`);
    }

    logger.info(`Confirmation ${confirmationID} has been accepted by the user`);

    const {
        confirmation,
        resolve: confirmationResolve
    } = pendingConfirmations[confirmationID];

    const transaction = confirmation.signedTransaction;

    logger.info(`Signed transaction for confirmation ${confirmationID}`);
    logger.info('Signed transaction', transaction);

    confirmationResolve(transaction);
    delete pendingConfirmations[confirmationID];

    closeDialog();
    resolve();
});

popup.on('declineConfirmation', ({
    data,
    resolve
}) => {
    const { id: confirmationID } = data;

    if (!pendingConfirmations.hasOwnProperty(confirmationID))
        return logger.warn(`Attempted to reject non-existent confirmation ${confirmationID}`);

    const confirmation = pendingConfirmations[confirmationID];

    logger.info(`Declining confirmation ${confirmationID}`);
    logger.info(confirmation);

    confirmation.reject('Declined by user');
    delete pendingConfirmations[data.id];

    closeDialog();
    resolve();
});

popup.on('getConfirmations', ({
    resolve
}) => {
    logger.info('Requesting confirmation list');

    const confirmations = Object.values(pendingConfirmations).map(({ confirmation }) => {
        return confirmation;
    });

    resolve(confirmations);
});

popup.on('setPassword', ({
    data,
    resolve,
    reject
}) => {
    logger.info('Setting password for wallet', { wallet });

    if (wallet.isSetup()) {
        logger.warn('Attempted to set password post initialisation');
        return reject('Wallet has already been created');
    }

    const account = wallet.setupWallet(data.password);

    resolve(
        account
    );
});

const updateAccount = async () => {
    logger.info('Requesting account update');

    await wallet.updateAccounts();

    popup.sendAccount(
        wallet.getAccount()
    );
};

popup.on('unlockWallet', ({
    data,
    resolve
}) => {
    logger.info('Requesting to unlock wallet');

    const success = wallet.unlockWallet(data.password);

    if(success)
        updateAccount();

    resolve(success);
});

popup.on('getWalletStatus', async ({ resolve }) => {
    logger.info('Requesting wallet status');

    resolve(wallet.status);

    if(wallet.status === WALLET_STATUS.UNLOCKED) {
        await wallet.updateAccounts();

        return popup.sendAccount(
            wallet.getAccount()
        );
    }
});

popup.on('getAccounts', async ({ resolve }) => {
    await wallet.updateAccounts();

    resolve(
        wallet.getAccounts()
    );

    popup.sendAccount(
        wallet.getAccount()
    );
});

popup.on('updateAccount', async data => {
    const { publicKey } = data;

    logger.info('Popup requested account update for', publicKey);

    await wallet.updateAccount(publicKey);

    return popup.sendAccount(
        wallet.getAccount(publicKey)
    );
});

popup.on('sendTron', async ({ data, resolve, reject }) => {
    const address = Utils.transformAddress(data.recipient);

    if(!address)
        return reject('The recipient address is invalid');

    if(!Utils.validateAmount(data.amount))
        return reject('The amount specified is invalid');

    if(data.amount > wallet.getAccount().balance)
        return reject('You don\'t have the funds required');

    const unsignedTransaction = await wallet.tronWeb.transactionBuilder.sendTrx(address, data.amount);
    const signedTransaction = await wallet.tronWeb.trx.signTransaction(unsignedTransaction);
    const input = signedTransaction.raw_data.contract[0].parameter.value;

    return addConfirmation({
        type: CONFIRMATION_TYPE.SIGNED_TRANSACTION,
        hostname: 'TronLink',
        signedTransaction,
        input
    }, (transaction) => {
        resolve(wallet.tronWeb.trx.sendRawTransaction(transaction));
    }, reject);
});

// Ideally we should move this into a separate file
linkedResponse.on('request', async ({
    request,
    resolve,
    reject,
    meta
}) => {
    const {
        method,
        payload
    } = request;

    if(!method)
        return reject('Unknown protocol called');

    logger.info('TronWeb requested method', method);

    switch(method) {
        case 'init': {
            if(!wallet.isSetup())
                return reject('Wallet not signed in');

            const { node } = nodeSelector;

            return resolve({
                address: wallet.getAccount().publicKey,
                node: {
                    fullNode: node.full,
                    solidityNode: node.solidity,
                    eventServer: node.event
                }
            });
        }

        case 'signTransaction':
            logger.info('Received sign request for', payload);

            if(!wallet.isSetup())
                return reject('User has not unlocked wallet');

            try {
                const {
                    transaction,
                    input
                } = payload;

                const contractType = transaction.raw_data.contract[0].type;

                const {
                    mapped,
                    error
                } = await mapTransaction(wallet.tronWeb, contractType, input);

                if(error)
                    return reject(error);

                if(!mapped)
                    return reject('Invalid transaction provided');

                const signedTransaction = await wallet.tronWeb.trx.signTransaction(mapped.transaction || mapped);

                logger.info('Initial transaction', payload);
                logger.info('Recreated transaction', mapped);
                logger.info('Signed transaction', signedTransaction);

                return addConfirmation({
                    type: CONFIRMATION_TYPE.SIGNED_TRANSACTION,
                    hostname: meta.hostname,
                    signedTransaction,
                    input
                }, resolve, reject);
            } catch(ex) {
                logger.error('Failed to sign transaction:', ex);
                return reject('Invalid transaction provided');
            }

        default:
            logger.warn('TronWeb requsted invalid method', method);
            reject('Method not implemented');
    }
});

wallet.on('accountChange', address => {
    logger.info('New account detected:', address);
    portHost.broadcast('setAddress', address);
});
