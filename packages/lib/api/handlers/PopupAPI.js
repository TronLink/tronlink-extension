
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
        return this.duplex.send('importAccount', { privateKey, name });
    },

    addAccount(mnemonic, name) {
        return this.duplex.send('addAccount', { mnemonic, name });
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

    deleteNode(nodeID) {
        this.duplex.send('deleteNode', nodeID, false);
    },

    getNodes() {
        return this.duplex.send('getNodes');
    },

    // Chain manage
    getChains() {
        return this.duplex.send('getChains');
    },

    selectChain(chainId) {
        this.duplex.send('selectChain', chainId, false);
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

    getTransactionsByTokenId(tokenId,fingerprint,direction,limit) {
        return this.duplex.send('getTransactionsByTokenId', {tokenId,fingerprint,direction,limit});
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
    },

    getDappList(isFromStorage) {
        return this.duplex.send('getDappList',isFromStorage);
    },

    setDappList(dappList) {
        this.duplex.send('setDappList', dappList, false);
    },

    getAccountInfo(address) {
        return this.duplex.send('getAccountInfo', address);
    },

    setGaEvent(eventCategory, eventAction, eventLabel, referrer = '') {
        this.duplex.send('setGaEvent', { eventCategory, eventAction, eventLabel, referrer }, false);
    },

    getAllDapps() {
        return this.duplex.send('getAllDapps');
    },

    updateTokens(tokens) {
        this.duplex.send('updateTokens', tokens, false);
    },

    getAllTokens(selectedChain) {
        return this.duplex.send('getAllTokens',selectedChain);
    },

    setTransactionDetail(hash) {
       return this.duplex.send('setTransactionDetail', hash);
    },

    setAuthorizeDapps(authorizeDapps) {
        this.duplex.send('setAuthorizeDapps', authorizeDapps, false);
    },

    getAuthorizeDapps(){
        return this.duplex.send('getAuthorizeDapps');
    },

    setLedgerImportAddress(address){
        this.duplex.send('setLedgerImportAddress', address, false);
    },

    getLedgerImportAddress(){
        return this.duplex.send('getLedgerImportAddress');
    },

    getAbiCode(address){
        return this.duplex.send('getAbiCode', address);
    },

    getVTokenList(){
        return this.duplex.send('getVTokenList');
    },

    setPushMessage({iconUrl, title, message, hash}){
        this.duplex.send('setPushMessage', {iconUrl, title, message, hash}, false);
    },

    depositTrx(amount){
        return this.duplex.send('depositTrx', amount);
    },

    withdrawTrx(amount){
        return this.duplex.send('withdrawTrx', amount);
    },

    depositTrc10(id, amount){
        return this.duplex.send('depositTrc10', {id,amount});
    },

    withdrawTrc10(id, amount){
        return this.duplex.send('withdrawTrc10', {id,amount});
    },

    depositTrc20(contract_address,amount){
        return this.duplex.send('depositTrc20', {contract_address,amount});
    },

    withdrawTrc20(contract_address,amount){
        return this.duplex.send('withdrawTrc20', {contract_address,amount});
    }


}
