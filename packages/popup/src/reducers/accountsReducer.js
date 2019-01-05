import {
    createReducer,
    createAction
} from 'redux-starter-kit';

export const setAccount = createAction('setAccount');
export const setAccounts = createAction('setAccounts');
export const setWarning = createAction('setWarning');

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
            cached: [],
            uncached: 0
        }
    },
    accounts: { },
    warning:true
}, {
    [ setAccount ]: (state, { payload: { transactions, ...account } }) => {
        state.selected = account;

        const {
            cached,
            uncached
        } = Object.entries(transactions).reduce((obj, [ txID, transaction ]) => {
            if(transaction.cached)
                obj.cached.push(transaction);
            else obj.uncached += 1;

            return obj;
        }, {
            cached: [],
            uncached: 0
        });

        state.selected.transactions = {
            cached: cached.sort((a, b) => b.timestamp - a.timestamp),
            uncached
        };
    },
    [ setAccounts ]: (state, { payload }) => {
        state.accounts = payload;
    },
    [ setWarning ]: (state, {payload}) => {
        state.warning = payload;
    }
});
