import { store, popup } from 'index';
import { WALLET_STATUS } from 'extension/constants';
import Logger from 'extension/logger';

const logger = new Logger('Wallet Reducer');

export const INITIALIZE = 'INITIALIZE';
export const SET_STATUS = 'SET_STATUS';
export const SET_ACCOUNT = 'SET_ACCOUNT';
export const SET_TRX_PRICE = 'SET_PRICE';
export const SET_NODES = 'SET_NODES';
export const SELECT_NODE = 'SELECT_NODE';
export const SET_ACCOUNTS = 'SET_ACCOUNTS';

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

export const setNodes = nodes => ({
    type: SET_NODES,
    nodes
});

export const selectNode = node => ({
    type: SELECT_NODE,
    node
});

export const setAccounts = accounts => ({
    type: SET_ACCOUNTS,
    accounts
});

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

export const getNodes = async () => {
    const { 
        selectedNode, 
        nodes
    } = (await popup.getNodes()).nodes;

    store.dispatch(
        setNodes(nodes)
    );

    store.dispatch(
        selectNode(selectedNode)
    );
}

export const getAccounts = async () => {
    const accounts = await popup.getAccounts();

    return store.dispatch(
        setAccounts(accounts)
    );
}

export function walletReducer(state = {
    status: WALLET_STATUS.UNINITIALIZED,
    account: {},
    accounts: {},
    networks: {},
    selectedNetwork: false,
    price: 0,
    lastPriceUpdate: Date.now()
}, action) {
    switch (action.type) {
        case SET_ACCOUNTS: {
            return {
                ...state,
                accounts: action.accounts
            }
        }
        case INITIALIZE: {
            return {
                ...state,
                status: WALLET_STATUS.UNINITIALIZED
            };
        }
        case SET_ACCOUNT: {
            return {
                ...state,
                account: action.account
            }
        }
        case SET_STATUS: {
            return {
                ...state,
                status: action.status
            }
        }
        case SET_TRX_PRICE: {
            return {
                ...state,
                price: action.price,
                lastPriceUpdate: Date.now()
            }
        }
        case SET_NODES: {
            return {
                ...state,
                networks: action.nodes
            }
        }
        case SELECT_NODE: {
            return {
                ...state,
                selectedNetwork: action.node
            }
        }
        default:
            return state;
    }
}