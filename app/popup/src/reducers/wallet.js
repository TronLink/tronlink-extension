import {store, popup} from "../index";

/**********************************
 *********** ACTIONS **************
 **********************************/
export const INITIALIZE = "INITIALIZE";
export const SET_STATUS = "SET_STATUS";

export const unlockWallet = pass => ({
    type: INITIALIZE,
    pass: pass
});

export const setWalletStatus = status => ({
    type: SET_STATUS,
    status
});


/**********************************
 *********** UPDATES **************
 **********************************/

export const updateStatus = async () => {
    let status = await popup.getWalletStatus();
    console.log("update status, dispatching new status: " + status);
    store.dispatch(setWalletStatus(status));
};

/**********************************
 *********** REDUCER **************
 **********************************/
export const wallet_status = {
    none: 'NONE', //only before loading
    uninitialized: 'UNINITIALIZED',
    locked: 'LOCKED',
    unlocked: 'UNLOCKED'
};

const initialState = {
    status: wallet_status.uninitialized,
    accounts: {},
    selectedAccountId: 0,
};

export function walletReducer(state = initialState, action) {
    switch (action.type) {
        case INITIALIZE: {
            return {
                ...state,
                status: wallet_status.uninitialized
            };
        }
        case SET_STATUS : {
            return {
                ...state,
                status: action.status
            }
        }
        default:
            return state;
    }
}

