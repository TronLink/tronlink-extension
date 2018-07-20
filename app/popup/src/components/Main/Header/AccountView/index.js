import React, { Component } from 'react';
import './AccountView.css';

class AccountView extends Component {
    render() {
        return (
            <div className="accountView container">
                <div className="accountBalance">
                    <span className="accountBalanceAmount">5,300,314.504</span>
                    <span className="accountBalanceTicker">TRX</span>
                    <div className="accountBalanceUSD">3.55 USD</div>
                </div>

                <div className="buttonContainer">
                    <div className="accBtn button gradient">Send</div>
                    <div className="accBtn button gradient">Buy</div>
                </div>
            </div>
        );
    }
}

export default AccountView;
