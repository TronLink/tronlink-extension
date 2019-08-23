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
export const setLanguage = createAction('setLanguage');
export const setSetting = createAction('setSetting');
export const setVersion = createAction('setVersion');
export const setDappList = createAction('setDappList');
export const setAuthorizeDapps = createAction('setAuthorizeDapps');
export const setLedgerImportAddress = createAction('setLedgerImportAddress');
export const setVTokenList = createAction('setVTokenList');
export const setChains = createAction('setChains');


export const appReducer = createReducer({
    appState: APP_STATE.UNINITIALISED,
    currentPage: PAGES.ACCOUNTS,
    nodes: {
        nodes: {},
        selected: false
    },
    chains: {
        chains: {},
        selected: false
    },
    prices: {
        priceList: {},
        usdtPriceList:{},
        selected: false
    },
    language: 'en',
    setting: {
        developmentMode: false
    },
    version: '',
    dappList: {
        recommend:[],
        used:[]
    },
    authorizeDapps: {},
    ledgerImportAddress:[],
    vTokenList:[]

}, {
    [ setAppState ]: (state, { payload }) => {
        state.appState = payload;
    },
    [ setPriceList ]: (state, { payload }) => {
        state.prices.priceList = payload[0];
        state.prices.usdtPriceList = payload[1];
    },
    [ setCurrency ]: (state, { payload }) => {
        state.prices.selected = payload;
    },
    [ setNodes ]: (state, { payload }) => {
        state.nodes = payload;
    },
    [ setChains ]: (state, { payload }) => {
        state.chains = payload;
    },
    [ setPage ]: (state, { payload }) => {
        state.currentPage = payload;
    },
    [ setLanguage ]: (state, { payload }) => {
        state.language = payload;
    },
    [ setSetting ]: (state, { payload }) => {
        state.setting = payload;
    },
    [ setVersion ]: (state, { payload }) => {
        state.version = payload;
    },
    [ setDappList ]: (state, { payload }) => {
        state.dappList = payload;
    },

    [ setAuthorizeDapps ]: (state, { payload }) => {
        state.authorizeDapps = payload;
    },

    [ setLedgerImportAddress ]: (state, { payload }) => {
        state.ledgerImportAddress = payload;
    },

    [ setVTokenList ]: (state, { payload }) =>{
        state.vTokenList = payload;
    }
});
