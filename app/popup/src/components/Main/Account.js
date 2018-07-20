import React, { Component } from 'react';

import { SettingsIcon } from '../../Icons.js';

import Header from './Header';
import Content from './Content';

import AccountViewHeader from './Header/AccountView';
import AccountViewContent from './Content/AccountView';

class Account extends Component {
    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle="ACCOUNT 1"
                    navbarLabel="0X548845F...F8XG"
                    leftIcon={false}
                    rightIcon={true}
                    rightIconImg={<SettingsIcon />}
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

export default Account;
