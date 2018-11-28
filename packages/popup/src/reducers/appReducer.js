import {
    APP_STATE,
    PAGES
} from '@tronlink/lib/constants';

import {
    createReducer,
    createAction
} from 'redux-starter-kit';

export const setAppState = createAction('setAppState');
export const setNodes = createAction('setNodes');
export const setPage = createAction('setPage');
export const setPriceList = createAction('setPriceList');
export const setCurrency = createAction('setCurrency');

export const appReducer = createReducer({
    appState: APP_STATE.UNINITIALISED,
    currentPage: PAGES.ACCOUNTS,
    nodes: {
        nodes: {},
        selected: false
    },
    prices: {
        priceList: {},
        selected: false
    }
}, {
    [ setAppState ]: (state, { payload }) => {
        state.appState = payload;
    },
    [ setPriceList ]: (state, { payload }) => {
        state.prices.priceList = payload;
    },
    [ setCurrency ]: (state, { payload }) => {
        state.prices.selected = payload;
    },
    [ setNodes ]: (state, { payload }) => {
        state.nodes = payload;
    },
    [ setPage ]: (state, { payload }) => {
        state.currentPage = payload;
    }
});