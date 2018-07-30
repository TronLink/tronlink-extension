import React, { Component } from 'react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import './App.css';

import { wallet_status } from './reducers/wallet.js';

import Welcome from './components/Welcome';
import Import from './components/Import';
import Main from './components/Main';
import Queue from './components/Queue';

class App extends Component {
    render() {
        let { confirmations, status } = this.props;
        console.log(status)
        if (status === wallet_status.unlocked && confirmations.length > 0) return <Queue />;
        return (
            <MemoryRouter className="app">
                <Switch>
                    <Route exact path="/" component={Welcome} />
                    <Route exact path="/confirm" component={Queue} />
                    <Route exact path="/import" component={Import} />
                    <Route path="/main" component={Main} />
                </Switch>
            </MemoryRouter>
        );
    }
}

export default connect(state => ({
    confirmations: state.confirmations.confirmations,
    status: state.wallet.status
}))(App);
