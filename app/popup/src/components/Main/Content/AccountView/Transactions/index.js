import React, { Component } from 'react';
import './Transactions.css';
import { connect } from 'react-redux';

import Transaction from './Transaction.js';

class Transactions extends Component {
    constructor(props) {
        super(props);
    }

    renderTransactions() {
        if (!this.props.account || this.props.account.transactions.length === 0) {
            return (
                <div className="infoMessageContainer">
                    <span>No Transactions Found</span>
                </div>
            );
        }

        return (
            this.props.account.transactions.map((tx, i) => (
                <Transaction 
                    txType={tx.txType}
                    txStatus={tx.txStatus}
                    address={tx.address}
                    amount={tx.amount}
                    label={tx.label}
                    date={tx.date}
                />
            ))
        );
    }

    render() {
        return (
            <div className="transactions">
                { this.renderTransactions() }
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account
}))(Transactions);
