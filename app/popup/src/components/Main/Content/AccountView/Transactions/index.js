import React, { Component } from 'react';
import './Transactions.css';

import Transaction from './Transaction.js';

class Transactions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            transactions: [
                // txType: Type of Transaction, ex. Send, Receive, Token Purchase, Vote, etc. (controls icon)
                // txStatus: Status of Transaction, 0=Failed, 1=Success, 2=Rejected (controls text label)
                // address: Main address, shows on main TX screen.
                // amount: Amount of coin exchanged.
                // label: Label for Amount
                // date: Date of tx, unix timestamp
                { txType: 'TransferContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'ParticipateAssetIssueContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'FreezeBalanceContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'AssetIssueContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'VoteWitnessContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'TransferContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'ParticipateAssetIssueContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'FreezeBalanceContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'AssetIssueContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
                { txType: 'VoteWitnessContract', txStatus: '1', address: 'TR49EGZCB8495451BFDEFGDFH5', amount: '12558.225', label: 'TRX', date: Date.now() },
            ]
        };
    }

    renderTransactions() {
        return (
            this.state.transactions.map((tx, i) => (
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

export default Transactions;
