class TronWatch {
    constructor(linkedRequest) {
        this._linkedRequest = linkedRequest;
        this._extensionUrl = `chrome-extension://${EXTENSION_ID}`;
    }

    get proxy() {
        const solidityUrls = [
            'getaccount', 'listwitnesses', 'getassetissuelist',
            'getpaginatedassetissuelist', 'getnowblock', 'getblockbynum',
            'gettransactionbyid', 'gettransactioninfobyid', 'gettransactionsfromthis',
            'gettransactionstothis',
        ];

        const walletUrls = [
            'createtransaction', 'gettransactionsign', 'broadcasttransaction',
            'updateaccount', 'votewitnessaccount', 'createassetissue',
            'createaccount', 'createwitness', 'transferasset',
            'easytransfer', 'easytransferbyprivate', 'createaddress',
            'generateaddress', 'participateassetissue', 'freezebalance',
            'unfreezebalance', 'unfreezeasset', 'withdrawbalance',
            'updateasset', 'listnodes', 'getassetissuebyaccount',
            'getaccountnet', 'getassetissuebyname', 'getnowblock',
            'getblockbynum', 'getblockbyid', 'getblockbylimitnext',
            'getblockbylatestnum', 'gettransactionbyid', 'listwitnesses',
            'getassetissuelist', 'getpaginatedassetissuelist', 'totaltransaction',
            'getnextmaintenancetime', 'validateaddress',
        ];

        return {
            walletsolidity: solidityUrls.reduce((obj, method) => {
                obj[method] = `${this._extensionUrl}/proxy/${method}`;
                return obj;
            }, {}),
            wallet: walletUrls.reduce((obj, method) => {
                obj[method] = `${this._extensionUrl}/proxy/${method}`;
                return obj;
            }, {})
        };
    }

    signTransaction(transaction = false, broadcast = true) {
        // { signedTransaction: string, broadcasted: bool, transactionID: string }

        return this._linkedRequest.build({
            method: 'signTransaction',
            args: {
                transaction,
                broadcast
            }
        });        
    }

    getTransaction(transactionID) {
        // { transaction: obj }

        return this._linkedRequest.build({
            method: 'getTransaction',
            args: {
                transactionID
            }
        });    
    }

    getUserAccount() {        
        // { address: string, balance: integer }

        return this._linkedRequest.build({
            method: 'getUserAccount'
        });   
    }

    simulateSmartContract() {
        // I'm not sure what the input / output will be here

        return this._linkedRequest.build({
            method: 'simulateSmartContract'
        }); 
    }
};

export default TronWatch;