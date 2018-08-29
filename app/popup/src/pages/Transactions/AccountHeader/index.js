import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Button from 'components/Button';

import './AccountHeader.css';

class AccountHeader extends Component {
    state = {
        balance: 0
    }

    _updateBalance() {
        if(this.props.account) {
            this.setState({ 
                balance: (this.props.account.balance || 0) / 1000000
            });
        } else this.setState({ balance: 0 });
    }

    componentDidUpdate(prevProps) {
        if(this.props.account == prevProps.account)
            return;

        this._updateBalance();
    };

    componentDidMount() {
        this._updateBalance();
    }

    render() {
        const usdValue = Number(
            this.state.balance * this.props.price
        ).toFixed(2).toLocaleString();

        return (
            <div className="accountHeader">
                <div className="accountBalance">
                    <span className="accountBalanceAmount">{ this.state.balance.toLocaleString() }</span>
                    <span className="accountBalanceTicker">TRX</span>
                    <div className="accountBalanceUSD">${ usdValue } USD</div>
                </div>
                { /* <div className='accountLabel'>
                    <span class='amount'>
                        36,319 Tron Power
                    </span>
                    <span class='label'>
                        Expires in 3 days
                    </span>
                </div> */ }
            </div>
        );
    }
}

export default connect(state => ({
    price: state.wallet.price,
    account: state.wallet.account
}))(AccountHeader);
