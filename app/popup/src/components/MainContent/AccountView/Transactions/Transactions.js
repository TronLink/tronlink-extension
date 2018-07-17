import React, { Component } from 'react';
import './Transactions.css';

class Transactions extends Component {

    renderTransactions() {
        return (
            transactions.map((tx, i) => (
                
            ));
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
