import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SettingsIcon, MoneyIcon } from 'components/Icons';

import Header from 'components/Header';

import AccountViewHeader from 'components/Header/AccountView';
import AccountViewContent from './AccountView';

class Account extends Component {
    render() {
        console.log(this.props.account)
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
