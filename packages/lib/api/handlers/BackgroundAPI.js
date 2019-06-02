export default {
    currentAccount: false,

    init(duplex) {
        this.duplex = duplex;
    },

    setState(appState) {
        this.duplex.send('popup', 'setState', appState, false);
    },

    setAccount(account) {
        this.duplex.send('popup', 'setAccount', account, false);

        if(this.currentAccount === account)
            return;

        this.duplex.send('tab', 'tunnel', {
            action: 'setAccount',
            data: account.address
        }, false);

        this.currentAccount = account;
    },

    setNode(node) {
        this.duplex.send('tab', 'tunnel', {
            action: 'setNode',
            data: node
        }, false);
    },

    setAccounts(accounts) {
        this.duplex.send('popup', 'setAccounts', accounts, false);
    },

    setPriceList(priceList) {
        this.duplex.send('popup', 'setPriceList', priceList, false);
    },

    setConfirmations(confirmationList) {
        this.duplex.send('popup', 'setConfirmations', confirmationList, false);
    },

    setCurrency(currency) {
        this.duplex.send('popup', 'setCurrency', currency, false);
    },

    setSelectedToken(token) {
        this.duplex.send('popup', 'setSelectedToken', token, false);
    },

    setLanguage(language) {
        this.duplex.send('popup', 'setLanguage', language, false);
    },

    setSetting(setting) {
        this.duplex.send('popup', 'setSetting', setting, false);
    },
    setSelectedBankRecordId(id) {
        this.duplex.send('popup', 'setSelectedBankRecordId', id, false);
    },

    changeDealCurrencyPage(status) {
        this.duplex.send('popup', 'changeDealCurrencyPage', status, false);
    },

    setAirdropInfo(airdropInfo) {
        this.duplex.send('popup', 'setAirdropInfo', airdropInfo, false);
    },

    setDappList(dappList) {
        this.duplex.send('popup', 'setDappList',dappList ,false);
    },

    setAuthorizeDapps(dappList) {
        this.duplex.send('popup', 'setAuthorizeDapps',dappList ,false);
    }

};
