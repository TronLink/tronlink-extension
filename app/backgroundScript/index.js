// Libraries
import PortHost from 'lib/communication/PortHost';
import PopupClient from 'lib/communication/popup/PopupClient';
import LinkedResponse from 'lib/messages/LinkedResponse';
import Logger from 'lib/logger';
import Utils from 'lib/utils';
import Wallet from './wallet';
import TronWebsocket from './websocket';
import nodeSelector from './nodeSelector';
import randomUUID from 'uuid/v4';

// Constants
import {
    CONFIRMATION_TYPE,
    CONFIRMATION_RESULT,
    CONFIRMATION_METHODS,
    WALLET_STATUS
} from 'lib/constants';

// Initialise utilities
const logger = new Logger('backgroundScript');
const portHost = new PortHost();
const popup = new PopupClient(portHost);
const linkedResponse = new LinkedResponse(portHost);
const wallet = new Wallet(nodeSelector.node);
const webSocket = new TronWebsocket(popup, nodeSelector.node.websocket);

logger.info('Script loaded');

webSocket.start();

const pendingConfirmations = {};
let dialog = false;
let addedWebsocketAlert = false;

const setNodeURLs = () => {
    const node = nodeSelector.node;

    wallet.rpc.url_full = node.full; // eslint-disable-line
    wallet.rpc.url_solidity = node.solidity; // eslint-disable-line

    webSocket.stop();

    if(node.websocket) {
        webSocket._url = node.websocket;
        webSocket.start();
    }
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
            'width=436,height=634,status=no,scrollbars=no,centerscreen=yes,alwaysRaised=yes'
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

    confirmation.reject('denied');
    delete pendingConfirmations[data.id];

    closeDialog();
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

    if (!pendingConfirmations.hasOwnProperty(confirmationID))
        return logger.warn(`Attempted to resolve non-existent confirmation ${confirmationID}`);

    logger.info(`Confirmation ${confirmationID} has been accepted by the user`);

    const confirmation = pendingConfirmations[confirmationID];
    const info = confirmation.confirmation;

    let output = {
        result: CONFIRMATION_RESULT.ACCEPTED
    };

    try {
        switch (info.type) {
            case CONFIRMATION_TYPE.SEND_TRON:
                output.rpcResponse = await wallet.sendTrx(info.to, info.amount);
                break;

            case CONFIRMATION_TYPE.SEND_ASSET:
                output.rpcResponse = await wallet.sendAsset(info.to, info.amount, info.assetID);
                break;

            case CONFIRMATION_TYPE.ISSUE_ASSET:
                output.rpcResponse = await wallet.issueAsset(info.options);
                break;

            case CONFIRMATION_TYPE.CREATE_SMARTCONTRACT:
                output = { output, ...await wallet.createSmartContract(info.abi, info.bytecode, info.name, info.options) };
                break;

            case CONFIRMATION_TYPE.TRIGGER_SMARTCONTRACT:
                output = { output, ...await wallet.triggerSmartContract(info.address, info.functionSelector, info.parameters, info.options) };
                break;

            case CONFIRMATION_TYPE.FREEZE:
                output.rpcResponse = await wallet.freeze(info.amount, info.duration);
                break;

            case CONFIRMATION_TYPE.UNFREEZE:
                output.rpcResponse = await wallet.unfreeze();
                break;

            default:
                logger.warn('Tried to confirm confirmation of unknown type:', info.type);

                confirmation.reject('Unknown transaction type');
                delete pendingConfirmations[data.id];

                reject();
                return closeDialog();
        }

        if(!output.rpcResponse.result)
            throw new Error(`Node returned invalid output: ${ output }`);
    } catch(ex) {
        const error = 'Failed to build valid transaction';

        logger.error(error, ex);

        confirmation.reject(error);
        delete pendingConfirmations[data.id];

        closeDialog();
        reject(error);

        return;
    }

    logger.info(`Broadcasted transaction for confirmation ${confirmationID}`);
    logger.info('Transaction output', output);

    confirmation.resolve(output);
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

    if(!addedWebsocketAlert) {
        webSocket.addAddress(
            wallet.getAccount().publicKey
        );

        addedWebsocketAlert = true;
    }

    popup.sendAccount(
        wallet.getAccount()
    );
};

const onWebsocketAlert = function(address) {
    updateAccount(address);
};

webSocket.callback = onWebsocketAlert;

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
    logger.info('Popup requested account update for', data);

    const { publicKey } = data;

    await wallet.updateAccount(publicKey);

    return popup.sendAccount(
        wallet.getAccount(publicKey)
    );
});

popup.on('sendTron', ({ data, resolve, reject }) => {
    const address = Utils.transformAddress(data.to);

    if(!address)
        return reject('The recipient address is invalid');

    if(!Utils.validateAmount(data.amount))
        return reject('The amount specified is invalid');

    if(data.amount > wallet.getAccount().balance)
        return reject('You don\'t have the funds required');

    return addConfirmation({
        type: CONFIRMATION_TYPE.SEND_TRON,
        amount: parseInt(data.amount),
        to: address,
        desc: false,
        hostname: 'TronLink',
    }, resolve, reject);
});

