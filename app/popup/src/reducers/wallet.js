import {
  INITIALIZE
} from "../actions/wallet"

const WALLET_STATUS= {
  NONE : 0, //only before loading
  UNINITIALIZED : 1,
  LOCKED : 2,
  UNLOCKED : 3
};

const initialState = {
  status : WALLET_STATUS.UNINITIALIZED
};

export function walletReducer(state = initialState, action) {
  switch (action.type) {
    case INITIALIZE: {
      return {
        ...state,
        status : WALLET_STATUS.UNINITIALIZED
      };
    }
    default:
      return state;
  }
}

