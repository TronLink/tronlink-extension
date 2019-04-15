import Utils from '@tronlink/lib/utils';

// TronLending index
export const getBankDefaultData = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/default_data`;
    return requestUrl;
};

export const getBankIsRent = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/is_rent`;
    return requestUrl;
};

export const getBankBalanceEnough = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/balance_enough`;
    return requestUrl;
};

export const postBankOrder = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/orde`;
    return requestUrl;
};

// TronLending page list
export const getBankList = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/list`;
    return requestUrl;
};

// TronLending record detail
export const getBankOrderInfo = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/order_info`;
    return requestUrl;
};

