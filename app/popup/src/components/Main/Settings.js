import React, { Component } from 'react';

import { ArrowLeftIcon } from '../../Icons.js';

import Header from './Header';
import Content from './Content';

import SettingsContent from './Content/Settings';

class Settings extends Component {
    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle="SETTINGS"
                    navbarLabel=""
                    leftIcon={true}
                    leftIconImg={<ArrowLeftIcon />}
                    leftIconRoute="/main/transactions"
                    rightIcon={false}
                />
                <Content>
                    <SettingsContent />
                </Content>
            </div>
        );
    }
}

export default Settings;
