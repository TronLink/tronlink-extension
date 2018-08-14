import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SettingsIcon, MoneyIcon } from 'components/Icons';
import { popup } from 'index';

import Header from 'components/Header';

import AccountViewHeader from 'components/Header/AccountView';
import AccountViewContent from './AccountView';

import { FormattedMessage } from 'react-intl';

class Account extends Component {
    componentDidMount() {
        if(!this.props.account)
            return;

        if(this.props.account == undefined)
            return;

        if(!this.props.account.address)
            return;

        popup.updateAccount(this.props.account.address);
    }

    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle="Default Account"
                    navbarLabel={ this.props.account.address }
                    leftIcon={ true }
                    leftIconImg={ <MoneyIcon /> }
                    leftIconRoute="/main/give"
                    rightIcon={ true }
                    rightIconImg={ <SettingsIcon /> }
                    rightIconRoute="/main/settings"
                >
                    <AccountViewHeader />
                </Header>
                <div className="mainContent">
                    <AccountViewContent />
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account,
    status: state.wallet.status
}))(Account);
