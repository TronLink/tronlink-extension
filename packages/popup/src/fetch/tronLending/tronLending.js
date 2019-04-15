import Utils from '@tronlink/lib/utils';

// TronLending index
export const getBankDefaultDataApi = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/default_data`;
    return requestUrl;
};

export const getBankIsRentApi = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/is_rent`;
    return requestUrl;
};

export const getBankBalanceEnoughApi = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/balance_enough`;
    return requestUrl;
};

export const postBankOrderApi = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/order`;
    return requestUrl;
};

// TronLending page list
export const getBankListApi = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/list`;
    return requestUrl;
};

// TronLending record detail
export const getBankOrderInfoApi = (env) => {
    const requestUrl = `${Utils.requestUrl(env)}/api/bank/order_info`;
    return requestUrl;
};

