import {
  INITIALIZE
} from "../actions/wallet"

const wallet_status= {
  none : 0, //only before loading
  uninitialized : 1,
  locked : 2,
  unlocked : 3
};

const initialState = {
    status : wallet_status.uninitialized,
    accounts : {},
    selectedAccountId : 0,
};

export function walletReducer(state = initialState, action) {
  switch (action.type) {
    case INITIALIZE: {
      return {
        ...state,
        status : wallet_status.uninitialized
      };
    }
    default:
      return state;
  }
}

