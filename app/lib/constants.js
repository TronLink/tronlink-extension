export const CONFIRMATION_TYPE = {
    SEND_TRON: 'SEND_TRON',
    SEND_ASSET: 'SEND_ASSET',
    ISSUE_ASSET: 'ISSUE_ASSET',
    CREATE_SMARTCONTRACT: 'CREATE_SMARTCONTRACT',
    TRIGGER_SMARTCONTRACT: 'TRIGGER_SMARTCONTRACT',
    FREEZE: 'FREEZE',
    UNFREEZE: 'UNFREEZE'
};

export const CONFIRMATION_RESULT = {
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED'
};

export const CONFIRMATION_METHODS = {
    GET_CURRENT_BLOCK: 'getCurrentBlock',
    LIST_SUPER_REPRESENTATIVES: 'listSuperRepresentatives',
    LIST_TOKENS: 'listTokens',
    GET_BLOCK: 'getBlock',
    GET_TRANSACTION: 'getTransaction',
    GET_TRANSACTION_INFO: 'getTransactionInfo',
    NODE_GET_ACCOUNT: 'nodeGetAccount',
    SEND_TRX: 'sendTrx',
    SEND_ASSET: 'sendAsset',
    ISSUE_ASSET: 'issueAsset',
    FREEZE_TRX: 'freezeTrx',
    UNFREEZE_TRX: 'unfreezeTrx',
    SEND_TRANSACTION: 'sendTransaction',
    SIGN_TRANSACTION: 'signTransaction',
    SIMULATE_SMARTCONTRACT: 'simulatedSmartContract',
    CREATE_SMARTCONTRACT: 'createSmartContract',
    TRIGGER_SMARTCONTRACT: 'triggerSmartContract',
    CALL_SMARTCONTRACT: 'callSmartContract',
    GET_ACCOUNT: 'getAccount'
};

export const WALLET_STATUS = {
    UNINITIALIZED: 'UNINITIALIZED',
    LOCKED: 'LOCKED',
    UNLOCKED: 'UNLOCKED'
};

export const ACCOUNT_TYPE = {
    RAW: 0,
    MNEMONIC: 1
};

export const BIP44 = {
    INDEX: 195,
    HEXA: 0x800000c3
};

export const ENCRYPTION_ALGORITHM = 'aes-256-ctr';
export const LOCALSTORAGE_NAMESPACE = 'TronLink';
export const LOCALSTORAGE_KEY = `${ LOCALSTORAGE_NAMESPACE }_WALLET`;

export const CURRENCY = {
    USD: 'USD'
};

export const TRON_CONSTANTS_BASE = {
    ADDRESS_SIZE: 42,
    TRANSACTION_MAX_BYTE_SIZE: 500 * 1024,
    MAXIMUM_TIME_UNTIL_EXPIRATION: 24 * 60 * 60 * 1000,
    TRANSACTION_DEFAULT_EXPIRATION_TIME: 60 * 1000
};

export const TRON_CONSTANTS_MAINNET = {
    ADD_PRE_FIX_BYTE: 0x41,
    ADD_PRE_FIX_STRING: '41',
};

export const TRON_CONSTANTS_TESTNET = {
    ADD_PRE_FIX_BYTE: 0xa0,
    ADD_PRE_FIX_STRING: 'a0',
};
