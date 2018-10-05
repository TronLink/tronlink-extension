import React, { Component } from 'react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { WALLET_STATUS } from 'extension/constants';

import Welcome from 'components/Welcome';
import Queue from 'components/Queue';

import Import from 'pages/Import';
import ImportTronWatch from 'pages/Import/TronWatch';
import ImportTronScan from 'pages/Import/TronScan';
import ImportMnemonicPhrase from 'pages/Import/MnemonicPhrase';
import ImportPrivateKey from 'pages/Import/PrivateKey';

import Accounts from 'pages/Accounts';
import Transactions from 'pages/Transactions';
import Tokens from 'pages/Tokens';
import Send from 'pages/Send';
import Settings from 'pages/Settings';

import './App.css';

class App extends Component {
    render() {
        const { 
            confirmations, 
            status 
        } = this.props;

        if (status === WALLET_STATUS.UNLOCKED && confirmations.length > 0) 
            return <Queue />;

        return (
            <MemoryRouter className="app">
                <Switch>
                    <Route exact path="/" component={ Welcome } />
                    <Route exact path="/confirm" component={ Queue } />
                    <Route path="/main" render={ props => (
                        <div className="mainContainer">
                            <Switch>
                                <Route path="/main/accounts" component={ Accounts } />
                                <Route path="/main/transactions" component={ Transactions } />
                                <Route path="/main/tokens" component={ Tokens } />
                                <Route path="/main/send" component={ Send } />

                                <Route exact path="/main/import" component={ Import } />
                                <Route exact path="/main/import/tronwatch" component={ ImportTronWatch } />
                                <Route exact path="/main/import/tronscan" component={ ImportTronScan } />
                                <Route exact path="/main/import/mnemonic" component={ ImportMnemonicPhrase } />
                                <Route exact path="/main/import/privatekey" component={ ImportPrivateKey } />

                                <Route path="/main/settings" component={ Settings } />                                
                            </Switch>
                        </div>
                    )} />
                </Switch>
            </MemoryRouter>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    status: state.wallet.status
}))(App);
