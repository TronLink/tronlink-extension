import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import Transaction from './Transaction';

import './Transactions.css';

class Transactions extends Component {
    renderTransactions() {
        if (!this.props.account || this.props.account.transactions.length === 0) {
            return (
                <div className="infoMessageContainer">
                    <FormattedMessage id='account.transactions.noneFound' />
                </div>
            );
        }

        return (
            this.props.account.transactions.map(tx => (
                <Transaction 
                    txType={ tx.txType }
                    outgoing={ tx.isMine }
                    toAddress={ tx.toAddress }
                    ownerAddress={ tx.ownerAddress }
                    amount={ tx.amount }
                    date={ tx.date }
                    txID={ tx.txID }
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
