import Utils from '@tronlink/lib/utils';

// TronLending index
export const getBankDefaultDataApi = () => {
    const requestUrl = `${Utils.requestUrl()}/api/bank/default_data`;
    return requestUrl;
};

export const getBankIsRentApi = () => {
    const requestUrl = `${Utils.requestUrl()}/api/bank/is_rent2`;
    return requestUrl;
};

export const getBankBalanceEnoughApi = () => {
    const requestUrl = `${Utils.requestUrl()}/api/bank/balance_enough`;
    return requestUrl;
};

export const postBankOrderApi = () => {
    const requestUrl = `${Utils.requestUrl()}/api/bank/order`;
    return requestUrl;
};

// TronLending page list
export const getBankListApi = () => {
    const requestUrl = `${Utils.requestUrl()}/api/bank/list`;
    return requestUrl;
};

// TronLending record detail
export const getBankOrderInfoApi = () => {
    const requestUrl = `${Utils.requestUrl()}/api/bank/order_info`;
    return requestUrl;
};

