import React, { Component } from 'react';
import './AccountView.css';

import Transactions from './Transactions/Transactions.js';

class AccountView extends Component {
    render() {
        return (
            <div className="accountView container">
                <div className="tabContainer">
                    <div className="tab active">Transactions</div>
                    <div className="tab">TOKENS</div>
                </div>

                <div className="contentContainer">
                    <Transactions />
                </div>
            </div>
        );
    }
}

export default AccountView;
