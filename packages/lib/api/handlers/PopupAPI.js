export default {
    init(duplex) {
        this.duplex = duplex;
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

    // Misc

    selectCurrency(currency) {
        this.duplex.send('selectCurrency', currency, false);
    }
};