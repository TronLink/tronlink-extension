import React, { Component } from 'react';

import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';

import SettingsContent from './SettingsView';

class Settings extends Component {
    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle="SETTINGS"
                    navbarLabel=""
                    leftIcon={ true }
                    leftIconImg={ <ArrowLeftIcon /> }
                    leftIconRoute="/main/transactions"
                    rightIcon={ false }
                />
                <div className="mainContent">
                    <SettingsContent />
                </div>
            </div>
        );
    }
}

export default Settings;
