const TransactionMapper = {
    mapAll(transactions) {
        return transactions.map(this.map);
    },

    map(transaction) {
        const newTransaction = {
            timestamp: transaction.raw_data.timestamp || false,
            direction: transaction.direction || false,
            signature: transaction.signature,
            txID: transaction.txID,
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
                newTransaction.sender = owner_address; // eslint-disable-line
                newTransaction.recipient = to_address; // eslint-disable-line
                newTransaction.amount = amount;
                newTransaction.token = Buffer.from(
                    parameter.value.asset_name,
                    'hex'
                ).toString('utf8');

                break;
            }
        }

        return newTransaction;
    }
};

export default TransactionMapper;