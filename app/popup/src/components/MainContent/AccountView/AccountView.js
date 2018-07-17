import React, { Component } from 'react';
import './AccountView.css';

import Transactions from './Transactions/Transactions.js';

class AccountView extends Component {
    render() {
        return (
            <div className="accountView container">
                <div className="tabContainer">
                    <div className="tab active">SENT</div>
                    <div className="tab">TOKENS</div>
                </div>

                <Transactions />
            </div>
        );
    }
}

export default AccountView;
