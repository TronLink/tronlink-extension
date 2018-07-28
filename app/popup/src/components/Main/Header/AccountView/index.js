import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import './AccountView.css';

class AccountView extends Component {
    state = {
        balance: 0
    }

    componentDidUpdate(prevProps) {
        if(this.props.account == prevProps.account)
            return;

        if(this.props.account) {
            this.setState({ 
                balance: (this.props.account.balance || 0) / 1000000
            });
        } else this.setState({ balance: 0 });
    };

    render() {
        const usdValue = Number(
            this.state.balance * this.props.price
        ).toFixed(2).toLocaleString();

        return (
            <div className="accountView container">
                <div className="accountBalance">
                    <span className="accountBalanceAmount">{ this.state.balance.toLocaleString() }</span>
                    <span className="accountBalanceTicker">TRX</span>
                    <div className="accountBalanceUSD">${ usdValue } USD</div>
                </div>

                <div className="buttonContainer">
                    <NavLink to="/main/confirm"><div className="accBtn button gradient">Send</div></NavLink>
                    <div className="accBtn button gradient">Buy</div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    price: state.wallet.price,
    account: state.wallet.account,
    selectedAccountId: state.selectedAccountId
}))(AccountView);
