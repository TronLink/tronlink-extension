import React, { Component } from 'react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import './App.css';

import { WALLET_STATUS } from 'extension/constants';

import Welcome from 'pages/Welcome';
import Import from 'pages/Import';
import Queue from 'pages/Queue';

import Send from 'pages/Send';
import Give from 'pages/Give';
import Settings from 'pages/Settings';
import Account from 'pages/Account';

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
                    <Route exact path="/import" component={ Import } />
                    <Route path="/main" render={ props => (
                        <div className="mainContainer">
                            <Switch>
                                <Route path="/main/confirm" component={ Send } />
                                <Route path="/main/give" component={ Give } />
                                <Route path="/main/settings" component={ Settings } />
                                <Route path="/main" component={ Account } />
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
