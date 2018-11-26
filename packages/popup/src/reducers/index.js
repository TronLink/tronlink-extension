import { appReducer } from './appReducer';
import { accountsReducer } from './accountsReducer';
import { confirmationsReducer } from './confirmationsReducer';

export default {
    app: appReducer,
    accounts: accountsReducer,
    confirmations: confirmationsReducer
};