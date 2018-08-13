import React, { Component } from 'react';

import { ArrowLeftIcon } from 'components/Icons';

import Header from 'components/Header';

import SettingsContent from './SettingsView';

import { FormattedMessage } from 'react-intl';

class Settings extends Component {
    render() {
        return (
            <div class="mainContainer">
                <Header 
                    navbarTitle={ <FormattedMessage id='words.settings' /> }
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
