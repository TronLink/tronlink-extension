// reducers/index.js
import { combineReducers } from 'redux';
import {walletReducer} from './wallet'

export default combineReducers({
  wallet : walletReducer
});
