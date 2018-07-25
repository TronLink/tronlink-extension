// Libraries
import PortHost from 'lib/communication/PortHost';
import PopupClient from 'lib/communication/popup/PopupClient';
import LinkedResponse from 'lib/messages/LinkedResponse';
import Wallet from './wallet';
import Logger from 'lib/logger';
import TronUtils from 'TronUtils';
import randomUUID from 'uuid/v4';

// Constants
import { CONFIRMATION_TYPE } from 'lib/constants';

// Initialise utilities
const logger = new Logger('backgroundScript');
const portHost = new PortHost();
const popup = new PopupClient(portHost);
const linkedResponse = new LinkedResponse(portHost);
const wallet = new Wallet();

logger.info('Script loaded');

const pendingConfirmations = {};
let dialog = false;

function addConfirmation(confirmation, resolve, reject) {
    confirmation.id = randomUUID();
    logger.info('Adding confirmation:', confirmation);

    pendingConfirmations[confirmation.id] = {
        confirmation,
        resolve,
        reject
    };

    popup.sendNewConfirmation(confirmation);

    if (dialog)
        dialog.focus();
    else dialog = window.open('app/popup/build/index.html', 'extension_popup', 'width=420,height=595,status=no,scrollbars=yes,resizable=false');
}

function closeDialog() {
    if(Object.keys(pendingConfirmations).length)
        return;

    if(!dialog)
        return;

    dialog.close();
    dialog = false;
}

popup.on('declineConfirmation', ({
    data,
    resolve,
    reject
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

popup.on('acceptConfirmation', ({
    data,
    resolve,
    reject
}) => {
    const { id: confirmationID } = data;

    if (!pendingConfirmations.hasOwnProperty(confirmationID))
        return logger.warn(`Attempted to resolve non-existent confirmation ${confirmationID}`);

    const confirmation = pendingConfirmations[confirmationID];

    logger.info(`Accepting confirmation ${confirmationID}`);
    logger.info(confirmation);

    confirmation.resolve(`accepted ${JSON.stringify(confirmation.confirmation)}`);
    delete pendingConfirmations[data.id];
    
    closeDialog();
    resolve();
});

popup.on('getConfirmations', ({
    data,
    resolve,
    reject
}) => {
    logger.info('Requesting confirmation list');

    const confirmations = Object.values(pendingConfirmations).map(({ confirmation }) => {
        return confirmation
    });

    resolve(confirmations);
});

popup.on('setPassword', ({
    data,
    resolve,
    reject
}) => {
    logger.info('Setting password for wallet', { wallet });

    if (wallet.isSetup())
        return logger.warn('Attempted to set password post initialisation');

    wallet.setupWallet(data.password);
});

async function updateAccount() {
    logger.info('Requesting account update');

    await wallet.updateAccounts();

    popup.sendAccount(
        wallet.getAccount()
    );
}

popup.on('unlockWallet', ({
    data,
    resolve,
    reject
}) => {
    logger.info('Requesting to unlock wallet');

    const success = wallet.unlockWallet(data.password);

    if(success)
        updateAccount();

    resolve(success);
});

popup.on('getWalletStatus', ({ data, resolve, reject }) => {
    logger.info('Requesting wallet status');
    resolve(wallet.status);
});

const handleWebCall = ({
    request: {
        method,
        args = {}
    },
    resolve,
    reject
}) => {
    switch (method) {
        case 'sendTron':
            addConfirmation({
                type: CONFIRMATION_TYPE.SEND_TRON,
                amount: args.amount
            }, resolve, reject);        
        default:
            reject('Unknown method called (' + method + ')');
    }
};

linkedResponse.on('request', ({
    request,
    resolve,
    reject
}) => {
    if (request.method) {
        return handleWebCall({
            request,
            resolve,
            reject
        });
    }

    reject('Unknown protocol called');
});