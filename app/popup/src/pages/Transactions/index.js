import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { SettingsIcon, MoneyIcon } from 'components/Icons';
import { popup } from 'index';

import Header from 'components/Header';
import AccountHeader from './AccountHeader';
import Transaction from './Transaction';

import './Transactions.css';

class Transactions extends Component {
    componentDidMount() {
        if(!this.props.account)
            return;

        if(this.props.account == undefined)
            return;

        if(!this.props.account.publicKey)
            return;

        popup.updateAccount(this.props.account.publicKey);
    }

    renderTransactions() {
        const { account } = this.props;

        if(!account || !account.transactions || !account.transactions.length) {
            return (
                <div className="infoMessageContainer">
                    <FormattedMessage id='account.transactions.noneFound' />
                </div>
            );
        }
        
        return account.transactions.map(transaction => (
            <Transaction { ...transaction } />
        ));
    }

    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle={ 'Transaction History' }
                    navbarLabel={ this.props.account.name || this.props.account.publicKey }
                    leftIconImg={ <MoneyIcon /> }
                    leftIconRoute="/main/redeem"
                    rightIconImg={ <SettingsIcon /> }
                    rightIconRoute="/main/settings"
                />
                <div className="mainContent">
                    <AccountHeader />
                    <div className="accountView container">
                        <div className="transactionList">
                            <div className='transactionWarning'>
                                <FormattedMessage id='tron.is.broken' />
                            </div>
                            { this.renderTransactions() }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account,
    status: state.wallet.status
}))(Transactions);
