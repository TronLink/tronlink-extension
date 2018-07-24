// reducers/index.js
import {combineReducers} from 'redux';
import {walletReducer} from './wallet'
import {confirmationsReducer} from './confirmations'

export default combineReducers({
    wallet: walletReducer,
    confirmations : confirmationsReducer
});
