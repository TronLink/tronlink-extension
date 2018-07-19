import React, { Component } from 'react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import './MainContent.css';

import AccountView from './AccountView/AccountView.js';
import Transaction from './AccountView/Transactions/Transactions';

class MainContent extends Component {
    render() {
        return (
            <MemoryRouter className="mainContent">
                <Switch>
                    <Route path="/" exact component={AccountView} />
                    <Route path="/page1" exact component={Transaction} />
                </Switch>
            </MemoryRouter>
        );
    }
}

export default MainContent;
