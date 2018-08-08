import React, { Component } from 'react';
import { NavLink, Route } from 'react-router-dom';
import './AccountView.css';

import Transactions from './Transactions';
import Tokens from './Tokens';

class AccountView extends Component {
    render() {
        return (
            <div className="accountView container">
                <div className="tabContainer">
                    <NavLink exact to="/main/transactions" className="tab" activeClassName="active">Transactions</NavLink>
                    <NavLink exact to="/main/tokens" className="tab" activeClassName="active">Tokens</NavLink>
                </div>

                <div className="contentContainer">
                    <Route exact path="/main/transactions" component={ Transactions } />
                    <Route exact path="/main/tokens" component={ Tokens } />
                </div>
            </div>
        );
    }
}

export default AccountView;
