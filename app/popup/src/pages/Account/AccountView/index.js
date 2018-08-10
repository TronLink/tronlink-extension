import React, { Component } from 'react';
import { NavLink, Route } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import './AccountView.css';

import Transactions from './Transactions';

class AccountView extends Component {
    render() {
        return (
            <div className="accountView container">
                <div className="tabContainer">
                    <NavLink exact to="/main/transactions" className="tab" activeClassName="active">
                        <FormattedMessage id='words.transactions' />
                    </NavLink>
                    <div exact to="/main/tokens" className="tab" activeClassName="active">
                        <FormattedMessage id='words.tokens' />
                    </div>
                </div>

                <div className="contentContainer">
                    <Route exact path="/main/transactions" component={ Transactions } />
                </div>
            </div>
        );
    }
}

export default AccountView;
