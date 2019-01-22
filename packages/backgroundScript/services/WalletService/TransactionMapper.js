import StorageService from '../StorageService';

const TransactionMapper = {
    async mapAll(transactions) {
        const newTransactions = [];

        transactions.forEach(async transaction => {
            newTransactions.push(await this.map(transaction));
        });

        return newTransactions;
    },

    async map(transaction) {
        const newTransaction = {
            timestamp: transaction.raw_data.timestamp || transaction.timestamp || false,
            direction: transaction.direction || false,
            signature: transaction.signature || transaction.confirmed,
            txID: transaction.txID || transaction.hash,
            cached: false,
            receipt: false,
            result: false
        };

        const {
            type,
            parameter
        } = transaction.raw_data.contract[ 0 ];

        // Transaction metadata
        newTransaction.type = type;
        newTransaction.raw = parameter;

        const {
            owner_address, // eslint-disable-line
            to_address, // eslint-disable-line
            amount
        } = parameter.value;

        // Contract-specific data
        switch(type) {
            case 'TransferContract': {
                newTransaction.sender = owner_address; // eslint-disable-line
                newTransaction.recipient = to_address; // eslint-disable-line
                newTransaction.amount = amount;

                break;
            }
            case 'TransferAssetContract': {
                const tokenID = parameter.value.tokenID ? parameter.value.tokenID : Buffer.from(
                     parameter.value.asset_name,
                     'hex'
                ).toString('utf8');
                if(!StorageService.tokenCache.hasOwnProperty(tokenID))
                    await StorageService.cacheToken(tokenID);

                const {
                    decimals,
                    name
                } = StorageService.tokenCache[ tokenID ];

                newTransaction.sender = owner_address; // eslint-disable-line
                newTransaction.recipient = to_address; // eslint-disable-line
                newTransaction.amount = amount;
                newTransaction.decimals = decimals;
                newTransaction.tokenName = name;
                newTransaction.tokenID = tokenID;

                break;
            }
        }

        return newTransaction;
    }
};

export default TransactionMapper;
