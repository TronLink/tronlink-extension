// Libraries
import PortHost from 'lib/communication/PortHost';
import PopupClient from 'lib/communication/popup/PopupClient';
import LinkedResponse from 'lib/messages/LinkedResponse';
import Logger from 'lib/logger';
import Utils from 'lib/utils';
import Wallet from './wallet';
import TronWebsocket from './websocket';
import TronUtils from 'TronUtils';
import randomUUID from 'uuid/v4';

// Constants
import { 
    CONFIRMATION_TYPE, 
    CONFIRMATION_RESULT, 
    WALLET_STATUS 
} from 'lib/constants';

// Initialise utilities
const logger = new Logger('backgroundScript');
const portHost = new PortHost();
const popup = new PopupClient(portHost);
const linkedResponse = new LinkedResponse(portHost);
const wallet = new Wallet();
const webSocket = new TronWebsocket(popup);
const rpc = new TronUtils.rpc();

logger.info('Script loaded');

webSocket.start();

const pendingConfirmations = {};
let dialog = false;

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

    dialog = window.open(
        'app/popup/build/index.html', 
        'extension_popup', 
        'width=436,height=634,status=no,scrollbars=no,centerscreen=yes,alwaysRaised=yes'
    );
};

const closeDialog = () => {
    if(Object.keys(pendingConfirmations).length)
        return;

    if(!dialog)
        return;

    dialog.close();
    dialog = false;
};

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

popup.on('acceptConfirmation', async ({
    data,
    resolve
}) => {
    const { id: confirmationID } = data;

    if (!pendingConfirmations.hasOwnProperty(confirmationID))
        return logger.warn(`Attempted to resolve non-existent confirmation ${confirmationID}`);

    const confirmation = pendingConfirmations[confirmationID];
    const info = confirmation.confirmation;

    const output = {
        result: CONFIRMATION_RESULT.ACCEPTED
    };

    switch (info.type) {
        case CONFIRMATION_TYPE.SEND_TRON:
            output.rpcResponse = await wallet.send(info.recipient, info.amount);
            break;
        default:
            logger.warn('tried to confirm confirmation of unknown type:', info.type);
    }

    logger.info(`Accepting confirmation ${confirmationID}`);
    logger.info(confirmation);

    confirmation.resolve(JSON.stringify(output));
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
        return reject();
    }

    wallet.setupWallet(data.password);
    resolve();
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
        popup.sendAccount(
            wallet.getAccount()
        );

        await wallet.updateAccounts();
        popup.sendAccount(
            wallet.getAccount()
        );
    }
});

popup.on('sendTron', ({ data, resolve, reject }) => {
    if(!Utils.validateAmount(data.amount))
        reject('Invalid amount.');

    return addConfirmation({
        type: CONFIRMATION_TYPE.SEND_TRON,
        amount: parseInt(data.amount),
        recipient: data.recipient,
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
        /********************************
        ************ WALLET *************
        ********************************/
        case 'sendTron': {
            const {
                recipient,
                amount,
                desc
            } = args;

            if(!Utils.validateAmount(amount))
                return reject('Invalid amount provided');

            if(!Utils.validateDescription(desc))
                return reject('Invalid description provided');

            return addConfirmation({
                type: CONFIRMATION_TYPE.SEND_TRON,
                amount: parseInt(amount),
                recipient,
                desc,
                hostname,
            }, resolve, reject);
        } case 'getAccount': {
            const account = wallet.getAccount();

            if(account)
                resolve(account.address);
            else reject('Wallet not unlocked.');

            break;
        }

        /********************************
        ************ NODE ***************
        ********************************/

        case 'nodeGetAccount': {
            const {
                address
            } = args;

            return resolve(await rpc.getAccount(address));
        }
        case 'getLatestBlock' : {
            return resolve(await rpc.getNowBlock());
        }
        case 'getWitnesses' : {
            return resolve(await rpc.getWitnesses());
        }
        case 'getTokens' : {
            return resolve(await rpc.getTokens());
        }
        case 'getBlock' : {
            const {
                blockID
            } = args;
            return resolve(await rpc.getBlock(blockID));
        }
        case 'getTransaction' : {
            const {
                transactionID
            } = args;
            return resolve(await rpc.getTransactionById(transactionID));
        }

        /********************************
        *********** UTILS ***************
        ********************************/

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