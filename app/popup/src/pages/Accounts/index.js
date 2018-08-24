import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { SettingsIcon } from 'components/Icons';
import { popup } from 'index';
import { getAccounts } from 'reducers/wallet';

import Header from 'components/Header';

import './Accounts.css';

class Accounts extends Component {
    componentDidMount() {
        getAccounts();
        // update all accounts
        // get list of accounts after update?
    }

    createAccount() {
        // show popup here
        // if the previous 20 accounts have no balances show error (account gap)
        // (order by accountIndex descending, check for transactions)
        // transactions.filter(transactions && accountType == 'mnemonic' && internal: true).sortBy(indexDescending).length > 20
    }

    renderButtons() {
        return (
            <div className='buttons'>
                <div className='button'>
                    Create { /* this will show popup with name input */ }
                </div>
                <div className='button'>
                    Import { /* this will go to a full-screen import page */ }
                </div>
                <div className='button'>
                    Delete { /* this will show a confirmation popup */ }
                </div>
            </div>
        );
    }

    render() {
        console.log({ accounts: this.props.accounts });

        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle={ 'Accounts' }
                    navbarLabel={ this.props.account.name || this.props.account.publicKey }
                    rightIconImg={ <SettingsIcon /> }
                    rightIconRoute="/main/settings"
                />
                <div className="mainContent">
                    <div className="accountView container">
                        <div className="contentContainer">
                            { this.renderButtons() }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    accounts: state.wallet.accounts,
    account: state.wallet.account
}))(Accounts);
