import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SettingsIcon, MoneyIcon } from '../../Icons.js';

import Header from './Header';
import Content from './Content';

import AccountViewHeader from './Header/AccountView';
import AccountViewContent from './Content/AccountView';

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
                <Content>
                    <AccountViewContent />
                </Content>
            </div>
        );
    }
}

export default connect(state => ({
    account: state.wallet.account,
    status: state.wallet.status
}))(Account);
