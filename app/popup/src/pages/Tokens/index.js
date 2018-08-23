import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { SettingsIcon } from 'components/Icons';
import { popup } from 'index';

import Header from 'components/Header';

import './Tokens.css';

class Tokens extends Component {
    componentDidMount() {
        if(!this.props.account)
            return;

        if(this.props.account == undefined)
            return;

        if(!this.props.account.publicKey)
            return;

        popup.updateAccount(this.props.account.publicKey);
    }

    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle={ 'Token Balances' }
                    navbarLabel={ this.props.account.name || this.props.account.publicKey }
                    rightIconImg={ <SettingsIcon /> }
                    rightIconRoute="/main/settings"
                />
                <div className="mainContent">
                    <div className="accountView container">
                        <div className="contentContainer">
                            Should show tokens balances here (3 columns?)
                            Clicking on the token should show a dedicated page
                            with token info from the API if we ever get around
                            to doing that
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
}))(Tokens);