const handleWebCall = async ({
    request: {
        method,
        args = {}
    },
    meta: {
        hostname
    },
    resolve,
    reject
}) => {
    switch (method) {
        case CONFIRMATION_METHODS.SEND_TRX: {
            const {
                to,
                amount,
                desc
            } = args;

            const address = Utils.transformAddress(to);

            if(!address)
                return reject('Invalid recipient provided');

            if (!Utils.validateAmount(amount))
                return reject('Invalid amount provided');

            if (!Utils.validateDescription(desc))
                return reject('Invalid description provided');

            return addConfirmation({
                type: CONFIRMATION_TYPE.SEND_TRON,
                amount: parseInt(amount),
                to: address,
                desc,
                hostname,
            }, resolve, reject);
        }
        case CONFIRMATION_METHODS.FREEZE_TRX : {
            const {
                amount,
                duration
            } = args;

            return addConfirmation({
                type: CONFIRMATION_TYPE.FREEZE,
                amount,
                duration
            }, resolve, reject);
        }
        case CONFIRMATION_METHODS.UNFREEZE_TRX : {
            return addConfirmation({
                type: CONFIRMATION_TYPE.UNFREEZE
            }, resolve, reject);
        }
        case CONFIRMATION_METHODS.ISSUE_ASSET : {
            const {
                options
            } = args;

            return addConfirmation({
                type: CONFIRMATION_TYPE.ISSUE_ASSET,
                options,
                hostname
            }, resolve, reject);
        }
        case CONFIRMATION_METHODS.SEND_ASSET: {
            const {
                to,
                assetID,
                amount,
                desc
            } = args;

            const address = Utils.transformAddress(to);

            if(!address)
                return reject('Invalid recipient provided');

            if(!Utils.validateAmount(amount))
                return reject('Invalid amount provided');

            if(!Utils.validateDescription(desc))
                return reject('Invalid description provided');

            if(!wallet.getAccount().tokens.hasOwnProperty(assetID))
                return reject('Account does not have enough balance');

            if(amount > wallet.getAccount().tokens[assetID])
                return reject('Account does not have enough balance');

            return addConfirmation({
                type: CONFIRMATION_TYPE.SEND_ASSET,
                amount: parseInt(amount),
                to: address,
                assetID,
                desc,
                hostname
            }, resolve, reject);
        }
        case CONFIRMATION_METHODS.CREATE_SMARTCONTRACT: {
            const {
                abi,
                bytecode,
                name,
                options
            } = args;

            return addConfirmation({
                type: CONFIRMATION_TYPE.CREATE_SMARTCONTRACT,
                abi,
                bytecode,
                name,
                options
            }, resolve, reject);
        }
        case CONFIRMATION_METHODS.TRIGGER_SMARTCONTRACT : {
            const {
                address,
                functionSelector,
                parameters,
                options
            } = args;

            return addConfirmation({
                type: CONFIRMATION_TYPE.TRIGGER_SMARTCONTRACT,
                address,
                functionSelector,
                parameters,
                options
            }, resolve, reject);
        }
        case CONFIRMATION_METHODS.CALL_SMARTCONTRACT : {
            const {
                address,
                functionSelector,
                parameters,
                options
            } = args;

            const account = wallet.getFullAccount();

            if(account) {
                return resolve(
                    await wallet.rpc.callContract(account.publicKey, address, functionSelector, parameters, options)
                );
            }

            return reject('Wallet not unlocked');
        }
        case CONFIRMATION_METHODS.GET_ACCOUNT: {
            const account = wallet.getAccount();

            if(account)
                return resolve(account.address);

            return reject('Wallet not unlocked');
        }
        case CONFIRMATION_METHODS.NODE_GET_ACCOUNT: {
            const {
                address
            } = args;

            return resolve(
                await wallet.rpc.getAccount(address)
            );
        }
        case CONFIRMATION_METHODS.GET_CURRENT_BLOCK : {
            return resolve(
                await wallet.tronweb.trx.getCurrentBlock()
            );
        }
        case CONFIRMATION_METHODS.LIST_SUPER_REPRESENTATIVES: {
            return resolve(
                await wallet.tronweb.trx.listSuperRepresentatives()
            );
        }
        case CONFIRMATION_METHODS.LIST_TOKENS : {
            return resolve(
                await wallet.tronweb.trx.listTokens()
            );
        }
        case CONFIRMATION_METHODS.GET_BLOCK : {
            const { blockID } = args;

            return resolve(
                await wallet.tronweb.trx.getBlock(blockID)
            );
        }
        case CONFIRMATION_METHODS.GET_TRANSACTION : {
            const { transactionID } = args;

            return resolve(
                await wallet.tronweb.trx.getTransactionById(transactionID)
            );
        }
        case CONFIRMATION_METHODS.GET_TRANSACTION_INFO : {
            const { transactionID } = args;

            return resolve(
                await wallet.tronweb.trx.getTransactionInfoById(transactionID)
            );
        }
        default:
            reject(`Unknown method called (${ method })`);
    }
};

linkedResponse.on('request', ({
    request,
    meta,
    resolve,
    reject
}) => {
    if (request.method) {
        return handleWebCall({
            request,
            meta,
            resolve,
            reject
        });
    }

    reject('Unknown protocol called');
});
