export default {
    init(duplex) {
        this.duplex = duplex;
    },

    //Data refresh
    refresh() {
        return this.duplex.send('refresh');
    },
    // Data requesting

    requestState() {
        return this.duplex.send('requestState');
    },

    changeState(appState) {
        return this.duplex.send('changeState', appState, false);
    },

    resetState() {
        return this.duplex.send('resetState', {}, false);
    },

    getPrices() {
        return this.duplex.send('getPrices');
    },

    getConfirmations() {
        return this.duplex.send('getConfirmations');
    },

    // Confirmation actions

    acceptConfirmation(whitelistDuration) {
        return this.duplex.send('acceptConfirmation', whitelistDuration, false);
    },

    rejectConfirmation() {
        return this.duplex.send('rejectConfirmation', {}, false);
    },

    // Transaction handling

    sendTrx(recipient, amount) {
        return this.duplex.send('sendTrx', { recipient, amount });
    },

    sendBasicToken(recipient, amount, token) {
        return this.duplex.send('sendBasicToken', { recipient, amount, token });
    },

    sendSmartToken(recipient, amount, token) {
        return this.duplex.send('sendSmartToken', { recipient, amount, token });
    },

    // Account control

    importAccount(privateKey, name) {
        this.duplex.send('importAccount', { privateKey, name }, false);
    },

    addAccount(mnemonic, name) {
        this.duplex.send('addAccount', { mnemonic, name }, false);
    },

    selectAccount(address) {
        this.duplex.send('selectAccount', address, false);
    },

    deleteAccount() {
        this.duplex.send('deleteAccount', {}, false);
    },

    getAccounts() {
        return this.duplex.send('getAccounts');
    },

    exportAccount() {
        return this.duplex.send('exportAccount');
    },

    getSelectedAccount() {
        return this.duplex.send('getSelectedAccount');
    },

    getAccountDetails(address) {
        return this.duplex.send('getAccountDetails', address);
    },

    addSmartToken(address, name, symbol, decimals) {
        return this.duplex.send('addSmartToken', {
            address,
            name,
            symbol,
            decimals
        });
    },

    // Node control

    selectNode(nodeID) {
        this.duplex.send('selectNode', nodeID, false);
    },

    addNode(node) {
        this.duplex.send('addNode', node, false);
    },

    deleteNode() {

    },

    getNodes() {
        return this.duplex.send('getNodes');
    },

    getSmartToken(address) {
        return this.duplex.send('getSmartToken', address);
    },

    // Wallet authentication

    setPassword(password) {
        return this.duplex.send('setPassword', password);
    },

    unlockWallet(password) {
        return this.duplex.send('unlockWallet', password);
    },

    lockWallet() {
        return this.duplex.send('lockWallet');
    },
    // Misc

    selectCurrency(currency) {
        this.duplex.send('selectCurrency', currency, false);
    },

    setSelectedToken(token) {
        this.duplex.send('setSelectedToken', token, false);
    },

    getSelectedToken() {
        return this.duplex.send('getSelectedToken');
    },

    //get type of language package

    getLanguage() {
        return this.duplex.send('getLanguage');
    },

    setLanguage(language) {
        this.duplex.send('setLanguage', language, false);
    },

    getSetting() {
        return this.duplex.send('getSetting');
    },

    setSetting(setting) {
        this.duplex.send('setSetting', setting, false);
    },


    //tronbank contract
    rentEnergy(_freezeAmount, _payAmount, _days, _energyAddress) {
        return this.duplex.send('rentEnergy', {
            _freezeAmount,
            _payAmount,
            _days,
            _energyAddress
        });
    },

    bankOrderNotice(energyAddress, trxHash, requestUrl) {
        return this.duplex.send('bankOrderNotice', {
            energyAddress,
            trxHash,
            requestUrl
        });
    },

    //tronbank  index
    getBankDefaultData(requestUrl) {
        return this.duplex.send('getBankDefaultData', { requestUrl });
    },

    isValidOverTotal(receiverAddress, freezeAmount, requestUrl) {
        return this.duplex.send('isValidOverTotal', { receiverAddress, freezeAmount, requestUrl });
    },

    getTransactionsByTokenId({tokenId,start,direction}) {
        return this.duplex.send('getTransactionsByTokenId', {tokenId,start,direction});
    },

    getNews() {
        return this.duplex.send('getNews');
    },

    getIeos() {
        return this.duplex.send('getIeos');
    },

    addCount(id) {
        return this.duplex.send('addCount',id);
    },

    calculateRentCost(receiverAddress, freezeAmount, days, requestUrl) {
        return this.duplex.send('calculateRentCost', { receiverAddress, freezeAmount, days, requestUrl });
    },

    isValidOrderAddress(address, requestUrl) {
        return this.duplex.send('isValidOrderAddress', { address, requestUrl });
    },

    isValidOnlineAddress(address) {
        return this.duplex.send('isValidOnlineAddress', { address });
    },

    //record list
    getBankRecordList(address, limit, start, type, requestUrl) {
        return this.duplex.send('getBankRecordList', { address, limit, start, type, requestUrl });
    },

    getBankRecordDetail(id, requestUrl) {
        return this.duplex.send('getBankRecordDetail', { id, requestUrl });
    },

    setSelectedBankRecordId(id) {
        this.duplex.send('setSelectedBankRecordId', id, false);
    },

    changeDealCurrencyPage(status) {
        this.duplex.send('changeDealCurrencyPage', status, false);
    },

    setAirdropInfo(address) {
        this.duplex.send('setAirdropInfo', address, false);
    }

};
