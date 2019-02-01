import {
    createReducer,
    createAction
} from 'redux-starter-kit';

export const setAccount = createAction('setAccount');
export const setTokenId = createAction('setTokenId');
export const setAccounts = createAction('setAccounts');

export const accountsReducer = createReducer({
    selected: {
        tokens: {
            basic: {},
            smart: {}
        },
        type: false,
        name: false,
        address: false,
        balance: 0,
        transactions: {
            // cached: [],
            // uncached: 0
        },
        selectedToken:{}
    },
    accounts: { },
    selectedToken : {id:'_',name:'trx',decimals:6},
}, {
    [ setAccount ]: (state, { payload: { transactions,...account } }) => {
        state.selected = account;
        state.selected.transactions = transactions;
        // const {
        //     cached,
        //     uncached
        // } = Object.entries(transactions).reduce((obj, [ txID, transaction ]) => {
        //     if(transaction.cached)
        //         obj.cached.push(transaction);
        //     else obj.uncached += 1;
        //
        //     return obj;
        // }, {
        //     cached: [],
        //     uncached: 0
        // });
        //
        // state.selected.transactions = {
        //     cached: cached.sort((a, b) => b.timestamp - a.timestamp),
        //     uncached
        // };
    },
    [ setAccounts ]: (state, { payload }) => {
        state.accounts = payload;
    },
    [ setTokenId ]: (state, { payload }) => {
        state.selectedToken = payload;
    }
});
