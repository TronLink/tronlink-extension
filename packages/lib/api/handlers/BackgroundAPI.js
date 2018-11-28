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
    }
};