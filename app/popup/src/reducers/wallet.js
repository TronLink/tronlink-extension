import { store, popup } from 'index';
import { WALLET_STATUS } from 'extension/constants';
import Logger from 'extension/logger';

const logger = new Logger('Wallet Reducer');

/**********************************
 *********** ACTIONS **************
 **********************************/
export const INITIALIZE = 'INITIALIZE';
export const SET_STATUS = 'SET_STATUS';
export const SET_ACCOUNT = 'SET_ACCOUNT';
export const SET_TRX_PRICE = 'SET_PRICE';

export const unlockWallet = pass => ({
    type: INITIALIZE,
    pass: pass
});

export const setWalletStatus = status => ({
    type: SET_STATUS,
    status
});

export const setAccount  = account => ({
    type: SET_ACCOUNT,
    account
});

export const setTrxPrice = price => ({
    type: SET_TRX_PRICE,
    price
});

/**********************************
 *********** UPDATES **************
 **********************************/

export const updateStatus = async () => {
    const status = await popup.getWalletStatus();
    
    logger.info('Update wallet status required');
    logger.info('New wallet status:', status);

    store.dispatch(
        setWalletStatus(status)
    );
};

export const updatePrice = async () => {
    const price = await popup.getPrice();

    logger.info('Update price required');
    logger.info('New price:', price);

    store.dispatch(
        setTrxPrice(price)
    );
};

/**********************************
 *********** REDUCER **************
 **********************************/

const initialState = {
    status: WALLET_STATUS.UNINITIALIZED,
    account: {
        transactions: []
    },
    selectedAccountId: false,
    price : 0.0
};

export function walletReducer(state = initialState, action) {
    switch (action.type) {
        case INITIALIZE: {
            return {
                ...state,
                status: WALLET_STATUS.UNINITIALIZED
            };
        }
        case SET_ACCOUNT:{
            return {
                ...state,
                account : action.account
            }
        }
        case SET_STATUS : {
            return {
                ...state,
                status: action.status
            }
        }
        case SET_TRX_PRICE:{
            return {
                ...state,
                price : action.price
            }
        }
        default:
            return state;
    }
}